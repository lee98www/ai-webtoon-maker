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
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-toon-600 flex items-center justify-center font-black text-sm shadow-toon-sm">
            TC
          </div>
          <div>
            <div className="font-black tracking-tight text-lg">TOONCRAFT</div>
            <div className="text-[10px] text-toon-400 tracking-widest">AI STUDIO</div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto py-4">
        {phases.map((phase) => {
          const phaseSteps = WIZARD_STEPS.filter(s => s.phase === phase);

          return (
            <div key={phase} className="mb-6">
              {/* Phase Header */}
              <div className="px-6 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-toon-500" />
                <span className="text-xs font-bold text-ink-400 uppercase tracking-wider">
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
                      w-full px-6 py-3 flex items-center gap-3 text-left transition-all duration-200
                      ${isActive
                        ? 'bg-ink-800 border-l-4 border-toon-500'
                        : 'border-l-4 border-transparent hover:bg-ink-800/50'
                      }
                      ${!canNavigate && 'opacity-40 cursor-not-allowed'}
                    `}
                  >
                    {/* Step Number/Check */}
                    <div className={`
                      w-7 h-7 flex items-center justify-center text-xs font-mono font-bold transition-all
                      ${isComplete
                        ? 'bg-toon-500 text-white'
                        : isActive
                          ? 'bg-white text-ink-900'
                          : 'bg-ink-700 text-ink-400'
                      }
                    `}>
                      {isComplete ? '✓' : step.icon}
                    </div>

                    {/* Step Label */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-ink-300'}`}>
                        {step.labelKo}
                      </div>
                      {!step.required && (
                        <div className="text-[10px] text-ink-500">
                          {isSkipped ? '건너뜀' : '선택사항'}
                        </div>
                      )}
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-toon-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Progress Footer */}
      <div className="p-6 border-t border-ink-700">
        <div className="flex justify-between text-xs text-ink-400 mb-2">
          <span>진행률</span>
          <span>{completedRequiredCount}/{totalRequired}</span>
        </div>
        <div className="h-2 bg-ink-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-toon-600 to-toon-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
