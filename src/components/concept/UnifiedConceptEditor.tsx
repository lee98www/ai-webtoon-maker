import React, { useState, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Genre, ArtStyle } from '../../../types';
import { GENRE_LABELS, STYLE_LABELS, GENRE_DESCRIPTIONS, STYLE_DESCRIPTIONS } from '../../../constants';
import { refineSynopsis, generateCharacterSheet, generateStyleReference } from '../../../services/geminiService';

// ============================================
// Types
// ============================================

type ModalType = 'characters' | 'styleRef' | null;

// ============================================
// Sub Components
// ============================================

// 스토리 입력 섹션
const StoryInputSection: React.FC = () => {
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
    <div className="bg-white border-2 border-ink-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-6 bg-toon-600 text-white flex items-center justify-center text-xs font-bold">01</span>
        <h3 className="font-bold text-ink-900">스토리 아이디어</h3>
      </div>

      <textarea
        value={ideaInput}
        onChange={(e) => setIdeaInput(e.target.value)}
        placeholder="예: 현대 판타지, 주인공은 소멸 직전의 헌터 길드장이 갑자기 시간이 되돌려지면서 다시 신입 헌터 시절로 돌아간다..."
        className="w-full h-32 p-4 border-2 border-ink-200 resize-none focus:border-toon-500 focus:outline-none text-sm"
      />

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleRefine}
          disabled={!ideaInput.trim() || !project.genre || isRefining}
          className={`
            px-5 py-2.5 font-bold text-xs tracking-wider border-2 border-ink-900 transition-all
            ${!ideaInput.trim() || !project.genre || isRefining
              ? 'opacity-40 cursor-not-allowed bg-ink-100 text-ink-400'
              : 'bg-toon-600 text-white hover:bg-toon-700 shadow-toon-sm hover:shadow-none'
            }
          `}
        >
          {isRefining ? '정제 중...' : 'AI 시놉시스 정제'}
        </button>

        {project.synopsis && (
          <span className="text-xs text-green-600 font-bold">✓ 시놉시스 완료</span>
        )}
      </div>

      {project.synopsis && (
        <div className="mt-4 p-4 bg-ink-900 text-white text-sm leading-relaxed border-l-4 border-toon-500">
          {project.synopsis}
        </div>
      )}
    </div>
  );
};

