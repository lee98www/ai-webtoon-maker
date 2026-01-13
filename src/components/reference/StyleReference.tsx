import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { StyleReference as StyleReferenceType } from '../../../types';
import { useProjectStore } from '../../store/projectStore';

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

export const StyleReference: React.FC = () => {
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-warm-500 rounded-full" />
            Style Reference
          </h3>
          <p className="text-xs text-ink-400 mt-1">
            원하는 그림체의 참조 이미지를 업로드하세요
          </p>
        </div>
        {!styleRef && (
          <button
            onClick={handleCreate}
            className="text-xs font-bold px-4 py-2 bg-ink-900 text-white border-2 border-ink-900 hover:bg-ink-700 transition-colors shadow-toon-sm"
          >
            + 스타일 설정
          </button>
        )}
      </div>

      {!styleRef ? (
        <div className="border-2 border-dashed border-ink-300 p-8 text-center bg-warm-50">
          <p className="text-ink-400 text-sm">
            기본 스타일 외에 커스텀 스타일을 설정하려면 위 버튼을 클릭하세요
          </p>
        </div>
      ) : (
        <div className="border-2 border-ink-200 p-6 space-y-6 bg-white hover:border-ink-900 hover:shadow-toon-sm transition-all">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase text-ink-400 block mb-2">
                스타일 이름
              </label>
              <input
                type="text"
                value={styleRef.name}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                placeholder="예: 수채화 애니메이션"
                className="w-full max-w-xs p-2 border-2 border-ink-200 text-sm font-medium outline-none focus:border-toon-500 transition-colors"
              />
            </div>
            <button
              onClick={handleRemove}
              className="w-6 h-6 flex items-center justify-center bg-ink-100 text-ink-400 hover:bg-red-500 hover:text-white transition-colors"
              aria-label="스타일 삭제"
            >
              ×
            </button>
          </div>

          {/* Reference Images */}
          <div>
            <label className="text-xs font-bold uppercase text-ink-400 block mb-2">
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
                    ×
                  </button>
                </div>
              ))}

              {styleRef.images.length < 5 && (
                <div
                  {...getRootProps()}
                  className={`w-24 h-24 border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-toon-500 bg-toon-50'
                      : 'border-ink-300 hover:border-ink-900'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <span className="text-2xl text-ink-300 block">+</span>
                    <span className="text-[10px] text-ink-400">Drop</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Style Keywords */}
          <div>
            <label className="text-xs font-bold uppercase text-ink-400 block mb-2">
              스타일 키워드
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_SUGGESTIONS.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => toggleKeyword(keyword)}
                  className={`text-xs px-3 py-1.5 border-2 transition-all ${
                    styleRef.keywords.includes(keyword)
                      ? 'bg-ink-900 text-white border-ink-900'
                      : 'bg-white text-ink-500 border-ink-200 hover:border-ink-900'
                  }`}
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

export default StyleReference;
