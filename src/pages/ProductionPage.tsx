import React, { useState } from 'react';
import { AppStep } from '../../types';
import { useProjectStore } from '../store/projectStore';
import { useSequentialGeneration, GenerationMode, formatTimeRemaining } from '../hooks/useSequentialGeneration';
import { Button } from '../../components/Button';

export const ProductionPage: React.FC = () => {
  const { project, isProcessing, setStep } = useProjectStore();
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

  return (
    <div className="animate-fade-in space-y-12">
      {/* Header */}
      <div className="border-b-2 border-ink-900 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-toon-600 text-white flex items-center justify-center font-mono text-sm font-bold shadow-toon-sm">03</span>
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">Render Phase</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-ink-900">
              Render <span className="text-toon-600">Panels</span>
            </h1>
            <p className="text-xs text-ink-500 mt-2">
              {mode === 'sequential'
                ? '순차 생성: 이전 패널을 참조하여 일관성 유지 (권장)'
                : '병렬 생성: 빠르지만 일관성이 낮을 수 있음'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={generateAll}
              isLoading={isProcessing || isGenerating}
              disabled={allCompleted}
              variant="toon"
              size="lg"
            >
              {completedCount > 0 ? 'CONTINUE RENDER' : 'RENDER ALL'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep(AppStep.VIEWER)}
              disabled={completedCount === 0}
              size="lg"
            >
              PUBLISH
            </Button>
          </div>
        </div>
      </div>

      {/* Mode Selector & Progress */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-warm-100 border-2 border-ink-200 p-4">
        {/* Mode Toggle */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Mode</span>
          <div className="flex border-2 border-ink-900">
            <button
              onClick={() => setMode('sequential')}
              disabled={isGenerating}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                mode === 'sequential'
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-700 hover:bg-ink-100'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              순차 (일관성↑)
            </button>
            <button
              onClick={() => setMode('parallel')}
              disabled={isGenerating}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-l-2 border-ink-900 ${
                mode === 'parallel'
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-700 hover:bg-ink-100'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              병렬 (속도↑)
            </button>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-toon-500 rounded-full" />
            <span className="text-ink-600">
              {completedCount}/{project.panels.length} 완료
            </span>
          </div>

          {isGenerating && estimatedTimeRemaining && (
            <div className="flex items-center gap-2 text-ink-500">
              <span className="w-2 h-2 bg-warm-500 rounded-full animate-pulse" />
              {formatTimeRemaining(estimatedTimeRemaining)}
            </div>
          )}

          {hasFailedPanels && !isGenerating && (
            <button
              onClick={retryFailed}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              {failedPanels.length}개 실패 - 재시도
            </button>
          )}
        </div>
      </div>

      {/* Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {project.panels.map((panel, index) => {
          const isCurrentlyGenerating = panel.isGenerating || (isGenerating && currentIndex === index);
          const isFailed = failedPanels.includes(panel.id);
          const hasPreviousReference = mode === 'sequential' && index > 0 && project.panels[index - 1]?.generatedImageUrl;

          return (
            <div key={panel.id} className="space-y-3 group">
              <div className={`aspect-[3/4] bg-warm-100 relative overflow-hidden border-2 transition-all ${
                isCurrentlyGenerating
                  ? 'border-toon-500 shadow-toon-blue'
                  : isFailed
                    ? 'border-red-400'
                    : 'border-ink-200 group-hover:border-ink-900 group-hover:shadow-toon'
              }`}>
                {/* Loading State */}
                {isCurrentlyGenerating && (
                  <div className="absolute inset-0 z-10 bg-warm-50/95 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-ink-900 border-t-toon-500 rounded-full animate-spin mb-4" />
                    <span className="text-[10px] font-bold tracking-widest text-ink-700 animate-pulse">
                      RENDERING CUT {index + 1}
                    </span>
                    <span className="text-[9px] text-ink-400 mt-2">
                      {mode === 'sequential' && index > 0 ? '이전 패널 참조 중...' : '말풍선 포함 생성 중...'}
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
                    <div className={`w-12 h-12 mb-4 flex items-center justify-center ${
                      isFailed ? 'bg-red-200' : 'bg-ink-200'
                    }`}>
                      <span className={`font-mono text-lg ${isFailed ? 'text-red-500' : 'text-ink-400'}`}>
                        {isFailed ? '!' : index + 1}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${
                      isFailed ? 'text-red-400' : 'text-ink-300'
                    }`}>
                      {isFailed ? 'FAILED' : `Cut ${index + 1}`}
                    </span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-ink-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => regeneratePanel(panel.id)}
                    disabled={isCurrentlyGenerating || isProcessing}
                    size="sm"
                  >
                    {panel.generatedImageUrl ? 'RE-GENERATE' : isFailed ? 'RETRY' : 'GENERATE'}
                  </Button>
                </div>

                {/* Sequence indicator */}
                {mode === 'sequential' && hasPreviousReference && !panel.generatedImageUrl && !isFailed && (
                  <div className="absolute top-2 left-2 bg-toon-600 text-white text-[9px] font-bold px-2 py-1">
                    이전 패널 참조 가능
                  </div>
                )}

                {/* Panel number badge */}
                <div className="absolute top-2 right-2 w-6 h-6 bg-ink-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                  {index + 1}
                </div>
              </div>

              {/* Panel Info */}
              <div className="px-1">
                <p className="text-[10px] font-bold uppercase text-ink-300 mb-1 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    panel.dialogue ? 'bg-toon-500' : panel.caption ? 'bg-warm-500' : 'bg-ink-300'
                  }`} />
                  {panel.dialogue ? 'Dialogue' : panel.caption ? 'Caption' : 'Script'}
                </p>
                <p className="text-xs font-medium text-ink-600 truncate">
                  {panel.dialogue || panel.caption || panel.descriptionKo || 'No text'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-warm-100 border-2 border-ink-200 p-6">
        <h4 className="font-bold text-ink-900 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-ink-900 text-white flex items-center justify-center text-xs">i</span>
          생성 모드 안내
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-bold text-ink-800 mb-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'sequential' ? 'bg-toon-500' : 'bg-ink-300'}`} />
              순차 생성 모드 {mode === 'sequential' && '(현재)'}
            </h5>
            <ul className="space-y-1.5 text-xs text-ink-500">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-toon-500 rounded-full mt-1.5 flex-shrink-0" />
                각 패널이 이전 패널을 참조하여 생성
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-toon-500 rounded-full mt-1.5 flex-shrink-0" />
                캐릭터와 배경의 일관성 유지
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-toon-500 rounded-full mt-1.5 flex-shrink-0" />
                패널당 약 20-30초 소요
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-ink-800 mb-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'parallel' ? 'bg-toon-500' : 'bg-ink-300'}`} />
              병렬 생성 모드 {mode === 'parallel' && '(현재)'}
            </h5>
            <ul className="space-y-1.5 text-xs text-ink-500">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-500 rounded-full mt-1.5 flex-shrink-0" />
                모든 패널을 동시에 생성
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-500 rounded-full mt-1.5 flex-shrink-0" />
                빠른 속도 (전체 약 30-40초)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-warm-500 rounded-full mt-1.5 flex-shrink-0" />
                일관성이 낮을 수 있음
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPage;
