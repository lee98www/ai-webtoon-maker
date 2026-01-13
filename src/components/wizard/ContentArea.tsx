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
      <header className="border-b-4 border-ink-200 px-8 py-6 bg-white/50">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-toon-600 text-white flex items-center justify-center font-mono text-sm font-bold shadow-toon-sm">
            {currentStep?.icon}
          </span>
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">
            {currentStep?.label}
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-ink-900">
          {currentStep?.labelKo}
        </h1>
      </header>

      {/* Step Content */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl mx-auto step-enter">
          {StepComponent && <StepComponent />}
        </div>
      </main>

      {/* Step Footer */}
      <footer className="border-t-4 border-ink-200 px-8 py-6 bg-warm-100/50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={goToPreviousStep}
            disabled={isFirstStep}
            className={`
              px-6 py-3 font-bold text-sm border-2 border-ink-900 transition-all
              ${isFirstStep
                ? 'opacity-30 cursor-not-allowed bg-ink-100 text-ink-400'
                : 'bg-white text-ink-900 hover:bg-ink-100 shadow-toon-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              }
            `}
          >
            ← 이전
          </button>

          <div className="flex gap-3">
            {!currentStep?.required && (
              <button
                onClick={handleSkip}
                className="px-6 py-3 font-bold text-sm text-ink-500 hover:text-ink-900 transition-colors"
              >
                건너뛰기
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isLastStep}
              className={`
                px-6 py-3 font-bold text-sm border-2 border-ink-900 transition-all
                ${isLastStep
                  ? 'opacity-30 cursor-not-allowed bg-ink-100 text-ink-400'
                  : 'bg-toon-600 text-white hover:bg-toon-700 shadow-toon-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
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
