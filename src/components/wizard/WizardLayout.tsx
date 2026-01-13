import React from 'react';
import { StepSidebar } from './StepSidebar';
import { ContentArea } from './ContentArea';
import { PreviewPanel } from './PreviewPanel';

export const WizardLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-warm-50">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-[280px_1fr_400px] h-full">
        {/* Left Sidebar - Step Navigator */}
        <aside className="h-full overflow-y-auto border-r-4 border-ink-900 bg-ink-900">
          <StepSidebar />
        </aside>

        {/* Center - Main Content Area */}
        <main className="h-full overflow-y-auto bg-warm-50">
          <ContentArea />
        </main>

        {/* Right Panel - Preview */}
        <aside className="h-full overflow-y-auto border-l-4 border-ink-900 bg-warm-100">
          <PreviewPanel />
        </aside>
      </div>
    </div>
  );
};
