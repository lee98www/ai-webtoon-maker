import React from 'react';
import { Genre } from '../../../types';
import { useProjectStore } from '../../store/projectStore';
import { GENRE_LABELS, GENRE_PREVIEW_URLS } from '../../../constants';

// Genre icons for fallback placeholder
const GENRE_ICONS: Record<Genre, string> = {
  [Genre.ACTION]: '⚔️',
  [Genre.ROMANCE]: '💕',
  [Genre.SLICE_OF_LIFE]: '☀️',
  [Genre.POLITICS]: '🏛️',
  [Genre.NOIR]: '🌃',
  [Genre.HORROR]: '👻',
  [Genre.FANTASY]: '🔮',
};

export const GenreSelector: React.FC = () => {
  const { project, setProject } = useProjectStore();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <label className="text-xs font-bold text-ink-500 uppercase tracking-wider">
          Genre Identity
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="장르 선택">
        {Object.values(Genre).map((genre) => {
          const isSelected = project.genre === genre;

          return (
            <button
              key={genre}
              onClick={() => setProject({ genre })}
              role="radio"
              aria-checked={isSelected}
              className={`relative h-20 overflow-hidden border-2 group transition-all ${
                isSelected
                  ? 'border-ink-900 shadow-toon'
                  : 'border-ink-200 hover:border-ink-900'
              }`}
            >
              {/* Background Image */}
              <img
                src={GENRE_PREVIEW_URLS[genre]}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                  isSelected
                    ? 'opacity-40'
                    : 'opacity-30 group-hover:opacity-50 group-hover:scale-105'
                }`}
                onError={(e) => {
                  // Hide image and show fallback
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />

              {/* Fallback placeholder icon (shown when no image) */}
              <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                isSelected ? 'bg-ink-900' : 'bg-warm-100 group-hover:bg-warm-200'
              }`} style={{ zIndex: 0 }}>
                <span className={`text-3xl opacity-30 ${isSelected ? 'grayscale invert' : ''}`}>
                  {GENRE_ICONS[genre]}
                </span>
              </div>

              {/* Overlay with Label */}
              <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-ink-900/70'
                  : 'bg-white/60 group-hover:bg-white/40'
              }`} style={{ zIndex: 1 }}>
                <div className="text-center">
                  <span className={`text-sm font-black uppercase tracking-wider ${
                    isSelected ? 'text-white' : 'text-ink-800'
                  }`}>
                    {GENRE_LABELS[genre]}
                  </span>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="mt-1 flex justify-center">
                      <div className="w-4 h-0.5 bg-toon-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Corner badge for selected */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-t-toon-500 border-l-[24px] border-l-transparent" style={{ zIndex: 2 }}>
                  <svg className="absolute -top-[20px] -right-[4px] w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default GenreSelector;
