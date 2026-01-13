import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { StyleReference as StyleReferenceType } from '../../../../types';
import { useProjectStore } from '../../../store/projectStore';

const generateId = () => `style-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

const STYLE_SUGGESTIONS = [
  '선명한 선화',
  '수채화 느낌',
  '그라데이션',
  '플랫 컬러',
  '강한 명암',
  '파스텔 톤',
  '네온 컬러',
  '빈티지',
  '미니멀',
  '디테일함'
];

export const StyleRefStep: React.FC = () => {
  const { project, setStyleRef } = useProjectStore();
  const styleRef = project.styleRef;

  const handleCreate = () => {
    const newStyle: StyleReferenceType = {
      id: generateId(),
      name: '커스텀 스타일',
      images: [],
      keywords: []
    };
    setStyleRef(newStyle);
  };

  const handleUpdate = (updates: Partial<StyleReferenceType>) => {
    if (styleRef) {
      setStyleRef({ ...styleRef, ...updates });
    }
  };

  const handleRemove = () => {
    setStyleRef(null);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!styleRef) return;

      const newImages = await Promise.all(
        acceptedFiles.slice(0, 5 - styleRef.images.length).map(fileToBase64)
      );
      handleUpdate({
        images: [...styleRef.images, ...newImages].slice(0, 5)
      });
    },
    [styleRef]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: styleRef ? 5 - styleRef.images.length : 0,
    disabled: !styleRef || styleRef.images.length >= 5
  });

  const removeImage = (index: number) => {
    if (!styleRef) return;
    const newImages = styleRef.images.filter((_, i) => i !== index);
    handleUpdate({ images: newImages });
  };

  const toggleKeyword = (keyword: string) => {
    if (!styleRef) return;
    const keywords = styleRef.keywords.includes(keyword)
      ? styleRef.keywords.filter((k) => k !== keyword)
      : [...styleRef.keywords, keyword];
    handleUpdate({ keywords });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-ink-500 leading-relaxed mb-2">
          원하는 그림체의 참조 이미지를 업로드하세요. 선택한 기본 스타일에 추가로 적용됩니다.
        </p>
        <p className="text-xs text-ink-400">
          * 이 단계는 선택사항입니다. 건너뛰어도 됩니다.
        </p>
      </div>

      {!styleRef ? (
        <div className="border-2 border-dashed border-ink-300 p-8 text-center bg-warm-50">
          <div className="w-12 h-12 bg-ink-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <p className="text-ink-500 mb-4">
            커스텀 스타일을 설정하면 더 일관된 그림체로 생성됩니다
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-ink-900 text-white font-bold text-sm border-2 border-ink-900 hover:bg-ink-700 transition-colors shadow-toon-sm"
          >
            + 스타일 레퍼런스 추가
          </button>
        </div>
      ) : (
        <div className="border-2 border-ink-200 p-5 space-y-5 bg-white hover:border-ink-900 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase text-ink-400 block mb-1.5">
                스타일 이름
              </label>
              <input
                type="text"
                value={styleRef.name}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                placeholder="예: 수채화 애니메이션"
                className="w-full max-w-xs p-2.5 border-2 border-ink-200 text-sm font-medium outline-none focus:border-toon-500 transition-colors"
              />
            </div>
            <button
              onClick={handleRemove}
              className="w-7 h-7 flex items-center justify-center bg-ink-100 text-ink-400 hover:bg-red-500 hover:text-white transition-colors"
              aria-label="스타일 삭제"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Reference Images */}
          <div>
            <label className="text-xs font-bold uppercase text-ink-400 block mb-1.5">
              참조 이미지 (최대 5장)
            </label>
            <div className="flex flex-wrap gap-3">
              {styleRef.images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 group">
                  <img
                    src={img}
                    alt={`스타일 참조 ${i + 1}`}
                    className="w-full h-full object-cover border-2 border-ink-200"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="이미지 삭제"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {styleRef.images.length < 5 && (
                <div
                  {...getRootProps()}
                  className={`
                    w-24 h-24 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                    ${isDragActive
                      ? 'border-toon-500 bg-toon-50'
                      : 'border-ink-300 hover:border-ink-900'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <span className="text-2xl text-ink-300">+</span>
                  <span className="text-[10px] text-ink-400">Drop</span>
                </div>
              )}
            </div>
          </div>

          {/* Style Keywords */}
          <div>
            <label className="text-xs font-bold uppercase text-ink-400 block mb-1.5">
              스타일 키워드
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_SUGGESTIONS.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => toggleKeyword(keyword)}
                  className={`
                    text-xs px-3 py-1.5 border-2 transition-all
                    ${styleRef.keywords.includes(keyword)
                      ? 'bg-ink-900 text-white border-ink-900'
                      : 'bg-white text-ink-500 border-ink-200 hover:border-ink-900'
                    }
                  `}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
