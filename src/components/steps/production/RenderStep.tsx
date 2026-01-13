import React, { useState } from 'react';
import { useProjectStore } from '../../../store/projectStore';
import { useSequentialGeneration, GenerationMode, formatTimeRemaining } from '../../../hooks/useSequentialGeneration';

export const RenderStep: React.FC = () => {
  const { project, isProcessing, markStepComplete } = useProjectStore();
  const [mode, setMode] = useState<GenerationMode>('sequential');

  const {
    isGenerating,
    currentIndex,
    failedPanels,
    estimatedTimeRemaining,
    generateAll,
    regeneratePanel,
    retryFailed,
    completedCount,
    hasFailedPanels
  } = useSequentialGeneration({ mode });

  const allCompleted = completedCount === project.panels.length;

  // Mark complete when at least one panel is rendered
  React.useEffect(() => {
    if (completedCount > 0) {
      markStepComplete('render');
    }
  }, [completedCount, markStepComplete]);

  return (
    <div className="space-y-6">
      <p className="text-ink-500 leading-relaxed">
        AI가 각 패널 이미지를 생성합니다. 순차 모드는 이전 패널을 참조하여 일관성을 유지합니다.
      </p>

      {/* Mode Selector & Progress */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-warm-100 border-2 border-ink-200 p-4">
        {/* Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-ink-500 uppercase">Mode</span>
          <div className="flex border-2 border-ink-900">
            <button
              onClick={() => setMode('sequential')}
              disabled={isGenerating}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                mode === 'sequential'
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-700 hover:bg-ink-100'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              순차
            </button>
            <button
              onClick={() => setMode('parallel')}
              disabled={isGenerating}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors border-l-2 border-ink-900 ${
                mode === 'parallel'
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-700 hover:bg-ink-100'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              병렬
            </button>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-toon-500 rounded-full" />
            <span className="text-ink-600">{completedCount}/{project.panels.length}</span>
          </div>

          {isGenerating && estimatedTimeRemaining && (
            <span className="text-ink-500">{formatTimeRemaining(estimatedTimeRemaining)}</span>
          )}

          {hasFailedPanels && !isGenerating && (
            <button
              onClick={retryFailed}
              className="text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              {failedPanels.length}개 실패
            </button>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateAll}
        disabled={isProcessing || isGenerating || allCompleted}
        className={`
          w-full py-4 font-bold text-sm border-2 border-ink-900 transition-all
          ${isProcessing || isGenerating || allCompleted
            ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
            : 'bg-toon-600 text-white hover:bg-toon-700 shadow-toon-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            렌더링 중... ({currentIndex + 1}/{project.panels.length})
          </span>
        ) : allCompleted ? (
          '모든 패널 렌더링 완료'
        ) : completedCount > 0 ? (
          'CONTINUE RENDER'
        ) : (
          'RENDER ALL PANELS'
        )}
      </button>

      {/* Panel Grid */}
      <div className="grid grid-cols-2 gap-4">
        {project.panels.map((panel, index) => {
          const isCurrentlyGenerating = panel.isGenerating || (isGenerating && currentIndex === index);
          const isFailed = failedPanels.includes(panel.id);

          return (
            <div key={panel.id} className="group">
              <div className={`
                aspect-[3/4] bg-warm-100 relative overflow-hidden border-2 transition-all
                ${isCurrentlyGenerating
                  ? 'border-toon-500'
                  : isFailed
                    ? 'border-red-400'
                    : 'border-ink-200 group-hover:border-ink-900'
                }
              `}>
                {/* Loading State */}
                {isCurrentlyGenerating && (
                  <div className="absolute inset-0 z-10 bg-warm-50/95 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-ink-900 border-t-toon-500 rounded-full animate-spin mb-3" />
                    <span className="text-[9px] font-bold tracking-widest text-ink-700">
                      CUT {index + 1}
                    </span>
                  </div>
                )}

                {/* Generated Image */}
                {panel.generatedImageUrl ? (
                  <img
                    src={panel.generatedImageUrl}
                    className="w-full h-full object-cover"
                    alt={`패널 ${index + 1}`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className={`w-10 h-10 mb-2 flex items-center justify-center ${
                      isFailed ? 'bg-red-200' : 'bg-ink-200'
                    }`}>
                      <span className={`font-mono ${isFailed ? 'text-red-500' : 'text-ink-400'}`}>
                        {isFailed ? '!' : index + 1}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase ${
                      isFailed ? 'text-red-400' : 'text-ink-300'
                    }`}>
                      {isFailed ? 'Failed' : `Cut ${index + 1}`}
                    </span>
                  </div>
                )}

                {/* Hover Overlay */}
                {!isCurrentlyGenerating && (
                  <div className="absolute inset-0 bg-ink-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => regeneratePanel(panel.id)}
                      disabled={isProcessing || isGenerating}
                      className="px-4 py-2 bg-white text-ink-900 font-bold text-xs border-2 border-ink-900 hover:bg-ink-100"
                    >
                      {panel.generatedImageUrl ? 'RE-GEN' : isFailed ? 'RETRY' : 'GEN'}
                    </button>
                  </div>
                )}

                {/* Panel number badge */}
                <div className="absolute top-1 right-1 w-5 h-5 bg-ink-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                  {index + 1}
                </div>
              </div>

              {/* Panel text info */}
              <div className="mt-1.5 px-0.5">
                <p className="text-[9px] text-ink-500 truncate">
                  {panel.dialogue || panel.caption || panel.descriptionKo?.slice(0, 30) || '-'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
