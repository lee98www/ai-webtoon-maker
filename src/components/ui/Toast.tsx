import React, { useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';

export const Toast: React.FC = () => {
  const { error, setError } = useProjectStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-10 right-10 px-8 py-4 font-bold shadow-toon animate-fade-in z-[60] flex items-center gap-4 max-w-md border-2 border-ink-900 ${
        error.type === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-warm-300 text-ink-900'
      }`}
    >
      <div className={`w-6 h-6 flex items-center justify-center text-sm ${
        error.type === 'error' ? 'bg-white text-red-500' : 'bg-ink-900 text-warm-300'
      }`}>
        {error.type === 'error' ? '!' : '?'}
      </div>
      <span className="flex-1 text-sm">{error.message}</span>
      <button
        onClick={() => setError(null)}
        className="w-6 h-6 flex items-center justify-center bg-ink-900 text-white hover:bg-ink-700 transition-colors"
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
