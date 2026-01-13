import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { WIZARD_STEPS, PHASE_LABELS, WizardPhase, WizardStepId } from '../../../types';

export const StepSidebar: React.FC = () => {
  const { wizard, setCurrentStep, canGoToWizardStep, isStepComplete } = useProjectStore();
  const phases: WizardPhase[] = ['concept', 'storyboard', 'production'];

  const completedRequiredCount = WIZARD_STEPS.filter(
    s => s.required && wizard.completedSteps.has(s.id)
  ).length;
  const totalRequired = WIZARD_STEPS.filter(s => s.required).length;
  const progressPercent = (completedRequiredCount / totalRequired) * 100;

  return (
    <div className="h-full flex flex-col text-white">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent-500 rounded-lg flex items-center justify-center font-semibold text-sm">
            TC
          </div>
          <div>
            <div className="font-semibold tracking-tight text-base">ToonCraft</div>
            <div className="text-[10px] text-slate-400">AI Studio</div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto py-3">
        {phases.map((phase) => {
          const phaseSteps = WIZARD_STEPS.filter(s => s.phase === phase);

          return (
            <div key={phase} className="mb-5">
              {/* Phase Header */}
              <div className="px-4 py-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {PHASE_LABELS[phase].labelKo}
                </span>
              </div>

              {/* Steps in Phase */}
              {phaseSteps.map((step) => {
                const isActive = wizard.currentStepId === step.id;
                const isComplete = wizard.completedSteps.has(step.id);
                const isSkipped = wizard.skippedSteps.has(step.id);
                const canNavigate = canGoToWizardStep(step.id);

                return (
                  <button
                    key={step.id}
                    onClick={() => canNavigate && setCurrentStep(step.id)}
                    disabled={!canNavigate}
                    className={`
                      w-full px-4 py-2.5 flex items-center gap-3 text-left transition-all duration-150
                      ${isActive
                        ? 'bg-slate-800 border-l-2 border-accent-400'
                        : 'border-l-2 border-transparent hover:bg-slate-800/50'
                      }
                      ${!canNavigate && 'opacity-40 cursor-not-allowed'}
                    `}
                  >
                    {/* Step Number/Check */}
                    <div className={`
                      w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-medium transition-all
                      ${isComplete
                        ? 'bg-accent-500 text-white'
                        : isActive
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-700 text-slate-400'
                      }
                    `}>
                      {isComplete ? '✓' : step.icon}
                    </div>

                    {/* Step Label */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {step.labelKo}
                      </div>
                      {!step.required && (
                        <div className="text-[10px] text-slate-600">
                          {isSkipped ? '건너뜀' : '선택사항'}
                        </div>
                      )}
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Progress Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>진행률</span>
          <span className="font-medium">{completedRequiredCount}/{totalRequired}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
