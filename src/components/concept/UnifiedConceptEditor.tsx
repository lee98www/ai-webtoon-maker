import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Genre, ArtStyle } from '../../../types';
import { GENRE_LABELS, STYLE_LABELS, GENRE_DESCRIPTIONS, STYLE_DESCRIPTIONS, GENRE_PREVIEW_URLS, STYLE_PREVIEW_URLS } from '../../../constants';
import { refineSynopsis, generateCharacterSheet, generateStyleReference } from '../../../services/geminiService';

type ModalType = 'characters' | 'styleRef' | null;

// ============================================
// Left Panel: Story Input (Large)
// ============================================

const StoryPanel: React.FC = () => {
  const { ideaInput, setIdeaInput, project, setProject, isRefining, setRefining } = useProjectStore();

  const handleRefine = async () => {
    if (!ideaInput.trim() || !project.genre) return;

    setRefining(true);
    try {
      const synopsis = await refineSynopsis(ideaInput, project.genre);
      setProject({ synopsis });
    } catch (err) {
      console.error('Refine failed:', err);
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="bg-white p-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">스토리 아이디어</h2>
        <p className="text-sm text-slate-500 mt-1">웹툰의 기본 컨셉과 스토리를 작성하세요</p>
      </div>

      {/* Main Input */}
      <div>
        <textarea
          value={ideaInput}
          onChange={(e) => setIdeaInput(e.target.value)}
          placeholder="예: 현대 판타지 세계관. 주인공은 소멸 직전의 헌터 길드장인데, 갑자기 10년 전 신입 헌터 시절로 회귀한다. 그는 미래의 기억을 바탕으로 다가올 대재앙을 막고자 하는데..."
          className="w-full h-48 p-5 text-base leading-relaxed border border-slate-200 rounded-xl resize-none focus:border-slate-400 focus:ring-0 placeholder:text-slate-400 transition-colors"
        />

        {/* Action Bar */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {ideaInput.length} 자
            </span>
            {project.synopsis && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                시놉시스 생성됨
              </span>
            )}
          </div>

          <button
            onClick={handleRefine}
            disabled={!ideaInput.trim() || !project.genre || isRefining}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all
              ${!ideaInput.trim() || !project.genre || isRefining
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800'
              }
            `}
          >
            {isRefining ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>정제 중...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI로 시놉시스 정제</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Synopsis */}
        {project.synopsis && (
          <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI 생성 시놉시스</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {project.synopsis}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Right Panel: Settings
// ============================================

interface SettingsPanelProps {
  onOpenModal: (type: ModalType) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onOpenModal }) => {
  const { project, setProject, markStepComplete } = useProjectStore();

  return (
    <div className="flex flex-col bg-slate-50">
      {/* Section Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-white">
        <h2 className="text-base font-semibold text-slate-900">설정</h2>
      </div>

      {/* Settings Content */}
      <div className="p-6 space-y-6">
        {/* Genre Selection */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">장르</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Genre).map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  setProject({ genre });
                  markStepComplete('genre');
                }}
                className={`
                  relative overflow-hidden rounded-lg border transition-all text-left
                  ${project.genre === genre
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                {/* Preview Image */}
                <div className="aspect-[16/9] relative">
                  <img
                    src={GENRE_PREVIEW_URLS[genre]}
                    alt={genre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs font-medium text-white">
                    {GENRE_LABELS[genre]}
                  </span>
                  {project.genre === genre && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Art Style Selection */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">아트 스타일</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ArtStyle).map((style) => (
              <button
                key={style}
                onClick={() => {
                  setProject({ artStyle: style });
                  markStepComplete('style');
                }}
                className={`
                  relative overflow-hidden rounded-lg border transition-all text-left
                  ${project.artStyle === style
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                {/* Preview Image */}
                <div className="aspect-square relative">
                  <img
                    src={STYLE_PREVIEW_URLS[style]}
                    alt={style}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white leading-tight">
                    {STYLE_LABELS[style]}
                  </span>
                  {project.artStyle === style && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-3">고급 옵션</h3>

          <div className="space-y-2">
            {/* Characters */}
            <button
              onClick={() => onOpenModal('characters')}
              className="w-full p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <span className="font-medium text-sm text-slate-800 group-hover:text-slate-900">캐릭터 설정</span>
                    <p className="text-xs text-slate-500 mt-0.5">일관된 캐릭터 생성</p>
                  </div>
                </div>
                {project.characters.length > 0 ? (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                    {project.characters.length}명
                  </span>
                ) : (
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>

            {/* Style Reference */}
            <button
              onClick={() => onOpenModal('styleRef')}
              className="w-full p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">
                    🎨
                  </div>
                  <div>
                    <span className="font-medium text-sm text-slate-800 group-hover:text-slate-900">스타일 레퍼런스</span>
                    <p className="text-xs text-slate-500 mt-0.5">커스텀 그림체 적용</p>
                  </div>
                </div>
                {project.styleRef ? (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                    {project.styleRef.images.length}장
                  </span>
                ) : (
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">설정 요약</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">장르</span>
              <span className={project.genre ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                {project.genre ? GENRE_LABELS[project.genre] : '선택 안함'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">스타일</span>
              <span className={project.artStyle ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                {project.artStyle ? STYLE_LABELS[project.artStyle] : '선택 안함'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">캐릭터</span>
              <span className={project.characters.length > 0 ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                {project.characters.length > 0 ? `${project.characters.length}명` : '없음'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Modals
// ============================================

interface CharacterModalProps {
  open: boolean;
  onClose: () => void;
}

const CharacterModal: React.FC<CharacterModalProps> = ({ open, onClose }) => {
  const { project, addCharacter, updateCharacter, removeCharacter } = useProjectStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  const handleGenerateCharacter = async () => {
    if (!newCharDesc.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateCharacterSheet({
        name: newCharName || '주인공',
        description: newCharDesc,
        artStyle: project.artStyle
      });

      addCharacter({
        id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: result.name,
        role: 'protagonist',
        description: newCharDesc,
        referenceImages: [result.imageUrl],
        extractedFeatures: result.extractedFeatures
      });

      setNewCharName('');
      setNewCharDesc('');
    } catch (err) {
      console.error('Character generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (charId: string, files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const char = project.characters.find(c => c.id === charId);
        if (char && char.referenceImages.length < 3) {
          updateCharacter(charId, {
            referenceImages: [...char.referenceImages, e.target?.result as string]
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">캐릭터 설정</h2>
            <p className="text-sm text-slate-500 mt-0.5">일관된 캐릭터를 생성하세요</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Generation */}
          <div className="p-5 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-lg">✨</span> AI 캐릭터 시트 생성
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                placeholder="캐릭터 이름 (예: 김수현)"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-0"
              />
              <textarea
                value={newCharDesc}
                onChange={(e) => setNewCharDesc(e.target.value)}
                placeholder="캐릭터 외모 설명 (예: 검은 단발머리, 날카로운 눈매, 20대 여성...)"
                className="w-full h-24 px-4 py-3 border border-slate-200 rounded-lg text-sm resize-none focus:border-slate-400 focus:ring-0"
              />
              <button
                onClick={handleGenerateCharacter}
                disabled={!newCharDesc.trim() || isGenerating}
                className={`
                  w-full py-3 rounded-lg font-medium text-sm transition-all
                  ${!newCharDesc.trim() || isGenerating
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                  }
                `}
              >
                {isGenerating ? '생성 중... (약 30초)' : 'AI 캐릭터 시트 생성'}
              </button>
            </div>
          </div>

          {/* Existing Characters */}
          {project.characters.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">등록된 캐릭터 ({project.characters.length})</h3>
              {project.characters.map(char => (
                <div key={char.id} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex gap-4">
                    <div className="flex gap-2">
                      {char.referenceImages.map((img, idx) => (
                        <img key={idx} src={img} alt={`${char.name} ${idx + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                      ))}
                      {char.referenceImages.length < 3 && (
                        <label className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-300 transition">
                          <span className="text-slate-400 text-xl">+</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(char.id, e.target.files)}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                        className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-slate-500 outline-none"
                      />
                      <select
                        value={char.role}
                        onChange={(e) => updateCharacter(char.id, { role: e.target.value as any })}
                        className="block mt-1 text-xs text-slate-500 border border-slate-200 rounded px-2 py-1"
                      >
                        <option value="protagonist">주인공</option>
                        <option value="supporting">조연</option>
                        <option value="antagonist">악역</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{char.description}</p>
                    </div>
                    <button
                      onClick={() => removeCharacter(char.id)}
                      className="text-red-500 hover:text-red-600 text-xs font-medium self-start"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};

interface StyleRefModalProps {
  open: boolean;
  onClose: () => void;
}

const STYLE_KEYWORDS = [
  '선명한 선화', '수채화 느낌', '그라데이션', '플랫 컬러', '강한 명암',
  '파스텔 톤', '네온 컬러', '빈티지', '미니멀', '디테일함'
];

const StyleRefModal: React.FC<StyleRefModalProps> = ({ open, onClose }) => {
  const { project, setStyleRef } = useProjectStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [sampleScene, setSampleScene] = useState('도시 야경 배경의 캐릭터');

  const handleGenerateStyle = async () => {
    if (selectedKeywords.length === 0) return;

    setIsGenerating(true);
    try {
      const result = await generateStyleReference({
        keywords: selectedKeywords,
        baseStyle: project.artStyle,
        sampleScene
      });

      setStyleRef({
        id: `style-${Date.now()}`,
        name: selectedKeywords.join(' + '),
        images: [result.imageUrl],
        keywords: selectedKeywords,
        extractedStyle: result.extractedStyle
      });
    } catch (err) {
      console.error('Style generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const currentImages = project.styleRef?.images || [];

    Array.from(files).forEach(file => {
      if (currentImages.length >= 5) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImages = [...(project.styleRef?.images || []), e.target?.result as string].slice(0, 5);
        setStyleRef({
          id: project.styleRef?.id || `style-${Date.now()}`,
          name: project.styleRef?.name || '커스텀 스타일',
          images: newImages,
          keywords: project.styleRef?.keywords || []
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">스타일 레퍼런스</h2>
            <p className="text-sm text-slate-500 mt-0.5">원하는 그림체를 설정하세요</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Generation */}
          <div className="p-5 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-lg">✨</span> AI 스타일 레퍼런스 생성
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">스타일 키워드</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_KEYWORDS.map(keyword => (
                    <button
                      key={keyword}
                      onClick={() => toggleKeyword(keyword)}
                      className={`
                        px-3 py-1.5 text-sm rounded-lg border transition-all
                        ${selectedKeywords.includes(keyword)
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">샘플 장면</label>
                <input
                  type="text"
                  value={sampleScene}
                  onChange={(e) => setSampleScene(e.target.value)}
                  placeholder="예: 도시 야경 배경의 캐릭터"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-0"
                />
              </div>

              <button
                onClick={handleGenerateStyle}
                disabled={selectedKeywords.length === 0 || isGenerating}
                className={`
                  w-full py-3 rounded-lg font-medium text-sm transition-all
                  ${selectedKeywords.length === 0 || isGenerating
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                  }
                `}
              >
                {isGenerating ? '생성 중... (약 30초)' : 'AI 스타일 레퍼런스 생성'}
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="p-5 border border-slate-200 rounded-xl">
            <h3 className="font-medium text-slate-900 mb-4">직접 업로드 (최대 5장)</h3>

            <div className="flex gap-3 flex-wrap">
              {project.styleRef?.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt={`Style ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    onClick={() => {
                      const newImages = project.styleRef!.images.filter((_, i) => i !== idx);
                      if (newImages.length === 0) {
                        setStyleRef(null);
                      } else {
                        setStyleRef({ ...project.styleRef!, images: newImages });
                      }
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}

              {(!project.styleRef || project.styleRef.images.length < 5) && (
                <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-300 transition">
                  <span className="text-slate-400 text-xl">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Main Component
// ============================================

export const UnifiedConceptEditor: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* 2-Column Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-[1fr_400px]">
        {/* Left: Story Input */}
        <div className="min-h-0 overflow-auto">
          <StoryPanel />
        </div>

        {/* Right: Settings */}
        <div className="min-h-0 overflow-auto border-l border-slate-200">
          <SettingsPanel onOpenModal={setActiveModal} />
        </div>
      </div>

      {/* Modals */}
      <CharacterModal open={activeModal === 'characters'} onClose={() => setActiveModal(null)} />
      <StyleRefModal open={activeModal === 'styleRef'} onClose={() => setActiveModal(null)} />
    </div>
  );
};
