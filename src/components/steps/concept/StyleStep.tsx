import React from 'react';
import { ArtStyle } from '../../../../types';
import { useProjectStore } from '../../../store/projectStore';
import { STYLE_LABELS, STYLE_PREVIEW_URLS } from '../../../../constants';

const STYLE_DESCRIPTIONS: Record<ArtStyle, string> = {
  [ArtStyle.REALISTIC]: '영화적 사실감과 디테일',
  [ArtStyle.ANIME]: '일본 애니메이션 스타일',
  [ArtStyle.CLAY]: '클레이 애니메이션 느낌',
  [ArtStyle.MINHWA]: '한국 전통 민화 스타일',
  [ArtStyle.WEBTOON_STANDARD]: '표준 웹툰/만화 스타일',
  [ArtStyle.SKETCH]: '흑백 스케치 스타일',
};

export const StyleStep: React.FC = () => {
  const { project, setProject, markStepComplete } = useProjectStore();

  const handleSelect = (artStyle: ArtStyle) => {
    setProject({ artStyle });
    markStepComplete('style');
  };

  return (
    <div className="space-y-6">
      <p className="text-ink-500 leading-relaxed">
        웹툰의 아트 스타일을 선택하세요. 선택한 스타일로 모든 패널이 생성됩니다.
      </p>

      <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="아트 스타일 선택">
        {Object.values(ArtStyle).map((style) => {
          const isSelected = project.artStyle === style;

          return (
            <button
              key={style}
              onClick={() => handleSelect(style)}
              role="radio"
              aria-checked={isSelected}
              className={`
                relative overflow-hidden border-2 transition-all group
                ${isSelected
                  ? 'border-ink-900 shadow-toon'
                  : 'border-ink-200 hover:border-ink-900'
                }
              `}
            >
              {/* Preview Image */}
              <div className="aspect-square bg-warm-100 relative overflow-hidden">
                <img
                  src={STYLE_PREVIEW_URLS[style]}
                  alt={`${STYLE_LABELS[style]} 스타일 프리뷰`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback */}
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-ink-300 bg-warm-50">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px]">No preview</span>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-toon-500 flex items-center justify-center shadow-toon-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className={`
                p-3 transition-colors
                ${isSelected
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-700 group-hover:bg-ink-100'
                }
              `}>
                <div className="text-xs font-bold uppercase tracking-wide">
                  {STYLE_LABELS[style]}
                </div>
                <div className={`
                  text-[10px] mt-0.5
                  ${isSelected ? 'text-ink-300' : 'text-ink-500'}
                `}>
                  {STYLE_DESCRIPTIONS[style]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
