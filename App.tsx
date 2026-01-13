import React, { useEffect, useState } from 'react';
import { AppStep } from './types';
import { useProjectStore } from './src/store/projectStore';
import { getApiKey } from './services/geminiService';

// Layout
import { Toast } from './src/components/ui/Toast';
import { ProgressBar } from './src/components/ui/ProgressBar';
import { WizardLayout } from './src/components/wizard/WizardLayout';

// Components
import { WebtoonViewer } from './components/WebtoonViewer';
import { ApiKeyModal } from './src/components/ApiKeyModal';

const App: React.FC = () => {
  const { step, setStep, project } = useProjectStore();
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check API key on mount
  useEffect(() => {
    const apiKey = getApiKey();
    setHasApiKey(!!apiKey);
  }, []);

  // Handle API key set from modal
  const handleApiKeySet = () => {
    setHasApiKey(true);
  };

  // Loading state
  if (hasApiKey === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="text-white text-center">
          <div className="w-16 h-16 bg-toon-500 mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-ink-400">Loading...</p>
        </div>
      </div>
    );
  }

  // API Key not configured - Show modal
  if (!hasApiKey) {
    return <ApiKeyModal onApiKeySet={handleApiKeySet} />;
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
