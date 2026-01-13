import React from 'react';
import { useProjectStore } from '../../store/projectStore';

export const ProgressBar: React.FC = () => {
  const { progress } = useProjectStore();

  if (!progress) return null;

  const percentage = (progress.completed / progress.total) * 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={progress.completed}
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-label="이미지 생성 진행률"
      className="fixed bottom-24 left-10 bg-ink-900 text-white px-6 py-4 shadow-toon border-2 border-ink-900 z-[60] min-w-[240px]"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-toon-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-toon-300">
            {progress.status === 'generating' ? 'Rendering' : 'Processing'}
          </span>
        </div>
        <span className="text-xs font-mono bg-ink-700 px-2 py-0.5">
          {progress.completed}/{progress.total}
        </span>
      </div>
      <div className="h-2 bg-ink-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-toon-500 to-toon-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {progress.currentPanel !== undefined && (
        <p className="text-[10px] mt-3 text-ink-400">
          패널 {progress.currentPanel + 1} 생성 중...
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
