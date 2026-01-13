import React, { useState } from 'react';
import { ApiKeyModal } from '../ApiKeyModal';

export const Header: React.FC = () => {
  const [showApiModal, setShowApiModal] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">TC</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight">ToonCraft</span>
            <span className="text-slate-400 text-sm ml-1.5">AI Studio</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>API</span>
          </button>
        </div>
      </header>

      {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}
    </>
  );
};
