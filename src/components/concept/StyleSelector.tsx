import React from 'react';
import { ArtStyle } from '../../../types';
import { useProjectStore } from '../../store/projectStore';
import { STYLE_LABELS, STYLE_PREVIEW_URLS } from '../../../constants';

export const StyleSelector: React.FC = () => {
  const { project, setProject } = useProjectStore();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <label className="text-xs font-bold text-ink-500 uppercase tracking-wider">
          Art Direction
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="아트 스타일 선택">
        {Object.values(ArtStyle).map((style) => {
          const isSelected = project.artStyle === style;

          return (
            <button
              key={style}
              onClick={() => setProject({ artStyle: style })}
              role="radio"
              aria-checked={isSelected}
              className={`relative overflow-hidden border-2 transition-all group ${
                isSelected
                  ? 'border-ink-900 shadow-toon'
                  : 'border-ink-200 hover:border-ink-900'
              }`}
            >
              {/* Preview Image Area */}
              <div className="aspect-square bg-warm-100 relative">
                <img
                  src={STYLE_PREVIEW_URLS[style]}
                  alt={`${STYLE_LABELS[style]} 스타일 프리뷰`}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105`}
                  onError={(e) => {
                    // Fallback to placeholder if image not found
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback placeholder (hidden by default) */}
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-ink-300 bg-warm-50">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px]">No preview</span>
                </div>

                {/* Selected Indicator Overlay */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-toon-500 flex items-center justify-center shadow-toon-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className={`p-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                isSelected
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-700 group-hover:bg-ink-100'
              }`}>
                {STYLE_LABELS[style]}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default StyleSelector;
