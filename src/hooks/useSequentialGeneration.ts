import { useCallback, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { PanelConfig, ArtStyle, Genre } from '../../types';
import { generatePanelImage } from '../../services/geminiService';

export type GenerationMode = 'sequential' | 'parallel';

interface GenerationState {
  isGenerating: boolean;
  currentIndex: number;
  failedPanels: string[];
  estimatedTimeRemaining: number | null;
}

interface UseSequentialGenerationOptions {
  mode: GenerationMode;
  onPanelComplete?: (panelId: string, imageUrl: string) => void;
  onError?: (panelId: string, error: Error) => void;
}

const AVERAGE_GENERATION_TIME_MS = 25000; // ~25 seconds per panel

export function useSequentialGeneration(options: UseSequentialGenerationOptions = { mode: 'sequential' }) {
  const { mode, onPanelComplete, onError } = options;

  const {
    project,
    setProcessing,
    setProgress,
    setError,
    updatePanel
  } = useProjectStore();

  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    currentIndex: -1,
    failedPanels: [],
    estimatedTimeRemaining: null
  });

  // Generate a single panel with references
  const generateSinglePanel = useCallback(
    async (panel: PanelConfig, panelIndex: number, previousImageUrl?: string): Promise<string | null> => {
      updatePanel(panel.id, { isGenerating: true });

      try {
        // Prepare character references (legacy)
        const characterRefs = project.characters
          .filter((c) => c.referenceImages.length > 0)
          .map((c) => ({
            name: c.name,
            description: c.description,
            image: c.referenceImages[0]
          }));

        // Prepare style reference
        const styleRef = project.styleRef?.images[0] || null;

        // 캐릭터 시트 이미지 (base64)
        const characterSheet = project.mainCharacterSheet?.sheetImageUrl || undefined;

        // 장소 시트 이미지 (base64)
        const locationSheet = project.locationSheet?.sheetImageUrl || undefined;

        // Generate with direct Gemini API call
        const url = await generatePanelImage(
          panel,
          project.artStyle,
          project.genre,
          project.characterVisuals,
          panelIndex,
          {
            characterRefs,
            styleRef,
            previousPanelImage: previousImageUrl,
            includeDialogue: true,  // 말풍선 AI 렌더링 활성화
            // 시트 참조 (일관성 강화)
            characterSheet,
            locationSheet,
            characterInfo: project.mainCharacterSheet,
            locationInfo: project.locationSheet
          }
        );

        updatePanel(panel.id, { generatedImageUrl: url, isGenerating: false });
        onPanelComplete?.(panel.id, url);
        return url;
      } catch (e) {
        updatePanel(panel.id, { isGenerating: false });
        const error = e instanceof Error ? e : new Error(`패널 ${panelIndex + 1} 생성 실패`);
        setError({ message: error.message, type: 'error' });
        onError?.(panel.id, error);

        setState(prev => ({
          ...prev,
          failedPanels: [...prev.failedPanels, panel.id]
        }));

        return null;
      }
    },
    [project, updatePanel, setError, onPanelComplete, onError]
  );

  // Sequential generation - one by one with previous panel reference
  const generateSequentially = useCallback(
    async (panels: Array<PanelConfig & { index: number }>) => {
      let previousImageUrl: string | undefined;
      const startTime = Date.now();

      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];

        setState(prev => ({
          ...prev,
          currentIndex: panel.index,
          estimatedTimeRemaining: (panels.length - i) * AVERAGE_GENERATION_TIME_MS
        }));

        setProgress({
          completed: i,
          total: panels.length,
          currentPanel: panel.index,
          status: 'generating'
        });

        const resultUrl = await generateSinglePanel(
          panel,
          panel.index,
          previousImageUrl
        );

        if (resultUrl) {
          previousImageUrl = resultUrl;
        }

        // Update estimated time based on actual average
        const elapsed = Date.now() - startTime;
        const avgPerPanel = elapsed / (i + 1);
        setState(prev => ({
          ...prev,
          estimatedTimeRemaining: Math.round((panels.length - i - 1) * avgPerPanel)
        }));

        setProgress({
          completed: i + 1,
          total: panels.length,
          status: i + 1 === panels.length ? 'done' : 'generating'
        });
      }
    },
    [generateSinglePanel, setProgress]
  );

  // Parallel generation - all at once (faster but less consistent)
  const generateInParallel = useCallback(
    async (panels: Array<PanelConfig & { index: number }>) => {
      setProgress({
        completed: 0,
        total: panels.length,
        status: 'generating'
      });

      let completed = 0;

      const promises = panels.map(async (panel) => {
        try {
          const resultUrl = await generateSinglePanel(panel, panel.index, undefined);
          completed++;
          setProgress({
            completed,
            total: panels.length,
            status: completed === panels.length ? 'done' : 'generating'
          });
          return resultUrl;
        } catch {
          completed++;
          setProgress({
            completed,
            total: panels.length,
            status: completed === panels.length ? 'done' : 'generating'
          });
          return null;
        }
      });

      await Promise.all(promises);
    },
    [generateSinglePanel, setProgress]
  );

  // Main generate function
  const generateAll = useCallback(async () => {
    const pendingPanels = project.panels
      .map((p, i) => ({ ...p, index: i }))
      .filter((p) => !p.generatedImageUrl);

    if (pendingPanels.length === 0) return;

    setState({
      isGenerating: true,
      currentIndex: -1,
      failedPanels: [],
      estimatedTimeRemaining: pendingPanels.length * AVERAGE_GENERATION_TIME_MS
    });

    setProcessing(true);

    try {
      if (mode === 'sequential') {
        await generateSequentially(pendingPanels);
      } else {
        await generateInParallel(pendingPanels);
      }
    } finally {
      setProcessing(false);
      setProgress(null);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentIndex: -1,
        estimatedTimeRemaining: null
      }));
    }
  }, [project.panels, mode, setProcessing, setProgress, generateSequentially, generateInParallel]);

  // Regenerate a single panel
  const regeneratePanel = useCallback(
    async (panelId: string) => {
      const panelIndex = project.panels.findIndex(p => p.id === panelId);
      if (panelIndex === -1) return;

      const panel = project.panels[panelIndex];

      // In sequential mode, use previous panel as reference
      let previousImageUrl: string | undefined;
      if (mode === 'sequential' && panelIndex > 0) {
        previousImageUrl = project.panels[panelIndex - 1]?.generatedImageUrl;
      }

      setState(prev => ({ ...prev, isGenerating: true }));

      try {
        await generateSinglePanel(panel, panelIndex, previousImageUrl);
      } finally {
        setState(prev => ({ ...prev, isGenerating: false }));
      }
    },
    [project.panels, mode, generateSinglePanel]
  );

  // Retry failed panels
  const retryFailed = useCallback(async () => {
    if (state.failedPanels.length === 0) return;

    const failedPanelData = state.failedPanels
      .map(id => {
        const index = project.panels.findIndex(p => p.id === id);
        return index !== -1 ? { ...project.panels[index], index } : null;
      })
      .filter((p): p is PanelConfig & { index: number } => p !== null);

    setState(prev => ({ ...prev, failedPanels: [], isGenerating: true }));
    setProcessing(true);

    try {
      if (mode === 'sequential') {
        await generateSequentially(failedPanelData);
      } else {
        await generateInParallel(failedPanelData);
      }
    } finally {
      setProcessing(false);
      setProgress(null);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [state.failedPanels, project.panels, mode, setProcessing, setProgress, generateSequentially, generateInParallel]);

  return {
    // State
    isGenerating: state.isGenerating,
    currentIndex: state.currentIndex,
    failedPanels: state.failedPanels,
    estimatedTimeRemaining: state.estimatedTimeRemaining,

    // Actions
    generateAll,
    regeneratePanel,
    retryFailed,

    // Computed
    pendingCount: project.panels.filter(p => !p.generatedImageUrl).length,
    completedCount: project.panels.filter(p => p.generatedImageUrl).length,
    hasFailedPanels: state.failedPanels.length > 0
  };
}

// Helper to format time remaining
export function formatTimeRemaining(ms: number | null): string {
  if (ms === null) return '';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `약 ${minutes}분 ${remainingSeconds}초 남음`;
  }
  return `약 ${seconds}초 남음`;
}
