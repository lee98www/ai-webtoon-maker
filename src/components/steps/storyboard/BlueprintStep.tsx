import React from 'react';
import { useProjectStore } from '../../../store/projectStore';
import { generateStoryboard } from '../../../../services/geminiService';

export const BlueprintStep: React.FC = () => {
  const {
    project,
    ideaInput,
    expandedPanels,
    isProcessing,
    setProject,
    setProcessing,
    setError,
    togglePanel,
    expandAllPanels,
    collapseAllPanels,
    updatePanelByIndex,
    markStepComplete
  } = useProjectStore();

  const allExpanded = project.panels.length > 0 && expandedPanels.size === project.panels.length;

  const handleToggleAll = () => {
    if (allExpanded) {
      collapseAllPanels();
    } else {
      expandAllPanels();
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!project.synopsis && !ideaInput) return;
    setProcessing(true);
    try {
      const res = await generateStoryboard(project.synopsis || ideaInput, project.genre);
      setProject({
        ...res,
        synopsis: project.synopsis || ideaInput
      });
      markStepComplete('blueprint');
    } catch (e) {
      const message = e instanceof Error ? e.message : '콘티 생성 실패';
      setError({ message, type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  // No panels yet - show generate button
  if (project.panels.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-ink-500 leading-relaxed">
          8컷 스토리보드를 생성합니다. 이전 단계에서 입력한 아이디어를 기반으로 AI가 패널 구성을 생성합니다.
        </p>

        <div className="border-2 border-dashed border-ink-300 p-8 text-center bg-warm-50">
          <div className="w-16 h-16 bg-ink-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>

          {project.synopsis || ideaInput ? (
            <>
              <p className="text-ink-600 mb-2 font-medium">스토리가 준비되었습니다</p>
              <p className="text-ink-500 text-sm mb-6 max-w-md mx-auto">
                "{(project.synopsis || ideaInput).slice(0, 100)}..."
              </p>
              <button
                onClick={handleGenerateStoryboard}
                disabled={isProcessing}
                className={`
                  px-8 py-4 font-bold text-sm border-2 border-ink-900 transition-all
                  ${isProcessing
                    ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
                    : 'bg-toon-600 text-white hover:bg-toon-700 shadow-toon-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                  }
                `}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    스토리보드 생성 중...
                  </span>
                ) : (
                  'GENERATE 8-CUT STORYBOARD'
                )}
              </button>
            </>
          ) : (
            <p className="text-ink-500">
              스토리 아이디어 단계에서 내용을 먼저 입력해주세요
            </p>
          )}
        </div>
      </div>
    );
  }

  // Has panels - show editor
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-ink-500">
          각 패널의 내용을 편집하세요. 대사와 나레이션은 최종 이미지에 포함됩니다.
        </p>
        <button
          onClick={handleToggleAll}
          className="text-xs font-bold px-3 py-1.5 border-2 border-ink-200 hover:border-ink-900 transition-colors"
        >
          {allExpanded ? '모두 접기' : '모두 펼치기'}
        </button>
      </div>

      {/* Character Reference Bible */}
      <div className="bg-warm-100 border-2 border-ink-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-toon-500 rounded-full" />
          <label className="text-xs font-bold text-ink-500 uppercase tracking-wider">
            Character Reference
          </label>
        </div>
        <textarea
          value={project.characterVisuals}
          onChange={(e) => setProject({ characterVisuals: e.target.value })}
          className="w-full h-20 bg-white border-2 border-ink-200 p-3 font-mono text-xs leading-relaxed outline-none focus:border-toon-500 transition-colors resize-none"
          placeholder="캐릭터 외형에 대한 상세 설명..."
        />
      </div>

      {/* Panel List */}
      <div className="space-y-3">
        {project.panels.map((panel, index) => (
          <div
            key={panel.id}
            className="bg-white border-2 border-ink-200 group hover:border-ink-900 transition-all"
          >
            {/* Panel Header */}
            <button
              onClick={() => togglePanel(index)}
              className="w-full flex items-center gap-4 p-3 text-left hover:bg-warm-50"
            >
              <span className="w-7 h-7 bg-ink-200 group-hover:bg-ink-900 text-ink-500 group-hover:text-white flex items-center justify-center font-mono text-xs font-bold transition-colors flex-shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 truncate text-sm text-ink-600">
                {panel.descriptionKo || panel.description || '설명 없음'}
              </span>
              <span className="text-[10px] text-ink-400 bg-warm-100 px-2 py-1 flex-shrink-0">
                {panel.cameraAngle}
              </span>
              <span
                className={`w-5 h-5 bg-ink-100 flex items-center justify-center text-ink-500 text-xs transition-transform flex-shrink-0 ${
                  expandedPanels.has(index) ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {/* Panel Content - Collapsible */}
            {expandedPanels.has(index) && (
              <div className="border-t-2 border-ink-200 p-4 space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-ink-400 uppercase tracking-wider block mb-1.5">
                    Visual Script (EN)
                  </label>
                  <textarea
                    value={panel.description}
                    onChange={(e) =>
                      updatePanelByIndex(index, { description: e.target.value })
                    }
                    className="w-full h-20 bg-warm-50 outline-none text-sm resize-none border-2 border-ink-200 p-3 focus:border-toon-500 transition-colors"
                  />
                  <p className="text-xs text-ink-400 font-serif mt-2 italic">
                    {panel.descriptionKo}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 bg-toon-500 rounded-full" />
                      Dialogue
                    </label>
                    <input
                      value={panel.dialogue}
                      onChange={(e) =>
                        updatePanelByIndex(index, { dialogue: e.target.value })
                      }
                      className="w-full bg-white p-2.5 border-2 border-ink-200 font-bold text-sm outline-none focus:border-toon-500 transition-colors"
                      placeholder="대사"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 bg-warm-500 rounded-full" />
                      Caption
                    </label>
                    <input
                      value={panel.caption}
                      onChange={(e) =>
                        updatePanelByIndex(index, { caption: e.target.value })
                      }
                      className="w-full bg-white p-2.5 border-2 border-ink-200 font-serif text-sm outline-none focus:border-toon-500 transition-colors"
                      placeholder="나레이션"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
