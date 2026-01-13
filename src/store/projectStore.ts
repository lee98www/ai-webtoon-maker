import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppStep,
  Genre,
  ArtStyle,
  WebtoonProject,
  PanelConfig,
  CharacterReference,
  StyleReference,
  ErrorMessage,
  ProgressInfo,
  WizardStepId,
  WizardState,
  WIZARD_STEPS
} from '../../types';

// Set은 JSON 직렬화 불가하므로 Array로 변환
const setToArray = <T>(set: Set<T>): T[] => [...set];
const arrayToSet = <T>(arr: T[]): Set<T> => new Set(arr);

interface ProjectState {
  // App state
  step: AppStep;
  hasApiKey: boolean;

  // Project data
  project: WebtoonProject;

  // UI state
  ideaInput: string;
  isRefining: boolean;
  isProcessing: boolean;
  error: ErrorMessage | null;
  progress: ProgressInfo | null;
  expandedPanels: Set<number>;

  // Wizard state
  wizard: WizardState;

  // Actions - Navigation
  setStep: (step: AppStep) => void;
  setApiKey: (hasKey: boolean) => void;

  // Actions - Project
  setProject: (updates: Partial<WebtoonProject>) => void;
  resetProject: () => void;

  // Actions - Panels
  updatePanel: (id: string, updates: Partial<PanelConfig>) => void;
  updatePanelByIndex: (index: number, updates: Partial<PanelConfig>) => void;
  setPanels: (panels: PanelConfig[]) => void;

  // Actions - Character References
  addCharacter: (character: CharacterReference) => void;
  updateCharacter: (id: string, updates: Partial<CharacterReference>) => void;
  removeCharacter: (id: string) => void;

  // Actions - Style Reference
  setStyleRef: (styleRef: StyleReference | null) => void;

  // Actions - UI State
  setIdeaInput: (input: string) => void;
  setRefining: (isRefining: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: ErrorMessage | null) => void;
  setProgress: (progress: ProgressInfo | null) => void;
  togglePanel: (index: number) => void;
  expandAllPanels: () => void;
  collapseAllPanels: () => void;

  // Actions - Wizard
  setCurrentStep: (stepId: WizardStepId) => void;
  markStepComplete: (stepId: WizardStepId) => void;
  markStepSkipped: (stepId: WizardStepId) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoToWizardStep: (stepId: WizardStepId) => boolean;
  isStepComplete: (stepId: WizardStepId) => boolean;
}

const initialProject: WebtoonProject = {
  title: '',
  synopsis: '',
  characterVisuals: '',
  genre: Genre.ACTION,
  artStyle: ArtStyle.WEBTOON_STANDARD,
  panels: [],
  characters: [],
  styleRef: null
};

