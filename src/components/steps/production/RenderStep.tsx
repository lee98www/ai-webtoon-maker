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
    <div className="h-full flex bg-white">
      {/* Left: Webtoon Preview (Vertical Scroll) */}
      <div className="flex-1 flex flex-col">
        {/* Preview Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="font-semibold text-slate-900">웹툰 미리보기</h2>
            <p className="text-xs text-slate-500 mt-0.5">실제 웹툰 형태로 미리보기</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">{completedCount}/{project.panels.length} 완료</span>
          </div>
        </div>

        {/* Webtoon Vertical Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100">
          <div className="max-w-md mx-auto py-8 px-4">
            {/* Title Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4 text-center">
              <h3 className="text-lg font-bold text-slate-900">{project.title || '제목 없음'}</h3>
              {project.synopsis && (
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{project.synopsis}</p>
              )}
            </div>

            {/* Panels */}
            <div className="space-y-2">
              {project.panels.map((panel, index) => {
                const isCurrentlyGenerating = panel.isGenerating || (isGenerating && currentIndex === index);
                const isFailed = failedPanels.includes(panel.id);

                return (
                  <div key={panel.id} className="relative group">
                    {/* Panel Image */}
                    <div className={`
                      aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-sm transition-all
                      ${isCurrentlyGenerating ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                      ${isFailed ? 'ring-2 ring-red-400' : ''}
                    `}>
                      {isCurrentlyGenerating ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                          <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-3" />
                          <span className="text-sm text-slate-500">패널 {index + 1} 생성 중...</span>
                        </div>
                      ) : panel.generatedImageUrl ? (
                        <img
                          src={panel.generatedImageUrl}
                          alt={`Panel ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                          <div className={`
                            w-12 h-12 rounded-lg flex items-center justify-center mb-2
                            ${isFailed ? 'bg-red-100 text-red-500' : 'bg-slate-200 text-slate-400'}
                          `}>
                            <span className="text-lg font-bold">{isFailed ? '!' : index + 1}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {isFailed ? '생성 실패' : '이미지 대기 중'}
                          </span>
                        </div>
                      )}

                      {/* Regenerate Button (Hover) */}
                      {!isCurrentlyGenerating && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button
                            onClick={() => regeneratePanel(panel.id)}
                            disabled={isProcessing || isGenerating}
                            className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-100 transition"
                          >
                            {panel.generatedImageUrl ? '다시 생성' : isFailed ? '재시도' : '생성'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Dialogue/Caption Overlay */}
                    {(panel.dialogue || panel.caption) && panel.generatedImageUrl && (
                      <div className="mt-2 px-2">
                        {panel.dialogue && (
                          <p className="text-sm text-slate-800 font-medium">"{panel.dialogue}"</p>
                        )}
                        {panel.caption && (
                          <p className="text-xs text-slate-500 italic mt-1">{panel.caption}</p>
                        )}
                      </div>
                    )}

                    {/* Panel Number */}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-slate-900/80 text-white rounded-md flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* End Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-4 text-center">
              <p className="text-sm text-slate-500">To be continued...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-[340px] flex flex-col bg-slate-50 border-l border-slate-200">
        {/* Control Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-slate-900">렌더링 설정</h2>
        </div>

        {/* Control Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-3">
              생성 모드
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('sequential')}
                disabled={isGenerating}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${mode === 'sequential'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className={`text-sm font-medium ${mode === 'sequential' ? 'text-white' : 'text-slate-900'}`}>
                  순차 모드
                </span>
                <p className={`text-xs mt-1 ${mode === 'sequential' ? 'text-slate-300' : 'text-slate-500'}`}>
                  일관성 유지
                </p>
              </button>
              <button
                onClick={() => setMode('parallel')}
                disabled={isGenerating}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${mode === 'parallel'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className={`text-sm font-medium ${mode === 'parallel' ? 'text-white' : 'text-slate-900'}`}>
                  병렬 모드
                </span>
                <p className={`text-xs mt-1 ${mode === 'parallel' ? 'text-slate-300' : 'text-slate-500'}`}>
                  빠른 생성
                </p>
              </button>
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-3">
              진행 상황
            </label>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              {/* Progress Bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / project.panels.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {completedCount} / {project.panels.length} 패널
                </span>
                {isGenerating && estimatedTimeRemaining && (
                  <span className="text-slate-500">
                    {formatTimeRemaining(estimatedTimeRemaining)}
                  </span>
                )}
              </div>

              {hasFailedPanels && !isGenerating && (
                <button
                  onClick={retryFailed}
                  className="w-full mt-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  {failedPanels.length}개 실패 - 재시도
                </button>
              )}
            </div>
          </div>

          {/* Render Button */}
          <button
            onClick={generateAll}
            disabled={isProcessing || isGenerating || allCompleted}
            className={`
              w-full py-4 rounded-xl font-medium text-base transition-all flex items-center justify-center gap-2
              ${isProcessing || isGenerating || allCompleted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800'
              }
            `}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>렌더링 중... ({currentIndex + 1}/{project.panels.length})</span>
              </>
            ) : allCompleted ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>모든 패널 완료</span>
              </>
            ) : completedCount > 0 ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>이어서 렌더링</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>모든 패널 렌더링</span>
              </>
            )}
          </button>

          {/* Tips */}
          <div className="p-4 bg-slate-100 rounded-lg">
            <h4 className="text-xs font-medium text-slate-700 mb-2">팁</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• 순차 모드는 이전 패널을 참조하여 일관성을 유지합니다</li>
              <li>• 병렬 모드는 빠르지만 일관성이 낮을 수 있습니다</li>
              <li>• 개별 패널은 미리보기에서 클릭하여 재생성할 수 있습니다</li>
            </ul>
          </div>
        </div>

        {/* Export Section */}
        {allCompleted && (
          <div className="px-6 py-4 border-t border-slate-200 bg-white">
            <button className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>웹툰 내보내기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
