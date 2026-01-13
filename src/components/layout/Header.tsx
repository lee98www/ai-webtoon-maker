import React, { useState } from 'react';
import { ApiKeyModal } from '../ApiKeyModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useProjectStore } from '../../store/projectStore';

export const Header: React.FC = () => {
  const [showApiModal, setShowApiModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const { resetProject, project } = useProjectStore();

  const handleLogoClick = () => {
    const hasWork = project.title || project.panels.length > 0;

    if (hasWork) {
      setShowResetModal(true);
    }
    // 작업 없으면 아무 동작 안함 (이미 초기 상태)
  };

  const handleConfirmReset = () => {
    resetProject();
    setShowResetModal(false);
  };

  return (
    <>
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
        {/* Logo - Clickable */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">TC</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight">ToonCraft</span>
            <span className="text-slate-400 text-sm ml-1.5">AI Studio</span>
          </div>
        </button>

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

      {showResetModal && (
        <ConfirmModal
          title="새 작품 시작"
          message="현재 작업 내용이 모두 삭제됩니다. 계속하시겠습니까?"
          confirmText="새로 시작"
          cancelText="취소"
          variant="warning"
          onConfirm={handleConfirmReset}
          onCancel={() => setShowResetModal(false)}
        />
      )}
    </>
  );
};
