import React, { useState } from 'react';
import { AppStep } from '../../types';
import { useProjectStore } from '../store/projectStore';
import { refineSynopsis, generateStoryboard } from '../../services/geminiService';
import { Button } from '../../components/Button';
import { IdeaInput } from '../components/concept/IdeaInput';
import { GenreSelector } from '../components/concept/GenreSelector';
import { StyleSelector } from '../components/concept/StyleSelector';
import { CharacterManager } from '../components/reference/CharacterManager';
import { StyleReference } from '../components/reference/StyleReference';

export const ConceptPage: React.FC = () => {
  const {
    project,
    ideaInput,
    isProcessing,
    setProject,
    setRefining,
    setProcessing,
    setStep,
    setError
  } = useProjectStore();

  const [showReferences, setShowReferences] = useState(false);

  const handleRefine = async () => {
    if (!ideaInput.trim()) return;
    setRefining(true);
    try {
      const refined = await refineSynopsis(ideaInput, project.genre);
      setProject({ synopsis: refined });
    } catch (e) {
      const message = e instanceof Error ? e.message : '시놉시스 발전 실패';
      setError({ message, type: 'error' });
    } finally {
      setRefining(false);
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
      setStep(AppStep.STORYBOARD);
    } catch (e) {
      const message = e instanceof Error ? e.message : '콘티 생성 실패';
      setError({ message, type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-12">
      {/* Header */}
      <div className="border-b-2 border-ink-900 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-toon-600 text-white flex items-center justify-center font-mono text-sm font-bold shadow-toon-sm">01</span>
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">Planning Phase</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-ink-900">
          Draft your <span className="text-toon-600">Story</span>
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left - Idea Input */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-ink-900 shadow-toon p-6">
            <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-3 block">
              Your Idea
            </label>
            <IdeaInput onRefine={handleRefine} />
          </div>

          {/* Synopsis Result */}
          {project.synopsis && (
            <div className="animate-slide-up bg-ink-900 text-white p-6 border-2 border-ink-900 shadow-toon-blue">
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

        {/* Right - Selectors */}
        <div className="space-y-6">
          <div className="bg-warm-100 border-2 border-ink-900 shadow-toon p-6">
            <GenreSelector />
          </div>
          <div className="bg-warm-100 border-2 border-ink-900 shadow-toon p-6">
            <StyleSelector />
          </div>
        </div>
      </div>

      {/* Reference Section Toggle */}
      <div className="border-2 border-ink-300 border-dashed p-4 bg-warm-50">
        <button
          onClick={() => setShowReferences(!showReferences)}
          className="flex items-center gap-3 w-full text-left"
        >
          <span
            className={`w-6 h-6 bg-ink-900 text-white flex items-center justify-center text-xs transition-transform ${
              showReferences ? 'rotate-45' : ''
            }`}
          >
            +
          </span>
          <div>
            <span className="text-sm font-bold text-ink-800">
              캐릭터 & 스타일 레퍼런스 설정
            </span>
            <span className="text-xs text-ink-400 ml-2">
              (일관된 캐릭터와 그림체를 위해 권장)
            </span>
          </div>
        </button>

        {showReferences && (
          <div className="mt-6 pt-6 border-t-2 border-ink-200 space-y-8 animate-fade-in">
            <CharacterManager />
            <StyleReference />
          </div>
        )}
      </div>

      {/* Generate Button */}
      {project.synopsis && (
        <div className="flex justify-between items-center bg-warm-200 border-2 border-ink-900 shadow-toon p-6 animate-slide-up">
          <div className="text-sm text-ink-600 flex flex-wrap gap-2">
            {project.characters.length > 0 && (
              <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-ink-200">
                <span className="w-2 h-2 bg-toon-500 rounded-full" />
                캐릭터 {project.characters.length}명
              </span>
            )}
            {project.styleRef && (
              <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-ink-200">
                <span className="w-2 h-2 bg-warm-500 rounded-full" />
                커스텀 스타일
              </span>
            )}
          </div>
          <Button
            onClick={handleGenerateStoryboard}
            isLoading={isProcessing}
            disabled={!project.synopsis.trim() && !ideaInput.trim()}
            variant="toon"
            size="lg"
          >
            GENERATE 8-CUT STORYBOARD
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConceptPage;
