import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { WIZARD_STEPS, PHASE_LABELS, WizardPhase } from '../../../types';

export const StepIndicator: React.FC = () => {
  const { wizard, setCurrentStep, canGoToWizardStep } = useProjectStore();

  return (
    <div className="h-20 border-b border-slate-200 bg-slate-50 px-6 flex items-center justify-center shrink-0">
      <div className="flex items-center gap-0">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = wizard.currentStepId === step.id;
          const isComplete = wizard.completedSteps.has(step.id);
          const canNavigate = canGoToWizardStep(step.id);
          const isLast = index === WIZARD_STEPS.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <button
                onClick={() => canNavigate && setCurrentStep(step.id)}
                disabled={!canNavigate}
                className={`
                  flex flex-col items-center gap-1.5 px-6 py-2 rounded-lg transition-all
                  ${canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'}
                  ${isActive ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
                `}
              >
                {/* Step Circle */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${isComplete
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }
                `}>
                  {isComplete ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Label */}
                <span className={`
                  text-xs font-medium whitespace-nowrap
                  ${isActive ? 'text-slate-900' : 'text-slate-500'}
                `}>
                  {step.labelKo}
                </span>
              </button>

              {/* Connector Line */}
              {!isLast && (
                <div className={`
                  w-16 h-0.5 mx-1
                  ${index < WIZARD_STEPS.findIndex(s => s.id === wizard.currentStepId)
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                  }
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
