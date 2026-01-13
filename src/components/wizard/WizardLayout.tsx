import React from 'react';
import { Header } from '../layout/Header';
import { StepIndicator } from '../layout/StepIndicator';
import { StepFooter } from '../layout/StepFooter';
import { useProjectStore } from '../../store/projectStore';
import { WIZARD_STEPS, WizardStepId } from '../../../types';

// Step components
import { UnifiedConceptEditor } from '../concept/UnifiedConceptEditor';
import { BlueprintStep } from '../steps/storyboard/BlueprintStep';
import { RenderStep } from '../steps/production/RenderStep';

// Legacy imports (for backwards compatibility)
import { IdeaStep } from '../steps/concept/IdeaStep';
import { GenreStep } from '../steps/concept/GenreStep';
import { StyleStep } from '../steps/concept/StyleStep';
import { CharacterStep } from '../steps/concept/CharacterStep';
import { StyleRefStep } from '../steps/concept/StyleRefStep';

const STEP_COMPONENTS: Record<WizardStepId, React.FC> = {
  concept: UnifiedConceptEditor,
  idea: IdeaStep,
  genre: GenreStep,
  style: StyleStep,
  characters: CharacterStep,
  styleRef: StyleRefStep,
  blueprint: BlueprintStep,
  render: RenderStep,
};

export const WizardLayout: React.FC = () => {
  const { wizard } = useProjectStore();
  const StepComponent = STEP_COMPONENTS[wizard.currentStepId];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      {/* Header - Fixed */}
      <Header />

      {/* Step Indicator - Fixed */}
      <StepIndicator />

      {/* Main Content - Flex grow with internal scroll */}
      <main className="flex-1 min-h-0 overflow-auto">
        {StepComponent && <StepComponent />}
      </main>

      {/* Footer Navigation - Fixed */}
      <StepFooter />
    </div>
  );
};
