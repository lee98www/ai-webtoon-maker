import React, { useState } from 'react';

const API_KEY_STORAGE_KEY = 'gemini-api-key';

interface ApiKeyModalProps {
  onApiKeySet: (key: string) => void;
  onClose?: () => void;
  isChanging?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  onApiKeySet,
  onClose,
  isChanging = false
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const validateAndSaveKey = async () => {
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      setError('유효한 Gemini API 키 형식이 아닙니다');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // 간단한 API 검증 - models 목록 조회
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'API 키가 유효하지 않습니다');
      }

      // 키 저장
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      onApiKeySet(apiKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API 키 검증에 실패했습니다');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndSaveKey();
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-900/80 flex items-center justify-center z-50 p-4">
      <div className="bg-warm-50 border-4 border-ink-900 shadow-toon max-w-md w-full">
        {/* Header */}
        <div className="bg-ink-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="font-black text-lg tracking-tight">
            {isChanging ? 'API 키 변경' : 'Gemini API 키 입력'}
          </h2>
          {isChanging && onClose && (
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-ink-600">
            이 앱을 사용하려면 Google AI Studio에서 발급받은 Gemini API 키가 필요합니다.
          </p>

          {/* Input */}
          <div className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="AIza..."
              className="w-full px-4 py-3 border-2 border-ink-300 focus:border-ink-900 outline-none font-mono text-sm"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}
          </div>

          {/* Info */}
          <div className="bg-warm-100 border border-ink-200 p-3 text-xs text-ink-500 space-y-1">
            <p className="flex items-start gap-2">
              <span className="text-toon-600">*</span>
              API 키는 브라우저에만 저장되며, 서버로 전송되지 않습니다.
            </p>
            <p className="flex items-start gap-2">
              <span className="text-toon-600">*</span>
              공용 PC에서는 사용에 주의하세요.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 border-2 border-ink-900 text-center font-bold text-xs tracking-widest hover:bg-ink-100 transition-colors"
            >
              키 발급받기
            </a>
            <button
              onClick={validateAndSaveKey}
              disabled={isValidating}
              className="flex-1 px-4 py-3 bg-toon-600 text-white font-bold text-xs tracking-widest hover:bg-toon-700 transition-colors border-2 border-ink-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? '검증 중...' : '확인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const clearStoredApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};
