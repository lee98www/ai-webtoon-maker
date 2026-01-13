import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { WIZARD_STEPS } from '../../../types';

export const StepFooter: React.FC = () => {
  const {
    wizard,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    markStepSkipped,
    isStepComplete
  } = useProjectStore();

  const currentStep = WIZARD_STEPS.find(s => s.id === wizard.currentStepId);
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === wizard.currentStepId);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === WIZARD_STEPS.length - 1;

  const handleNext = () => {
    if (isStepComplete(wizard.currentStepId)) {
      markStepComplete(wizard.currentStepId);
    }
    goToNextStep();
  };

  const handleSkip = () => {
    markStepSkipped(wizard.currentStepId);
    goToNextStep();
  };

  return (
    <footer className="h-16 border-t border-slate-200 bg-white px-6 flex items-center justify-center shrink-0">
      <div className="w-full max-w-4xl flex justify-between items-center">
        {/* Previous Button */}
        <button
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
            ${isFirstStep
              ? 'opacity-0 pointer-events-none'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>이전 단계</span>
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`
                w-2 h-2 rounded-full transition-all
                ${index === currentIndex
                  ? 'w-6 bg-slate-900'
                  : wizard.completedSteps.has(step.id)
                    ? 'bg-emerald-500'
                    : 'bg-slate-300'
                }
              `}
            />
          ))}
        </div>

        {/* Next Button */}
        <div className="flex items-center gap-3">
          {!currentStep?.required && !isLastStep && (
            <button
              onClick={handleSkip}
              className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              건너뛰기
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isLastStep}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
              ${isLastStep
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800'
              }
            `}
          >
            <span>다음 단계</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};
