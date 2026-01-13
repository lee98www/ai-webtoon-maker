import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { AppStep } from '../../../types';

export const ProductionPreview: React.FC = () => {
  const { project, setStep } = useProjectStore();

  const completedCount = project.panels.filter(p => p.generatedImageUrl).length;
  const totalCount = project.panels.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Progress Summary */}
      <div className="bg-white border-2 border-ink-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">
            Render Progress
          </h4>
          <span className="text-sm font-bold text-ink-900">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 bg-ink-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-toon-600 to-toon-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Generated Panels Gallery */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">
          Generated Panels
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {project.panels.map((panel, index) => (
            <div
              key={panel.id}
              className={`
                aspect-[3/4] relative overflow-hidden border-2 transition-all
                ${panel.generatedImageUrl
                  ? 'border-ink-200 hover:border-ink-900'
                  : 'border-ink-200 bg-warm-100'
                }
              `}
            >
              {panel.generatedImageUrl ? (
                <img
                  src={panel.generatedImageUrl}
                  alt={`패널 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : panel.isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-6 h-6 border-2 border-ink-900 border-t-toon-500 rounded-full animate-spin mb-2" />
                  <span className="text-[8px] text-ink-500">렌더링...</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-6 h-6 bg-ink-200 flex items-center justify-center mb-1">
                    <span className="font-mono text-[10px] text-ink-400">{index + 1}</span>
                  </div>
                  <span className="text-[8px] text-ink-400">대기 중</span>
                </div>
              )}

              {/* Panel number badge */}
              <div className="absolute top-1 right-1 w-4 h-4 bg-ink-900 text-white flex items-center justify-center text-[8px] font-mono font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publish Button */}
      {completedCount > 0 && (
        <button
          onClick={() => setStep(AppStep.VIEWER)}
          className="w-full py-3 bg-ink-900 text-white font-bold text-sm border-2 border-ink-900 hover:bg-ink-700 transition-colors"
        >
          PUBLISH & VIEW
        </button>
      )}

      {/* Story Info */}
      <div className="bg-warm-100 border-2 border-ink-200 p-3">
        <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">
          {project.title || 'Untitled'}
        </h4>
        <p className="text-[10px] text-ink-500 line-clamp-2">
          {project.synopsis?.slice(0, 80)}...
        </p>
      </div>
    </div>
  );
};
