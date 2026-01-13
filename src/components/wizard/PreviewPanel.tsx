import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { WIZARD_STEPS } from '../../../types';
import { ConceptPreview } from '../preview/ConceptPreview';
import { StoryboardPreview } from '../preview/StoryboardPreview';
import { ProductionPreview } from '../preview/ProductionPreview';

export const PreviewPanel: React.FC = () => {
  const { wizard } = useProjectStore();
  const currentStep = WIZARD_STEPS.find(s => s.id === wizard.currentStepId);

  const renderPreview = () => {
    switch (currentStep?.phase) {
      case 'concept':
        return <ConceptPreview />;
      case 'storyboard':
        return <StoryboardPreview />;
      case 'production':
        return <ProductionPreview />;
      default:
        return <ConceptPreview />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <header className="px-5 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-700">Preview</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">작업 내용이 실시간으로 반영됩니다</p>
      </header>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {renderPreview()}
      </div>
    </div>
  );
};
