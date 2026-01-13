import React from 'react';
import { AppStep } from '../../types';
import { useProjectStore } from '../store/projectStore';
import { Button } from '../../components/Button';

export const StoryboardPage: React.FC = () => {
  const {
    project,
    expandedPanels,
    setProject,
    setStep,
    togglePanel,
    expandAllPanels,
    collapseAllPanels,
    updatePanelByIndex
  } = useProjectStore();

  const allExpanded = expandedPanels.size === project.panels.length;

  const handleToggleAll = () => {
    if (allExpanded) {
      collapseAllPanels();
    } else {
      expandAllPanels();
    }
  };

  return (
    <div className="animate-fade-in space-y-12">
      {/* Header */}
      <div className="border-b-2 border-ink-900 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-toon-600 text-white flex items-center justify-center font-mono text-sm font-bold shadow-toon-sm">02</span>
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">Structure Phase</span>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-black tracking-tight text-ink-900">
            Edit <span className="text-toon-600">Blueprint</span>
          </h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleToggleAll} size="sm">
              {allExpanded ? '모두 접기' : '모두 펼치기'}
            </Button>
            <Button
              onClick={() => setStep(AppStep.PRODUCTION)}
              variant="toon"
              size="lg"
            >
              START PRODUCTION
            </Button>
          </div>
        </div>
      </div>

      {/* Character Reference Bible */}
      <div className="bg-warm-100 border-2 border-ink-900 shadow-toon p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-toon-500 rounded-full" />
          <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wider">
            Character Reference Bible (Auto-Generated)
          </h3>
        </div>
        <textarea
          value={project.characterVisuals}
          onChange={(e) => setProject({ characterVisuals: e.target.value })}
          className="w-full h-32 bg-white border-2 border-ink-200 p-4 font-mono text-sm leading-relaxed outline-none focus:border-toon-500 transition-colors"
          placeholder="캐릭터 외형에 대한 상세 설명이 여기에 표시됩니다..."
          aria-label="캐릭터 비주얼 설명"
        />
      </div>

      {/* Panel List */}
      <div className="grid gap-4">
        {project.panels.map((panel, index) => (
          <div
            key={panel.id}
            className="bg-white border-2 border-ink-200 group hover:border-ink-900 hover:shadow-toon-sm transition-all"
          >
            {/* Panel Header */}
            <button
              onClick={() => togglePanel(index)}
              className="w-full grid grid-cols-12 items-center p-4 text-left hover:bg-warm-50"
              aria-expanded={expandedPanels.has(index)}
              aria-controls={`panel-content-${index}`}
            >
              <div className="col-span-1">
                <span className="w-8 h-8 bg-ink-200 group-hover:bg-ink-900 text-ink-500 group-hover:text-white flex items-center justify-center font-mono text-sm font-bold transition-colors">
                  {index + 1}
                </span>
              </div>
              <div className="col-span-9 truncate text-sm font-medium text-ink-600">
                {panel.description || panel.descriptionKo || '설명 없음'}
              </div>
              <div className="col-span-2 flex justify-end items-center gap-2">
                <span className="text-[10px] text-ink-400 bg-warm-100 px-2 py-1">{panel.cameraAngle}</span>
                <span
                  className={`w-5 h-5 bg-ink-100 flex items-center justify-center text-ink-500 transition-transform ${
                    expandedPanels.has(index) ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </div>
            </button>

            {/* Panel Content - Collapsible */}
            {expandedPanels.has(index) && (
              <div
                id={`panel-content-${index}`}
                className="grid lg:grid-cols-12 border-t-2 border-ink-200 animate-fade-in"
              >
                {/* Visual Script */}
                <div className="lg:col-span-6 p-6 space-y-4">
                  <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                    Visual Script (EN)
                  </label>
                  <textarea
                    value={panel.description}
                    onChange={(e) =>
                      updatePanelByIndex(index, { description: e.target.value })
                    }
                    className="w-full h-24 bg-warm-50 outline-none text-sm font-medium resize-none border-2 border-ink-200 p-4 focus:border-toon-500 transition-colors"
                    aria-label={`패널 ${index + 1} 영문 설명`}
                  />
                  <p className="text-xs text-ink-400 font-serif border-t-2 border-ink-100 pt-4 italic">
                    {panel.descriptionKo}
                  </p>
                </div>

                {/* Dialogue & Caption */}
                <div className="lg:col-span-6 bg-warm-100 p-6 space-y-6">
                  <div>
                    <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-toon-500 rounded-full" />
                      Dialogue (말풍선에 포함됨)
                    </label>
                    <input
                      value={panel.dialogue}
                      onChange={(e) =>
                        updatePanelByIndex(index, { dialogue: e.target.value })
                      }
                      className="w-full bg-white p-3 border-2 border-ink-200 font-bold outline-none focus:border-toon-500 transition-colors"
                      placeholder="대사를 입력하세요"
                      aria-label={`패널 ${index + 1} 대사`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-warm-500 rounded-full" />
                      Caption (나레이션 - 말풍선에 포함됨)
                    </label>
                    <input
                      value={panel.caption}
                      onChange={(e) =>
                        updatePanelByIndex(index, { caption: e.target.value })
                      }
                      className="w-full bg-white p-3 border-2 border-ink-200 font-serif outline-none focus:border-toon-500 transition-colors"
                      placeholder="나레이션을 입력하세요"
                      aria-label={`패널 ${index + 1} 캡션`}
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

export default StoryboardPage;
