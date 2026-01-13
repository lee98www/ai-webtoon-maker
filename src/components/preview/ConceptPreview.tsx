import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { GENRE_LABELS, GENRE_PREVIEW_URLS, STYLE_LABELS, STYLE_PREVIEW_URLS } from '../../../constants';

export const ConceptPreview: React.FC = () => {
  const { project, ideaInput } = useProjectStore();

  return (
    <div className="p-6 space-y-6">
      {/* Project Title/Synopsis */}
      <section className="bg-white border-2 border-ink-200 p-4">
        <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-2">
          Story
        </h4>
        {project.title ? (
          <>
            <p className="text-lg font-black text-ink-900 mb-2">{project.title}</p>
            {project.synopsis && (
              <p className="text-sm text-ink-600 leading-relaxed line-clamp-4">
                {project.synopsis}
              </p>
            )}
          </>
        ) : ideaInput ? (
          <p className="text-sm text-ink-500 italic line-clamp-4">
            "{ideaInput.slice(0, 150)}..."
          </p>
        ) : (
          <p className="text-sm text-ink-400 italic">
            스토리 아이디어를 입력하세요
          </p>
        )}
      </section>

      {/* Genre */}
      {project.genre && (
        <section className="bg-white border-2 border-ink-200 overflow-hidden">
          <div className="aspect-video relative">
            <img
              src={GENRE_PREVIEW_URLS[project.genre]}
              alt=""
              className="w-full h-full object-cover opacity-70"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>
          <div className="p-4 -mt-8 relative">
            <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">
              Genre
            </h4>
            <p className="text-sm font-black text-ink-900">
              {GENRE_LABELS[project.genre]}
            </p>
          </div>
        </section>
      )}

      {/* Art Style */}
      {project.artStyle && (
        <section className="bg-white border-2 border-ink-200 overflow-hidden">
          <div className="aspect-square relative">
            <img
              src={STYLE_PREVIEW_URLS[project.artStyle]}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="p-4 bg-ink-900 text-white">
            <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">
              Art Style
            </h4>
            <p className="text-sm font-black">
              {STYLE_LABELS[project.artStyle]}
            </p>
          </div>
        </section>
      )}

      {/* Characters */}
      {project.characters.length > 0 && (
        <section className="bg-white border-2 border-ink-200 p-4">
          <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-3">
            Characters ({project.characters.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.characters.map((char) => (
              <div
                key={char.id}
                className="flex items-center gap-2 bg-warm-100 border border-ink-200 px-2 py-1"
              >
                {char.referenceImages[0] ? (
                  <img
                    src={char.referenceImages[0]}
                    alt=""
                    className="w-6 h-6 object-cover border border-ink-200"
                  />
                ) : (
                  <div className="w-6 h-6 bg-ink-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <span className="text-xs font-medium text-ink-700">
                  {char.name || '이름 없음'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Style Reference */}
      {project.styleRef && (
        <section className="bg-white border-2 border-ink-200 p-4">
          <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-3">
            Style Reference
          </h4>
          <div className="flex gap-2 flex-wrap">
            {project.styleRef.images.slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="w-12 h-12 object-cover border border-ink-200"
              />
            ))}
            {project.styleRef.images.length > 3 && (
              <div className="w-12 h-12 bg-ink-100 flex items-center justify-center text-xs text-ink-500">
                +{project.styleRef.images.length - 3}
              </div>
            )}
          </div>
          {project.styleRef.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.styleRef.keywords.map((kw) => (
                <span key={kw} className="text-[10px] px-2 py-0.5 bg-ink-100 text-ink-600">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
