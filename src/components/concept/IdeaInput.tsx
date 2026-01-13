import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Button } from '../../../components/Button';

interface IdeaInputProps {
  onRefine: () => Promise<void>;
}

export const IdeaInput: React.FC<IdeaInputProps> = ({ onRefine }) => {
  const { ideaInput, setIdeaInput, isRefining } = useProjectStore();

  return (
    <div className="space-y-4">
      <p className="text-ink-500 text-sm leading-relaxed">
        아이디어 스케치부터 시작하십시오. AI 스토리 닥터가 상업적 웹툰으로 정제합니다.
      </p>
      <div className="relative">
        <textarea
          value={ideaInput}
          onChange={(e) => setIdeaInput(e.target.value)}
          className="w-full h-36 bg-warm-50 border-2 border-ink-200 p-4 text-base font-medium outline-none focus:border-toon-500 transition-all resize-none focus-toon"
          placeholder="예: 현대 판타지, 주인공은 소멸 직전의 헌터 길드장."
          aria-label="웹툰 아이디어 입력"
        />
        <Button
          onClick={onRefine}
          isLoading={isRefining}
          disabled={!ideaInput.trim()}
          size="sm"
          className="absolute bottom-3 right-3"
        >
          REFINE STORY
        </Button>
      </div>
    </div>
  );
};

export default IdeaInput;