const initialWizard: WizardState = {
  currentStepId: 'concept',  // 새로운 통합 기획 화면부터 시작
  completedSteps: new Set(),
  skippedSteps: new Set(),
  visitedSteps: new Set(['concept'])
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial state
      step: AppStep.CONCEPT,
      hasApiKey: false,
      project: initialProject,
      ideaInput: '',
      isRefining: false,
      isProcessing: false,
      error: null,
      progress: null,
      expandedPanels: new Set([0]),
      wizard: initialWizard,

      // Navigation actions
      setStep: (step) => set({ step }),
      setApiKey: (hasApiKey) => set({ hasApiKey }),

  // Project actions
  setProject: (updates) => set((state) => ({
    project: { ...state.project, ...updates }
  })),

  resetProject: () => set({
    project: initialProject,
    step: AppStep.CONCEPT,
    ideaInput: '',
    expandedPanels: new Set([0]),
    wizard: initialWizard
  }),

  // Panel actions
  updatePanel: (id, updates) => set((state) => ({
    project: {
      ...state.project,
      panels: state.project.panels.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
    }
  })),

  updatePanelByIndex: (index, updates) => set((state) => ({
    project: {
      ...state.project,
      panels: state.project.panels.map((p, i) =>
        i === index ? { ...p, ...updates } : p
      )
    }
  })),

  setPanels: (panels) => set((state) => ({
    project: { ...state.project, panels }
  })),

  // Character reference actions
  addCharacter: (character) => set((state) => ({
    project: {
      ...state.project,
      characters: [...state.project.characters, character]
    }
  })),

  updateCharacter: (id, updates) => set((state) => ({
    project: {
      ...state.project,
      characters: state.project.characters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    }
  })),

  removeCharacter: (id) => set((state) => ({
    project: {
      ...state.project,
      characters: state.project.characters.filter((c) => c.id !== id)
    }
  })),

  // Style reference actions
  setStyleRef: (styleRef) => set((state) => ({
    project: { ...state.project, styleRef }
  })),

  // UI state actions
  setIdeaInput: (ideaInput) => set({ ideaInput }),
  setRefining: (isRefining) => set({ isRefining }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setError: (error) => set({ error }),
  setProgress: (progress) => set({ progress }),

  togglePanel: (index) => set((state) => {
    const newExpanded = new Set(state.expandedPanels);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    return { expandedPanels: newExpanded };
  }),

  expandAllPanels: () => set((state) => ({
    expandedPanels: new Set(state.project.panels.map((_, i) => i))
  })),

  collapseAllPanels: () => set({ expandedPanels: new Set() }),

  // Wizard actions
  setCurrentStep: (stepId) => set((state) => ({
    wizard: {
      ...state.wizard,
      currentStepId: stepId,
      visitedSteps: new Set([...state.wizard.visitedSteps, stepId])
    }
  })),

  markStepComplete: (stepId) => set((state) => {
    const newCompleted = new Set(state.wizard.completedSteps);
    newCompleted.add(stepId);
    const newSkipped = new Set(state.wizard.skippedSteps);
    newSkipped.delete(stepId);
    return {
      wizard: {
        ...state.wizard,
        completedSteps: newCompleted,
        skippedSteps: newSkipped
      }
    };
  }),

  markStepSkipped: (stepId) => set((state) => {
    const newSkipped = new Set(state.wizard.skippedSteps);
    newSkipped.add(stepId);
    return {
      wizard: {
        ...state.wizard,
        skippedSteps: newSkipped
      }
    };
  }),

  goToNextStep: () => {
    const state = get();
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === state.wizard.currentStepId);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentIndex + 1];
      set({
        wizard: {
          ...state.wizard,
          currentStepId: nextStep.id,
          visitedSteps: new Set([...state.wizard.visitedSteps, nextStep.id])
        }
      });
    }
  },

  goToPreviousStep: () => {
    const state = get();
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === state.wizard.currentStepId);
    if (currentIndex > 0) {
      const prevStep = WIZARD_STEPS[currentIndex - 1];
      set({
        wizard: {
          ...state.wizard,
          currentStepId: prevStep.id
        }
      });
    }
  },

  canGoToWizardStep: (stepId) => {
    const state = get();
    const targetStep = WIZARD_STEPS.find(s => s.id === stepId);
    if (!targetStep) return false;

    // Can always go back to visited steps
    if (state.wizard.visitedSteps.has(stepId)) return true;

    // Check if all required previous steps are completed
    const targetIndex = WIZARD_STEPS.findIndex(s => s.id === stepId);
    for (let i = 0; i < targetIndex; i++) {
      const step = WIZARD_STEPS[i];
      if (step.required && !state.wizard.completedSteps.has(step.id) && !state.wizard.skippedSteps.has(step.id)) {
        return false;
      }
    }
    return true;
  },

  isStepComplete: (stepId) => {
    const state = get();
    const { project, ideaInput } = state;

    switch (stepId) {
      // 새로운 통합 기획 단계
      case 'concept':
        const hasIdea = ideaInput.trim().length > 0 || project.synopsis.trim().length > 0;
        const hasGenre = project.genre !== null;
        const hasStyle = project.artStyle !== null;
        return hasIdea && hasGenre && hasStyle;
      // Legacy steps (하위 호환성)
      case 'idea':
        return ideaInput.trim().length > 0 || project.synopsis.trim().length > 0;
      case 'genre':
        return project.genre !== null;
      case 'style':
        return project.artStyle !== null;
      case 'characters':
        return true; // Optional
      case 'styleRef':
        return true; // Optional
      // 후반 단계들
      case 'blueprint':
        return project.panels.length > 0;
      case 'render':
        return project.panels.some(p => p.generatedImageUrl);
      default:
        return false;
    }
  }
    }),
    {
      name: 'tooncraft-project',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 저장할 항목만 선택 (일시적 UI 상태 제외)
        step: state.step,
        project: state.project,
        ideaInput: state.ideaInput,
        wizard: {
          currentStepId: state.wizard.currentStepId,
          completedSteps: setToArray(state.wizard.completedSteps),
          skippedSteps: setToArray(state.wizard.skippedSteps),
          visitedSteps: setToArray(state.wizard.visitedSteps),
        },
        expandedPanels: setToArray(state.expandedPanels),
      }),
      onRehydrateStorage: () => (state) => {
        // 복원 시 Array → Set 재변환
        if (state) {
          state.wizard = {
            ...state.wizard,
            completedSteps: arrayToSet(state.wizard.completedSteps as unknown as WizardStepId[]),
            skippedSteps: arrayToSet(state.wizard.skippedSteps as unknown as WizardStepId[]),
            visitedSteps: arrayToSet(state.wizard.visitedSteps as unknown as WizardStepId[]),
          };
          state.expandedPanels = arrayToSet(state.expandedPanels as unknown as number[]);
        }
      },
    }
  )
);

// Helper function to check if navigation to step is allowed
export const canGoToStep = (step: AppStep, project: WebtoonProject): boolean => {
  switch (step) {
    case AppStep.CONCEPT:
      return true;
    case AppStep.STORYBOARD:
      return project.panels.length > 0;
    case AppStep.PRODUCTION:
      return project.panels.length > 0;
    case AppStep.VIEWER:
      return project.panels.some((p) => p.generatedImageUrl);
    default:
      return false;
  }
};
