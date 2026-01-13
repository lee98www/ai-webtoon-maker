import React from 'react';
import { Genre } from '../../../../types';
import { useProjectStore } from '../../../store/projectStore';
import { GENRE_LABELS, GENRE_PREVIEW_URLS } from '../../../../constants';

const GENRE_ICONS: Record<Genre, string> = {
  [Genre.ACTION]: '',
  [Genre.ROMANCE]: '',
  [Genre.SLICE_OF_LIFE]: '',
  [Genre.POLITICS]: '',
  [Genre.NOIR]: '',
  [Genre.HORROR]: '',
  [Genre.FANTASY]: '',
};

const GENRE_DESCRIPTIONS: Record<Genre, string> = {
  [Genre.ACTION]: '전투, 추격, 긴장감 넘치는 액션',
  [Genre.ROMANCE]: '사랑과 관계에 초점을 맞춘 이야기',
  [Genre.SLICE_OF_LIFE]: '일상의 소소한 순간들',
  [Genre.POLITICS]: '권력과 음모의 세계',
  [Genre.NOIR]: '어둡고 미스터리한 분위기',
  [Genre.HORROR]: '공포와 서스펜스',
  [Genre.FANTASY]: '마법과 판타지 세계관',
};

export const GenreStep: React.FC = () => {
  const { project, setProject, markStepComplete } = useProjectStore();

  const handleSelect = (genre: Genre) => {
    setProject({ genre });
    markStepComplete('genre');
  };

  return (
    <div className="space-y-6">
      <p className="text-ink-500 leading-relaxed">
        웹툰의 장르를 선택하세요. 장르에 따라 스토리 전개와 분위기가 달라집니다.
      </p>

      <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="장르 선택">
        {Object.values(Genre).map((genre) => {
          const isSelected = project.genre === genre;

          return (
            <button
              key={genre}
              onClick={() => handleSelect(genre)}
              role="radio"
              aria-checked={isSelected}
              className={`
                relative overflow-hidden border-2 transition-all group text-left
                ${isSelected
                  ? 'border-ink-900 shadow-toon bg-ink-900'
                  : 'border-ink-200 hover:border-ink-900 bg-white'
                }
              `}
            >
              {/* Preview Image */}
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={GENRE_PREVIEW_URLS[genre]}
                  alt=""
                  className={`
                    absolute inset-0 w-full h-full object-cover transition-all duration-300
                    ${isSelected ? 'opacity-40' : 'opacity-60 group-hover:opacity-80 group-hover:scale-105'}
                  `}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {/* Gradient overlay */}
                <div className={`
                  absolute inset-0 transition-colors
                  ${isSelected
                    ? 'bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent'
                    : 'bg-gradient-to-t from-white via-white/60 to-transparent'
                  }
                `} />
              </div>

              {/* Label */}
              <div className={`
                p-4 relative
                ${isSelected ? 'bg-ink-900' : 'bg-white'}
              `}>
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm font-black uppercase tracking-wider
                    ${isSelected ? 'text-white' : 'text-ink-800'}
                  `}>
                    {GENRE_LABELS[genre]}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 bg-toon-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className={`
                  text-xs mt-1
                  ${isSelected ? 'text-ink-300' : 'text-ink-500'}
                `}>
                  {GENRE_DESCRIPTIONS[genre]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
