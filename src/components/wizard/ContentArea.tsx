import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { WIZARD_STEPS, WizardStepId } from '../../../types';

// Step components
import { UnifiedConceptEditor } from '../concept/UnifiedConceptEditor';
import { BlueprintStep } from '../steps/storyboard/BlueprintStep';
import { RenderStep } from '../steps/production/RenderStep';

// Legacy imports (for backwards compatibility if needed)
import { IdeaStep } from '../steps/concept/IdeaStep';
import { GenreStep } from '../steps/concept/GenreStep';
import { StyleStep } from '../steps/concept/StyleStep';
import { CharacterStep } from '../steps/concept/CharacterStep';
import { StyleRefStep } from '../steps/concept/StyleRefStep';

const STEP_COMPONENTS: Record<WizardStepId, React.FC> = {
  concept: UnifiedConceptEditor,  // 새로운 통합 기획 화면
  idea: IdeaStep,         // legacy
  genre: GenreStep,       // legacy
  style: StyleStep,       // legacy
  characters: CharacterStep, // legacy
  styleRef: StyleRefStep, // legacy
  blueprint: BlueprintStep,
  render: RenderStep,
};

export const ContentArea: React.FC = () => {
  const {
    wizard,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    markStepSkipped,
    isStepComplete
  } = useProjectStore();

  const currentStep = WIZARD_STEPS.find(s => s.id === wizard.currentStepId);
  const StepComponent = STEP_COMPONENTS[wizard.currentStepId];
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
    <div className="h-full flex flex-col">
      {/* Step Header */}
      <header className="border-b border-slate-200 px-6 py-5 bg-white">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-7 h-7 bg-accent-500 text-white rounded-md flex items-center justify-center font-mono text-xs font-medium">
            {currentStep?.icon}
          </span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {currentStep?.label}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          {currentStep?.labelKo}
        </h1>
      </header>

      {/* Step Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto step-enter">
          {StepComponent && <StepComponent />}
        </div>
      </main>

      {/* Step Footer */}
      <footer className="border-t border-slate-200 px-6 py-4 bg-slate-50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={goToPreviousStep}
            disabled={isFirstStep}
            className={`
              px-4 py-2.5 font-medium text-sm rounded-md border transition-all
              ${isFirstStep
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }
            `}
          >
            ← 이전
          </button>

          <div className="flex gap-3">
            {!currentStep?.required && (
              <button
                onClick={handleSkip}
                className="px-4 py-2.5 font-medium text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                건너뛰기
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isLastStep}
              className={`
                px-4 py-2.5 font-medium text-sm rounded-md border transition-all
                ${isLastStep
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-accent-500 text-white border-accent-500 hover:bg-accent-600 hover:border-accent-600'
                }
              `}
            >
              다음 →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
