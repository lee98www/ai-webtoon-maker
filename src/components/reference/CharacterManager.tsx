import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CharacterReference } from '../../../types';
import { useProjectStore } from '../../store/projectStore';

const generateId = () => `char-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

export const CharacterManager: React.FC = () => {
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-ink-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-toon-500 rounded-full" />
            Character References
          </h3>
          <p className="text-xs text-ink-400 mt-1">
            캐릭터 참조 이미지를 업로드하면 일관된 캐릭터로 생성됩니다
          </p>
        </div>
        <button
          onClick={handleAddCharacter}
          className="text-xs font-bold px-4 py-2 bg-ink-900 text-white border-2 border-ink-900 hover:bg-ink-700 transition-colors shadow-toon-sm"
        >
          + 캐릭터 추가
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="border-2 border-dashed border-ink-300 p-8 text-center bg-warm-50">
          <p className="text-ink-400 text-sm">
            캐릭터를 추가하여 일관된 캐릭터 생성을 시작하세요
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={(updates) => updateCharacter(character.id, updates)}
              onRemove={() => removeCharacter(character.id)}
            />
          ))}
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
    <div className="border-2 border-ink-200 p-6 space-y-4 hover:border-ink-900 hover:shadow-toon-sm transition-all bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-ink-400 block mb-2">
              캐릭터 이름
            </label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="예: 김철수"
              className="w-full p-2 border-2 border-ink-200 text-sm font-medium outline-none focus:border-toon-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-ink-400 block mb-2">
              역할
            </label>
            <select
              value={character.role}
              onChange={(e) =>
                onUpdate({ role: e.target.value as CharacterReference['role'] })
              }
              className="w-full p-2 border-2 border-ink-200 text-sm font-medium outline-none focus:border-toon-500 bg-white transition-colors"
            >
              <option value="protagonist">주인공</option>
              <option value="supporting">조연</option>
              <option value="antagonist">악역</option>
            </select>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="ml-4 w-6 h-6 flex items-center justify-center bg-ink-100 text-ink-400 hover:bg-red-500 hover:text-white transition-colors"
          aria-label="캐릭터 삭제"
        >
          ×
        </button>
      </div>

      <div>
        <label className="text-xs font-bold uppercase text-ink-400 block mb-2">
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
        <label className="text-xs font-bold uppercase text-ink-400 block mb-2">
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
                ×
              </button>
            </div>
          ))}

          {character.referenceImages.length < 3 && (
            <div
              {...getRootProps()}
              className={`w-20 h-20 border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-toon-500 bg-toon-50'
                  : 'border-ink-300 hover:border-ink-900'
              }`}
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

export default CharacterManager;
