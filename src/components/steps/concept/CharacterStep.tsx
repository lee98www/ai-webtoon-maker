import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CharacterReference } from '../../../../types';
import { useProjectStore } from '../../../store/projectStore';

const generateId = () => `char-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

export const CharacterStep: React.FC = () => {
  const { project, addCharacter, updateCharacter, removeCharacter } = useProjectStore();
  const characters = project.characters;

  const handleAddCharacter = () => {
    const newCharacter: CharacterReference = {
      id: generateId(),
      name: '',
      role: 'protagonist',
      description: '',
      referenceImages: []
    };
    addCharacter(newCharacter);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-ink-500 leading-relaxed mb-2">
          캐릭터 참조 이미지를 업로드하면 일관된 캐릭터로 생성됩니다.
        </p>
        <p className="text-xs text-ink-400">
          * 이 단계는 선택사항입니다. 건너뛰어도 됩니다.
        </p>
      </div>

      {characters.length === 0 ? (
        <div className="border-2 border-dashed border-ink-300 p-8 text-center bg-warm-50">
          <div className="w-12 h-12 bg-ink-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-ink-500 mb-4">
            캐릭터를 추가하여 일관된 캐릭터 생성을 시작하세요
          </p>
          <button
            onClick={handleAddCharacter}
            className="px-6 py-3 bg-ink-900 text-white font-bold text-sm border-2 border-ink-900 hover:bg-ink-700 transition-colors shadow-toon-sm"
          >
            + 첫 번째 캐릭터 추가
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={(updates) => updateCharacter(character.id, updates)}
              onRemove={() => removeCharacter(character.id)}
            />
          ))}

          <button
            onClick={handleAddCharacter}
            className="w-full py-3 border-2 border-dashed border-ink-300 text-ink-500 font-bold text-sm hover:border-ink-900 hover:text-ink-900 transition-colors"
          >
            + 캐릭터 추가
          </button>
        </div>
      )}
    </div>
  );
};

interface CharacterCardProps {
  character: CharacterReference;
  onUpdate: (updates: Partial<CharacterReference>) => void;
  onRemove: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onUpdate,
  onRemove
}) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newImages = await Promise.all(
        acceptedFiles.slice(0, 3 - character.referenceImages.length).map(fileToBase64)
      );
      onUpdate({
        referenceImages: [...character.referenceImages, ...newImages].slice(0, 3)
      });
    },
    [character.referenceImages, onUpdate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 3 - character.referenceImages.length,
    disabled: character.referenceImages.length >= 3
  });

  const removeImage = (index: number) => {
    const newImages = character.referenceImages.filter((_, i) => i !== index);
    onUpdate({ referenceImages: newImages });
  };

  return (
    <div className="border-2 border-ink-200 p-5 space-y-4 bg-white hover:border-ink-900 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase text-ink-400 block mb-1.5">
              캐릭터 이름
            </label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="예: 김철수"
              className="w-full p-2.5 border-2 border-ink-200 text-sm font-medium outline-none focus:border-toon-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-ink-400 block mb-1.5">
              역할
            </label>
            <select
              value={character.role}
              onChange={(e) =>
                onUpdate({ role: e.target.value as CharacterReference['role'] })
              }
              className="w-full p-2.5 border-2 border-ink-200 text-sm font-medium outline-none focus:border-toon-500 bg-white transition-colors"
            >
              <option value="protagonist">주인공</option>
              <option value="supporting">조연</option>
              <option value="antagonist">악역</option>
            </select>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center bg-ink-100 text-ink-400 hover:bg-red-500 hover:text-white transition-colors"
          aria-label="캐릭터 삭제"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <label className="text-xs font-bold uppercase text-ink-400 block mb-1.5">
          외형 설명
        </label>
        <textarea
          value={character.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="예: 검은 단발머리, 날카로운 눈매, 키가 크고 마른 체형, 검은색 코트 착용"
          className="w-full p-3 border-2 border-ink-200 text-sm outline-none focus:border-toon-500 resize-none h-20 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase text-ink-400 block mb-1.5">
          참조 이미지 (최대 3장)
        </label>
        <div className="flex gap-3">
          {character.referenceImages.map((img, i) => (
            <div key={i} className="relative w-20 h-20 group">
              <img
                src={img}
                alt={`${character.name} 참조 ${i + 1}`}
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

          {character.referenceImages.length < 3 && (
            <div
              {...getRootProps()}
              className={`
                w-20 h-20 border-2 border-dashed flex items-center justify-center cursor-pointer transition-all
                ${isDragActive
                  ? 'border-toon-500 bg-toon-50'
                  : 'border-ink-300 hover:border-ink-900'
                }
              `}
            >
              <input {...getInputProps()} />
              <span className="text-2xl text-ink-300">+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
