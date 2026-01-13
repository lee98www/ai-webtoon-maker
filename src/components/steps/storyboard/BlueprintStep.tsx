import React, { useState } from 'react';
import { useProjectStore } from '../../../store/projectStore';
import { generateStoryboard, generateCharacterSheet, generateLocationSheet } from '../../../../services/geminiService';
import { PanelConfig } from '../../../../types';

export const BlueprintStep: React.FC = () => {
  const {
    project,
    ideaInput,
    isProcessing,
    setProject,
    setProcessing,
    setError,
    updatePanelByIndex,
    markStepComplete
  } = useProjectStore();

  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number | null>(null);

  const [sheetGenerationStatus, setSheetGenerationStatus] = useState<string>('');

  const handleGenerateStoryboard = async () => {
    if (!project.synopsis && !ideaInput) return;
    setProcessing(true);
    setSheetGenerationStatus('콘티 생성 중...');

    try {
      // 1단계: 콘티 생성
      const res = await generateStoryboard(project.synopsis || ideaInput, project.genre);

      // 캐릭터/장소 텍스트 정보 먼저 저장
      const mainCharacterSheet = res.mainCharacter ? {
        name: res.mainCharacter.name,
        appearance: res.mainCharacter.appearance,
        clothing: res.mainCharacter.clothing,
        distinctiveFeatures: res.mainCharacter.distinctiveFeatures,
        sheetImageUrl: undefined as string | undefined
      } : undefined;

      const locationSheet = res.location ? {
        name: res.location.name,
        description: res.location.description,
        lighting: res.location.lighting,
        atmosphere: res.location.atmosphere,
        timeOfDay: res.location.timeOfDay || 'day',
        sheetImageUrl: undefined as string | undefined
      } : undefined;

      // 콘티 먼저 저장 (UI 업데이트)
      setProject({
        ...res,
        synopsis: project.synopsis || ideaInput,
        mainCharacterSheet,
        locationSheet
      });

      // 2단계: 캐릭터 시트 이미지 생성 (병렬)
      setSheetGenerationStatus('캐릭터/장소 시트 생성 중...');

      const sheetPromises: Promise<void>[] = [];

      // 캐릭터 시트 생성
      if (res.mainCharacter && res.mainCharacter.appearance) {
        sheetPromises.push(
          generateCharacterSheet({
            name: res.mainCharacter.name,
            description: `${res.mainCharacter.appearance}. Clothing: ${res.mainCharacter.clothing}. Features: ${res.mainCharacter.distinctiveFeatures}`,
            artStyle: project.artStyle,
            genre: project.genre
          }).then((charResult) => {
            setProject((prev) => ({
              ...prev,
              mainCharacterSheet: prev.mainCharacterSheet ? {
                ...prev.mainCharacterSheet,
                sheetImageUrl: charResult.imageUrl
              } : undefined
            }));
          }).catch((err) => {
            console.error('캐릭터 시트 생성 실패:', err);
          })
        );
      }

      // 장소 시트 생성
      if (res.location && res.location.description) {
        sheetPromises.push(
          generateLocationSheet({
            name: res.location.name,
            description: res.location.description,
            lighting: res.location.lighting,
            atmosphere: res.location.atmosphere,
            timeOfDay: res.location.timeOfDay || 'day',
            artStyle: project.artStyle,
            genre: project.genre
          }).then((locResult) => {
            setProject((prev) => ({
              ...prev,
              locationSheet: prev.locationSheet ? {
                ...prev.locationSheet,
                sheetImageUrl: locResult.imageUrl
              } : undefined
            }));
          }).catch((err) => {
            console.error('장소 시트 생성 실패:', err);
          })
        );
      }

      // 시트 생성 완료 대기 (실패해도 계속 진행)
      await Promise.allSettled(sheetPromises);

      setSheetGenerationStatus('');
      markStepComplete('blueprint');
    } catch (e) {
      const message = e instanceof Error ? e.message : '콘티 생성 실패';
      setError({ message, type: 'error' });
      setSheetGenerationStatus('');
    } finally {
      setProcessing(false);
    }
  };

  // No panels yet - show generate view
  if (project.panels.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-lg px-8">
          {/* Icon */}
          <div className="w-20 h-20 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>

          {project.synopsis || ideaInput ? (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                8컷 스토리보드 생성
              </h2>
              <p className="text-slate-500 text-sm mb-2">
                AI가 스토리를 분석하여 8개의 패널로 구성합니다
              </p>
              <p className="text-slate-400 text-xs mb-8 line-clamp-2 italic">
                "{(project.synopsis || ideaInput).slice(0, 100)}..."
              </p>

              <button
                onClick={handleGenerateStoryboard}
                disabled={isProcessing}
                className={`
                  inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-medium transition-all
                  ${isProcessing
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{sheetGenerationStatus || '처리 중...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>스토리보드 생성하기</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                스토리가 필요합니다
              </h2>
              <p className="text-slate-500 text-sm">
                이전 단계에서 스토리 아이디어를 먼저 입력해주세요
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const selectedPanel = selectedPanelIndex !== null ? project.panels[selectedPanelIndex] : null;

  // Has panels - show grid view
  return (
    <div className="h-full flex bg-white">
      {/* Left: Panel Grid */}
      <div className="flex-1 flex flex-col border-r border-slate-200">
        {/* Grid Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="font-semibold text-slate-900">패널 구성</h2>
            <p className="text-xs text-slate-500 mt-0.5">클릭하여 편집할 패널을 선택하세요</p>
          </div>
          <button
            onClick={handleGenerateStoryboard}
            disabled={isProcessing}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            다시 생성
          </button>
        </div>

        {/* Character & Location Sheets */}
        {(project.mainCharacterSheet || project.locationSheet) && (
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="grid grid-cols-2 gap-4">
              {/* Character Sheet */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs font-medium text-blue-700">캐릭터 시트</span>
                  </div>
                </div>
                <div className="p-3">
                  {project.mainCharacterSheet?.sheetImageUrl ? (
                    <img
                      src={project.mainCharacterSheet.sheetImageUrl}
                      alt="Character Sheet"
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-slate-100 rounded flex items-center justify-center mb-2">
                      <span className="text-xs text-slate-400">이미지 생성 대기</span>
                    </div>
                  )}
                  {project.mainCharacterSheet && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-700">{project.mainCharacterSheet.name || '이름 없음'}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{project.mainCharacterSheet.appearance}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Sheet */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-medium text-emerald-700">장소 시트</span>
                  </div>
                </div>
                <div className="p-3">
                  {project.locationSheet?.sheetImageUrl ? (
                    <img
                      src={project.locationSheet.sheetImageUrl}
                      alt="Location Sheet"
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-slate-100 rounded flex items-center justify-center mb-2">
                      <span className="text-xs text-slate-400">이미지 생성 대기</span>
                    </div>
                  )}
                  {project.locationSheet && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-700">{project.locationSheet.name || '장소 없음'}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{project.locationSheet.description}</p>
                      {project.locationSheet.lighting && (
                        <p className="text-[10px] text-slate-400">🔆 {project.locationSheet.lighting}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4x2 Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-4 gap-4 h-full">
            {project.panels.map((panel, index) => (
              <button
                key={panel.id}
                onClick={() => setSelectedPanelIndex(index)}
                className={`
                  relative flex flex-col rounded-xl border-2 transition-all text-left overflow-hidden
                  ${selectedPanelIndex === index
                    ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2'
                    : 'border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                {/* Panel Number */}
                <div className={`
                  absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold z-10
                  ${selectedPanelIndex === index
                    ? 'bg-slate-900 text-white'
                    : 'bg-white/90 text-slate-700 border border-slate-200'
                  }
                `}>
                  {index + 1}
                </div>

                {/* Panel Preview */}
                <div className="flex-1 bg-slate-100 p-4 pt-10 min-h-[120px]">
                  {panel.generatedImageUrl ? (
                    <img
                      src={panel.generatedImageUrl}
                      alt={`Panel ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Panel Info */}
                <div className="p-3 bg-white border-t border-slate-100">
                  {/* Shot & Angle Info */}
                  {(panel.shotSize || panel.cameraAngle) && (
                    <div className="flex gap-1 mb-1.5 flex-wrap">
                      {panel.shotSize && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                          {panel.shotSize.replace('_', ' ')}
                        </span>
                      )}
                      {panel.cameraAngle && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">
                          {panel.cameraAngle.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {panel.descriptionKo || panel.description || '설명 없음'}
                  </p>
                  {panel.dialogue && (
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      "{panel.dialogue}"
                    </p>
                  )}
                </div>

                {/* Time Offset Badge */}
                {panel.timeOffset && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-600/90 text-white rounded font-mono">
                      {panel.timeOffset}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Panel Editor */}
      <div className="w-[400px] flex flex-col bg-slate-50">
        {selectedPanel ? (
          <>
            {/* Editor Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                  {selectedPanelIndex! + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">패널 {selectedPanelIndex! + 1}</h3>
                  <div className="flex gap-1.5 mt-1">
                    {selectedPanel.shotSize && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {selectedPanel.shotSize.replace('_', ' ')}
                      </span>
                    )}
                    {selectedPanel.cameraAngle && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                        {selectedPanel.cameraAngle.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Visual Description */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                  비주얼 설명 (영문)
                </label>
                <textarea
                  value={selectedPanel.description}
                  onChange={(e) =>
                    updatePanelByIndex(selectedPanelIndex!, { description: e.target.value })
                  }
                  className="w-full h-28 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm resize-none focus:border-slate-400 focus:ring-0 transition-colors"
                  placeholder="Visual description for AI..."
                />
                <p className="text-xs text-slate-400 mt-2 leading-relaxed italic">
                  {selectedPanel.descriptionKo}
                </p>
              </div>

              {/* Director's Note */}
              {selectedPanel.directorNote && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-amber-700 mb-0.5">연출 의도</p>
                      <p className="text-xs text-amber-600">{selectedPanel.directorNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shot Size */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                  샷 크기
                </label>
                <select
                  value={selectedPanel.shotSize || ''}
                  onChange={(e) =>
                    updatePanelByIndex(selectedPanelIndex!, { shotSize: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-0"
                >
                  <option value="">선택...</option>
                  <option value="extreme_wide">Extreme Wide - 광활한 풍경</option>
                  <option value="wide">Wide - 환경 + 캐릭터</option>
                  <option value="full">Full - 전신</option>
                  <option value="medium_full">Medium Full - 무릎 위</option>
                  <option value="medium">Medium - 허리 위</option>
                  <option value="medium_close">Medium Close - 가슴 위</option>
                  <option value="close_up">Close-up - 얼굴</option>
                  <option value="extreme_close_up">Extreme Close-up - 디테일</option>
                </select>
              </div>

              {/* Camera Angle */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                  카메라 앵글
                </label>
                <select
                  value={selectedPanel.cameraAngle}
                  onChange={(e) =>
                    updatePanelByIndex(selectedPanelIndex!, { cameraAngle: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-0"
                >
                  <option value="">선택...</option>
                  <option value="eye_level">Eye Level - 중립, 동일시</option>
                  <option value="low_angle">Low Angle - 위압감, 영웅적</option>
                  <option value="high_angle">High Angle - 취약함, 열세</option>
                  <option value="dutch_angle">Dutch Angle - 불안, 긴장</option>
                  <option value="over_shoulder">Over Shoulder - 대화, 관계</option>
                  <option value="pov">POV - 1인칭 시점</option>
                  <option value="birds_eye">Bird's Eye - 전지적 시점</option>
                  <option value="worms_eye">Worm's Eye - 극적 위압감</option>
                </select>
              </div>

              {/* Visual Details */}
              {selectedPanel.visualDetails && selectedPanel.visualDetails.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                    시각적 디테일
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPanel.visualDetails.map((detail, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-rose-50 text-rose-600 rounded-full">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Composition */}
              {selectedPanel.composition && (
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                    구도
                  </label>
                  <p className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                    {selectedPanel.composition}
                  </p>
                </div>
              )}

              {/* Dialogue */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                  대사
                </label>
                <input
                  type="text"
                  value={selectedPanel.dialogue}
                  onChange={(e) =>
                    updatePanelByIndex(selectedPanelIndex!, { dialogue: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-0"
                  placeholder="캐릭터 대사..."
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                  나레이션
                </label>
                <input
                  type="text"
                  value={selectedPanel.caption}
                  onChange={(e) =>
                    updatePanelByIndex(selectedPanelIndex!, { caption: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-0"
                  placeholder="나레이션 텍스트..."
                />
              </div>

              {/* Character Focus */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
                  캐릭터 포커스
                </label>
                <input
                  type="text"
                  value={selectedPanel.characterFocus}
                  onChange={(e) =>
                    updatePanelByIndex(selectedPanelIndex!, { characterFocus: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-0"
                  placeholder="등장 캐릭터..."
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between">
              <button
                onClick={() => setSelectedPanelIndex(Math.max(0, selectedPanelIndex! - 1))}
                disabled={selectedPanelIndex === 0}
                className={`
                  flex items-center gap-1 text-sm
                  ${selectedPanelIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900'}
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                이전
              </button>
              <span className="text-sm text-slate-400">
                {selectedPanelIndex! + 1} / {project.panels.length}
              </span>
              <button
                onClick={() => setSelectedPanelIndex(Math.min(project.panels.length - 1, selectedPanelIndex! + 1))}
                disabled={selectedPanelIndex === project.panels.length - 1}
                className={`
                  flex items-center gap-1 text-sm
                  ${selectedPanelIndex === project.panels.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900'}
                `}
              >
                다음
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          /* No panel selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-8">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">
                왼쪽에서 패널을 선택하여<br />세부 내용을 편집하세요
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
