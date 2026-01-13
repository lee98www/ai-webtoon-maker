import React, { useState } from 'react';
import { AppStep } from '../../../types';
import { useProjectStore, canGoToStep } from '../../store/projectStore';
import { ApiKeyModal, clearStoredApiKey } from '../ApiKeyModal';

const NAV_ITEMS = [
  { step: AppStep.CONCEPT, label: 'Planning', icon: '01' },
  { step: AppStep.STORYBOARD, label: 'Structure', icon: '02' },
  { step: AppStep.PRODUCTION, label: 'Render', icon: '03' }
] as const;

export const Navigation: React.FC = () => {
  const { step, project, setStep, setProject, setIdeaInput, setError } = useProjectStore();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const navigateToStep = (targetStep: AppStep) => {
    if (canGoToStep(targetStep, project)) {
      setStep(targetStep);
    }
  };

  const handleExport = () => {
    const exportData = {
      version: '1.0' as const,
      exportedAt: new Date().toISOString(),
      project,
      metadata: {
        panelCount: project.panels.length,
        hasImages: project.panels.some((p) => p.generatedImageUrl),
        characterCount: project.characters.length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tooncraft-${project.title || 'untitled'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.version !== '1.0') {
          throw new Error('지원하지 않는 파일 형식입니다.');
        }

        setProject(data.project);
        setIdeaInput(data.project.synopsis || '');

        if (data.project.panels.length > 0) {
          setStep(AppStep.STORYBOARD);
        }
      } catch (err) {
        console.error('Import failed:', err);
        setError({
          message: '파일을 불러오는데 실패했습니다.',
          type: 'error'
        });
      }
    };
    input.click();
  };

  return (
    <nav
      className="border-b-4 border-ink-900 sticky top-0 z-50 bg-warm-50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Top Bar - Logo & Actions */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-ink-200">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-ink-900 shadow-toon-sm flex items-center justify-center">
            <span className="text-white font-black text-sm">TC</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-ink-900">TOONCRAFT</span>
            <span className="text-[10px] text-toon-600 font-bold tracking-[0.3em] -mt-1">AI WEBTOON STUDIO</span>
          </div>
        </div>

        {/* Project Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="h-10 px-4 text-xs font-bold tracking-wider uppercase border-2 border-ink-200 text-ink-500 hover:border-ink-900 hover:text-ink-900 hover:bg-warm-100 transition-all flex items-center gap-2"
            aria-label="API 키 설정"
            title="API 키 변경"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            API Key
          </button>
          <button
            onClick={handleImport}
            className="h-10 px-5 text-xs font-bold tracking-wider uppercase border-2 border-ink-300 text-ink-600 hover:border-ink-900 hover:text-ink-900 hover:bg-warm-100 transition-all"
            aria-label="프로젝트 불러오기"
          >
            Load Project
          </button>
          <button
            onClick={handleExport}
            disabled={!project.title && project.panels.length === 0}
            className="h-10 px-5 text-xs font-bold tracking-wider uppercase bg-toon-600 text-white border-2 border-ink-900 shadow-toon-sm hover:bg-toon-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-toon"
            aria-label="프로젝트 저장하기"
          >
            Save Project
          </button>
        </div>
      </div>

      {/* Bottom Bar - Step Navigation */}
      <div className="flex items-center justify-center px-8 py-3 bg-warm-100/50">
        <div className="flex items-center gap-0">
          {NAV_ITEMS.map(({ step: navStep, label, icon }, index) => {
            const isActive = step === navStep;
            const canNavigate = canGoToStep(navStep, project);
            const isPast = NAV_ITEMS.findIndex(item => item.step === step) > index;

            return (
              <div key={navStep} className="flex items-center">
                <button
                  onClick={() => navigateToStep(navStep)}
                  disabled={!canNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-3 px-6 py-2.5 text-xs font-bold tracking-wider uppercase
                    transition-all duration-200 border-2
                    ${isActive
                      ? 'bg-ink-900 text-white border-ink-900 shadow-toon-sm'
                      : isPast
                        ? 'bg-toon-100 text-toon-700 border-toon-300 hover:bg-toon-200'
                        : canNavigate
                          ? 'bg-white text-ink-600 border-ink-200 hover:border-ink-900 hover:text-ink-900'
                          : 'bg-warm-100 text-ink-300 border-ink-100 cursor-not-allowed'
                    }
                  `}
                >
                  <span className={`
                    w-6 h-6 flex items-center justify-center text-xs font-mono font-bold
                    ${isActive
                      ? 'bg-toon-500 text-white'
                      : isPast
                        ? 'bg-toon-500 text-white'
                        : 'bg-ink-200 text-ink-500'
                    }
                  `}>
                    {isPast ? '✓' : icon}
                  </span>
                  <span>{label}</span>
                </button>
                {index < NAV_ITEMS.length - 1 && (
                  <div className={`w-8 h-0.5 ${isPast ? 'bg-toon-500' : 'bg-ink-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <ApiKeyModal
          onApiKeySet={() => setShowApiKeyModal(false)}
          onClose={() => setShowApiKeyModal(false)}
          isChanging={true}
        />
      )}
    </nav>
  );
};

export default Navigation;
