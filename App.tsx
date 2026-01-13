import React, { useEffect } from 'react';
import { AppStep } from './types';
import { useProjectStore } from './src/store/projectStore';
import { checkApiHealth } from './services/geminiService';

// Layout
import { Toast } from './src/components/ui/Toast';
import { ProgressBar } from './src/components/ui/ProgressBar';
import { WizardLayout } from './src/components/wizard/WizardLayout';

// Components
import { WebtoonViewer } from './components/WebtoonViewer';
import { Button } from './components/Button';

// Declare global window type for AI Studio
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const { step, hasApiKey, setApiKey, setStep, project } = useProjectStore();

  // Check API connection on mount
  useEffect(() => {
    const checkApi = async () => {
      // Check AI Studio environment first
      if (window.aistudio && (await window.aistudio.hasSelectedApiKey())) {
        setApiKey(true);
        return;
      }
      // Check backend server
      const healthy = await checkApiHealth();
      setApiKey(healthy);
    };
    checkApi();
  }, [setApiKey]);

  // Handle API key selection (for AI Studio)
  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKey(true);
    }
  };

  // API Key not configured - Show activation screen
  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900 text-white p-12 pattern-dots">
        <div className="max-w-lg w-full text-center space-y-10 bg-warm-50 text-ink-900 p-16 border-4 border-ink-900 shadow-toon relative">
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-toon-500" />
          <div className="absolute top-4 right-4 w-3 h-3 bg-toon-500" />
          <div className="absolute bottom-4 left-4 w-3 h-3 bg-ink-900" />
          <div className="absolute bottom-4 right-4 w-3 h-3 bg-ink-900" />

          <div className="w-20 h-20 bg-ink-900 mx-auto shadow-toon flex items-center justify-center">
            <span className="text-white font-black text-3xl">TC</span>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">TOONCRAFT</h1>
            <p className="text-toon-600 font-bold text-sm tracking-[0.3em] mt-2">AI WEBTOON STUDIO</p>
          </div>

          <div className="h-px bg-ink-200 w-24 mx-auto" />

          <div className="space-y-4">
            <Button
              onClick={handleSelectKey}
              variant="toon"
              size="lg"
              className="w-full"
            >
              ACTIVATE ENGINE
            </Button>
            <p className="text-xs text-ink-500">
              API 서버에 연결 중... 서버가 실행 중인지 확인해주세요.
            </p>
          </div>

          <p className="text-[10px] text-ink-400 uppercase tracking-[0.3em]">
            AI-Powered Webtoon Creation Platform
          </p>
        </div>
      </div>
    );
  }

  // Viewer mode - Full screen webtoon view
  if (step === AppStep.VIEWER) {
    return (
      <WebtoonViewer
        project={project}
        onEdit={() => setStep(AppStep.PRODUCTION)}
      />
    );
  }

  // Main App Layout - Wizard UI
  return (
    <>
      <WizardLayout />
      {/* Global UI Components */}
      <ProgressBar />
      <Toast />
    </>
  );
};

export default App;
