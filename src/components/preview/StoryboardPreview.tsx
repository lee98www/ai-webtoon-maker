import React from 'react';
import { useProjectStore } from '../../store/projectStore';

export const StoryboardPreview: React.FC = () => {
  const { project, expandedPanels, togglePanel } = useProjectStore();

  if (project.panels.length === 0) {
    return (
      <div className="p-6">
        <div className="border-2 border-dashed border-ink-300 p-8 text-center bg-warm-50">
          <div className="w-12 h-12 bg-ink-100 mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <p className="text-sm text-ink-500">
            스토리보드를 생성하면 여기에 패널이 표시됩니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Story Info */}
      <div className="bg-white border-2 border-ink-200 p-3">
        <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">
          {project.title || 'Untitled'}
        </h4>
        <p className="text-xs text-ink-500 line-clamp-2">
          {project.synopsis || '시놉시스 없음'}
        </p>
      </div>

      {/* Panel Thumbnails */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">
            Panels ({project.panels.length})
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {project.panels.map((panel, index) => {
            const isExpanded = expandedPanels.has(index);
            const hasDialogue = !!panel.dialogue;
            const hasCaption = !!panel.caption;

            return (
              <button
                key={panel.id}
                onClick={() => togglePanel(index)}
                className={`
                  aspect-[3/4] bg-warm-100 border-2 transition-all relative group
                  ${isExpanded
                    ? 'border-toon-500 shadow-toon-sm'
                    : 'border-ink-200 hover:border-ink-900'
                  }
                `}
              >
                {/* Panel number */}
                <div className="absolute top-1 left-1 w-4 h-4 bg-ink-900 text-white flex items-center justify-center text-[9px] font-mono font-bold">
                  {index + 1}
                </div>

                {/* Content indicators */}
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  {hasDialogue && (
                    <div className="w-2 h-2 bg-toon-500 rounded-full" title="Dialogue" />
                  )}
                  {hasCaption && (
                    <div className="w-2 h-2 bg-warm-500 rounded-full" title="Caption" />
                  )}
                </div>

                {/* Hover tooltip */}
                <div className="absolute inset-0 bg-ink-900/80 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-center justify-center">
                  <p className="text-[8px] text-white text-center leading-tight line-clamp-4">
                    {panel.descriptionKo || panel.description || '-'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Character Bible Preview */}
      {project.characterVisuals && (
        <div className="bg-white border-2 border-ink-200 p-3">
          <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">
            Character Bible
          </h4>
          <p className="text-[10px] text-ink-500 font-mono line-clamp-3">
            {project.characterVisuals}
          </p>
        </div>
      )}
    </div>
  );
};