// 장르 빠른 선택
const GenreQuickSelect: React.FC = () => {
  const { project, setProject, markStepComplete } = useProjectStore();

  return (
    <div className="bg-white border-2 border-ink-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-5 h-5 bg-toon-600 text-white flex items-center justify-center text-[10px] font-bold">02</span>
        <h3 className="font-bold text-ink-900 text-sm">장르</h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Object.values(Genre).map((genre) => (
          <button
            key={genre}
            onClick={() => {
              setProject({ genre });
              markStepComplete('genre');
            }}
            className={`
              py-2 px-2 text-[11px] font-bold border-2 transition-all text-center
              ${project.genre === genre
                ? 'bg-ink-900 text-white border-ink-900'
                : 'bg-white border-ink-200 hover:border-ink-900 text-ink-700'}
            `}
            title={GENRE_DESCRIPTIONS[genre]}
          >
            {GENRE_LABELS[genre].split('/')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

// 스타일 빠른 선택
const StyleQuickSelect: React.FC = () => {
  const { project, setProject, markStepComplete } = useProjectStore();

  return (
    <div className="bg-white border-2 border-ink-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-5 h-5 bg-toon-600 text-white flex items-center justify-center text-[10px] font-bold">03</span>
        <h3 className="font-bold text-ink-900 text-sm">아트 스타일</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Object.values(ArtStyle).map((style) => (
          <button
            key={style}
            onClick={() => {
              setProject({ artStyle: style });
              markStepComplete('style');
            }}
            className={`
              py-2 px-2 text-[10px] font-bold border-2 transition-all text-center leading-tight
              ${project.artStyle === style
                ? 'bg-ink-900 text-white border-ink-900'
                : 'bg-white border-ink-200 hover:border-ink-900 text-ink-700'}
            `}
            title={STYLE_DESCRIPTIONS[style]}
          >
            {STYLE_LABELS[style]}
          </button>
        ))}
      </div>
    </div>
  );
};

// 고급 옵션 바
interface AdvancedOptionsBarProps {
  onOpenModal: (type: ModalType) => void;
}

const AdvancedOptionsBar: React.FC<AdvancedOptionsBarProps> = ({ onOpenModal }) => {
  const { project } = useProjectStore();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-dashed border-ink-300 bg-warm-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-warm-100 transition"
      >
        <div className="flex items-center gap-3">
          <span className={`w-6 h-6 bg-ink-900 text-white flex items-center justify-center text-xs transition-transform ${expanded ? 'rotate-45' : ''}`}>
            +
          </span>
          <span className="text-sm font-bold text-ink-800">고급 옵션</span>
          <span className="text-xs text-ink-400">(캐릭터 일관성을 위해 권장)</span>
        </div>

        <div className="flex gap-2">
          {project.characters.length > 0 && (
            <span className="px-2 py-1 bg-toon-100 text-toon-700 text-xs font-bold">
              캐릭터 {project.characters.length}
            </span>
          )}
          {project.styleRef && (
            <span className="px-2 py-1 bg-warm-200 text-ink-700 text-xs font-bold">
              커스텀 스타일
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-ink-200 grid grid-cols-2 gap-4">
          <button
            onClick={() => onOpenModal('characters')}
            className="p-4 bg-white border-2 border-ink-200 hover:border-toon-500 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👤</span>
              <span className="font-bold text-ink-900 group-hover:text-toon-600">캐릭터 설정</span>
            </div>
            <p className="text-xs text-ink-500">참조 이미지로 일관된 캐릭터 생성</p>
            {project.characters.length > 0 && (
              <p className="text-xs text-toon-600 font-bold mt-2">{project.characters.length}명 등록됨</p>
            )}
          </button>

          <button
            onClick={() => onOpenModal('styleRef')}
            className="p-4 bg-white border-2 border-ink-200 hover:border-toon-500 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎨</span>
              <span className="font-bold text-ink-900 group-hover:text-toon-600">스타일 레퍼런스</span>
            </div>
            <p className="text-xs text-ink-500">원하는 그림체 참조 이미지 업로드</p>
            {project.styleRef && (
              <p className="text-xs text-toon-600 font-bold mt-2">{project.styleRef.images.length}장 등록됨</p>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// 라이브 프리뷰
const LivePreview: React.FC = () => {
  const { project, ideaInput } = useProjectStore();

  return (
    <div className="bg-white border-2 border-ink-200 h-full flex flex-col">
      <div className="px-5 py-4 border-b-2 border-ink-200 bg-warm-50">
        <h3 className="font-bold text-ink-900 text-sm">미리보기</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 시놉시스 */}
        <div>
          <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">시놉시스</span>
          <p className="text-sm text-ink-700 mt-1 leading-relaxed">
            {project.synopsis || ideaInput || '아이디어를 입력해주세요...'}
          </p>
        </div>

        {/* 장르 & 스타일 */}
        <div className="flex gap-2 flex-wrap">
          {project.genre && (
            <span className="px-3 py-1 bg-ink-900 text-white text-xs font-bold">
              {GENRE_LABELS[project.genre]}
            </span>
          )}
          {project.artStyle && (
            <span className="px-3 py-1 bg-toon-600 text-white text-xs font-bold">
              {STYLE_LABELS[project.artStyle]}
            </span>
          )}
        </div>

        {/* 캐릭터 미리보기 */}
        {project.characters.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">캐릭터</span>
            <div className="flex gap-2 mt-2">
              {project.characters.map(char => (
                <div key={char.id} className="text-center">
                  {char.referenceImages[0] ? (
                    <img src={char.referenceImages[0]} alt={char.name} className="w-12 h-12 object-cover border-2 border-ink-200" />
                  ) : (
                    <div className="w-12 h-12 bg-ink-100 flex items-center justify-center border-2 border-ink-200">
                      <span className="text-ink-400">?</span>
                    </div>
                  )}
                  <span className="text-[10px] text-ink-600 block mt-1">{char.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 스타일 레퍼런스 미리보기 */}
        {project.styleRef && project.styleRef.images.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">스타일 레퍼런스</span>
            <div className="flex gap-2 mt-2">
              {project.styleRef.images.slice(0, 3).map((img, idx) => (
                <img key={idx} src={img} alt={`Style ${idx + 1}`} className="w-16 h-16 object-cover border-2 border-ink-200" />
              ))}
            </div>
          </div>
        )}
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
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />

      <div className="relative bg-white border-4 border-ink-900 shadow-toon-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b-4 border-ink-200 flex justify-between items-center bg-warm-50">
          <div>
            <h2 className="text-xl font-black text-ink-900">캐릭터 설정</h2>
            <p className="text-xs text-ink-500">참조 이미지와 설명으로 일관된 캐릭터를 생성합니다</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-ink-100 hover:bg-red-500 hover:text-white transition flex items-center justify-center font-bold">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI 생성 섹션 */}
          <div className="bg-toon-50 border-2 border-toon-200 p-5">
            <h3 className="font-bold text-toon-700 mb-3 flex items-center gap-2">
              <span>✨</span> AI 캐릭터 시트 생성
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                placeholder="캐릭터 이름 (예: 김수현)"
                className="w-full p-3 border-2 border-toon-200 text-sm"
              />
              <textarea
                value={newCharDesc}
                onChange={(e) => setNewCharDesc(e.target.value)}
                placeholder="캐릭터 외모 설명 (예: 검은 단발머리, 날카로운 눈매, 20대 여성, 키 165cm, 슬림한 체형, 검은 가죽 재킷...)"
                className="w-full h-24 p-3 border-2 border-toon-200 text-sm resize-none"
              />
              <button
                onClick={handleGenerateCharacter}
                disabled={!newCharDesc.trim() || isGenerating}
                className={`
                  w-full py-3 font-bold text-sm border-2 border-ink-900 transition-all
                  ${!newCharDesc.trim() || isGenerating
                    ? 'opacity-40 cursor-not-allowed bg-ink-100'
                    : 'bg-toon-600 text-white hover:bg-toon-700 shadow-toon-sm'
                  }
                `}
              >
                {isGenerating ? '생성 중... (약 30초 소요)' : 'AI 캐릭터 시트 생성'}
              </button>
            </div>
          </div>

          {/* 기존 캐릭터 목록 */}
          {project.characters.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-ink-900">등록된 캐릭터 ({project.characters.length})</h3>
              {project.characters.map(char => (
                <div key={char.id} className="border-2 border-ink-200 p-4">
                  <div className="flex gap-4">
                    <div className="flex gap-2">
                      {char.referenceImages.map((img, idx) => (
                        <img key={idx} src={img} alt={`${char.name} ${idx + 1}`} className="w-20 h-20 object-cover border-2 border-ink-200" />
                      ))}
                      {char.referenceImages.length < 3 && (
                        <label className="w-20 h-20 border-2 border-dashed border-ink-300 flex items-center justify-center cursor-pointer hover:border-toon-500 transition">
                          <span className="text-ink-400 text-2xl">+</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(char.id, e.target.files)}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                        className="font-bold text-ink-900 border-b border-transparent hover:border-ink-300 focus:border-toon-500 outline-none"
                      />
                      <select
                        value={char.role}
                        onChange={(e) => updateCharacter(char.id, { role: e.target.value as any })}
                        className="block mt-1 text-xs text-ink-500 border border-ink-200 px-2 py-1"
                      >
                        <option value="protagonist">주인공</option>
                        <option value="supporting">조연</option>
                        <option value="antagonist">악역</option>
                      </select>
                      <p className="text-xs text-ink-600 mt-2 line-clamp-2">{char.description}</p>
                    </div>
                    <button
                      onClick={() => removeCharacter(char.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold self-start"
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
        <div className="px-6 py-4 border-t-4 border-ink-200 bg-warm-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-sm bg-toon-600 text-white border-2 border-ink-900 shadow-toon-sm hover:shadow-none transition"
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
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />

      <div className="relative bg-white border-4 border-ink-900 shadow-toon-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b-4 border-ink-200 flex justify-between items-center bg-warm-50">
          <div>
            <h2 className="text-xl font-black text-ink-900">스타일 레퍼런스</h2>
            <p className="text-xs text-ink-500">원하는 그림체의 참조 이미지를 등록하세요</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-ink-100 hover:bg-red-500 hover:text-white transition flex items-center justify-center font-bold">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI 생성 섹션 */}
          <div className="bg-toon-50 border-2 border-toon-200 p-5">
            <h3 className="font-bold text-toon-700 mb-3 flex items-center gap-2">
              <span>✨</span> AI 스타일 레퍼런스 생성
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-ink-600 block mb-2">스타일 키워드 선택</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_KEYWORDS.map(keyword => (
                    <button
                      key={keyword}
                      onClick={() => toggleKeyword(keyword)}
                      className={`
                        px-3 py-1.5 text-xs font-bold border-2 transition-all
                        ${selectedKeywords.includes(keyword)
                          ? 'bg-toon-600 text-white border-toon-600'
                          : 'bg-white border-ink-200 hover:border-toon-500'
                        }
                      `}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-600 block mb-2">샘플 장면 설명</label>
                <input
                  type="text"
                  value={sampleScene}
                  onChange={(e) => setSampleScene(e.target.value)}
                  placeholder="예: 도시 야경 배경의 캐릭터"
                  className="w-full p-3 border-2 border-toon-200 text-sm"
                />
              </div>

              <button
                onClick={handleGenerateStyle}
                disabled={selectedKeywords.length === 0 || isGenerating}
                className={`
                  w-full py-3 font-bold text-sm border-2 border-ink-900 transition-all
                  ${selectedKeywords.length === 0 || isGenerating
                    ? 'opacity-40 cursor-not-allowed bg-ink-100'
                    : 'bg-toon-600 text-white hover:bg-toon-700 shadow-toon-sm'
                  }
                `}
              >
                {isGenerating ? '생성 중... (약 30초 소요)' : 'AI 스타일 레퍼런스 생성'}
              </button>
            </div>
          </div>

          {/* 파일 업로드 섹션 */}
          <div className="border-2 border-ink-200 p-5">
            <h3 className="font-bold text-ink-900 mb-3">직접 이미지 업로드 (최대 5장)</h3>

            <div className="flex gap-3 flex-wrap">
              {project.styleRef?.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt={`Style ${idx + 1}`} className="w-24 h-24 object-cover border-2 border-ink-200" />
                  <button
                    onClick={() => {
                      const newImages = project.styleRef!.images.filter((_, i) => i !== idx);
                      if (newImages.length === 0) {
                        setStyleRef(null);
                      } else {
                        setStyleRef({ ...project.styleRef!, images: newImages });
                      }
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {(!project.styleRef || project.styleRef.images.length < 5) && (
                <label className="w-24 h-24 border-2 border-dashed border-ink-300 flex items-center justify-center cursor-pointer hover:border-toon-500 transition">
                  <span className="text-ink-400 text-2xl">+</span>
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
        <div className="px-6 py-4 border-t-4 border-ink-200 bg-warm-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-sm bg-toon-600 text-white border-2 border-ink-900 shadow-toon-sm hover:shadow-none transition"
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
  const { project, ideaInput, goToNextStep, markStepComplete, isStepComplete } = useProjectStore();

  const canProceed = (ideaInput.trim().length > 0 || project.synopsis.length > 0) &&
                     project.genre !== null &&
                     project.artStyle !== null;

  const handleProceed = () => {
    if (!canProceed) return;

    markStepComplete('idea');
    markStepComplete('genre');
    markStepComplete('style');
    goToNextStep();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-ink-200 px-8 py-6 bg-white/50">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-toon-600 text-white flex items-center justify-center font-mono text-sm font-bold shadow-toon-sm">
            01
          </span>
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">
            CONCEPT
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-ink-900">
          웹툰 기획
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-[1fr_350px]">
          {/* Left: Editor */}
          <div className="overflow-y-auto p-8 space-y-6">
            <StoryInputSection />

            <div className="grid grid-cols-2 gap-4">
              <GenreQuickSelect />
              <StyleQuickSelect />
            </div>

            <AdvancedOptionsBar onOpenModal={setActiveModal} />
          </div>

          {/* Right: Preview */}
          <div className="border-l-4 border-ink-200">
            <LivePreview />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-ink-200 px-8 py-6 bg-warm-100/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {project.synopsis && <span className="text-xs text-green-600 font-bold">✓ 시놉시스</span>}
            {project.genre && <span className="text-xs text-green-600 font-bold">✓ 장르</span>}
            {project.artStyle && <span className="text-xs text-green-600 font-bold">✓ 스타일</span>}
          </div>

          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className={`
              px-8 py-4 font-bold text-sm border-2 border-ink-900 transition-all
              ${!canProceed
                ? 'opacity-40 cursor-not-allowed bg-ink-100 text-ink-400'
                : 'bg-toon-600 text-white hover:bg-toon-700 shadow-toon-sm hover:shadow-none'
              }
            `}
          >
            콘티 생성하기 →
          </button>
        </div>
      </footer>

      {/* Modals */}
      <CharacterModal open={activeModal === 'characters'} onClose={() => setActiveModal(null)} />
      <StyleRefModal open={activeModal === 'styleRef'} onClose={() => setActiveModal(null)} />
    </div>
  );
};
