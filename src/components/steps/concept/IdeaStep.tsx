import React from 'react';
import { useProjectStore } from '../../../store/projectStore';
import { refineSynopsis } from '../../../../services/geminiService';

export const IdeaStep: React.FC = () => {
  const {
    ideaInput,
    setIdeaInput,
    isRefining,
    setRefining,
    project,
    setProject,
    setError,
    markStepComplete
  } = useProjectStore();

  const handleRefine = async () => {
    if (!ideaInput.trim()) return;
    setRefining(true);
    try {
      const refined = await refineSynopsis(ideaInput, project.genre);
      setProject({ synopsis: refined });
      markStepComplete('idea');
    } catch (e) {
      const message = e instanceof Error ? e.message : '시놉시스 발전 실패';
      setError({ message, type: 'error' });
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-ink-500 leading-relaxed">
        웹툰의 아이디어를 자유롭게 작성하세요. AI 스토리 닥터가 상업적 웹툰으로 정제합니다.
      </p>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={ideaInput}
            onChange={(e) => setIdeaInput(e.target.value)}
            className="w-full h-48 bg-white border-2 border-ink-200 p-4 text-base font-medium outline-none focus:border-toon-500 transition-all resize-none"
            placeholder="예: 현대 판타지, 주인공은 소멸 직전의 헌터 길드장. 10년 전 마왕을 봉인하며 모든 것을 잃었지만, 새로운 던전 폭주 사태로 다시 일어서야 한다..."
            aria-label="웹툰 아이디어 입력"
          />
        </div>

        <button
          onClick={handleRefine}
          disabled={!ideaInput.trim() || isRefining}
          className={`
            w-full py-4 font-bold text-sm border-2 border-ink-900 transition-all
            ${!ideaInput.trim() || isRefining
              ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
              : 'bg-toon-600 text-white hover:bg-toon-700 shadow-toon-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
            }
          `}
        >
          {isRefining ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              스토리 정제 중...
            </span>
          ) : (
            'REFINE STORY'
          )}
        </button>
      </div>

      {/* Refined Synopsis Result */}
      {project.synopsis && (
        <div className="mt-8 bg-ink-900 text-white p-6 border-2 border-ink-900 shadow-toon-blue animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-toon-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-toon-300">
              Refined Synopsis
            </span>
          </div>
          <p className="text-lg font-serif leading-relaxed italic text-warm-100">
            "{project.synopsis}"
          </p>
        </div>
      )}
    </div>
  );
};
