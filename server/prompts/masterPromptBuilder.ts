// ============================================
// Master Prompt Builder
// 통합 프롬프트 빌더
// 모든 연출 시스템을 하나로 통합
// ============================================

import { ArtStyle, buildStylePrompt } from './stylePrompts';
import { Genre, buildGenrePrompt } from './genreDirecting';
import { BeatType, EIGHT_PANEL_STRUCTURE, StoryBeat } from './storyboardPrompts';
import {
  CompositionRule,
  CameraMovement,
  CameraAngle,
  ShotSize,
  buildCompositionPrompt,
  recommendComposition
} from './cinematography';
import {
  TemporalEffectConfig,
  buildTemporalPrompt,
  recommendTemporalEffect
} from './temporalDirecting';
import {
  DepthOfFieldConfig,
  SpatialLayerConfig,
  EnvironmentLightingConfig,
  buildSpatialPrompt,
  recommendSpatialConfig,
  TIME_OF_DAY_LIGHTING,
  WEATHER_LIGHTING_MODIFIERS
} from './spatialDirecting';
import {
  BubbleType,
  CharacterVoice,
  buildDialoguePrompt
} from './dialogueSystem';

// ============================================
// 프롬프트 파트 (Priority Order)
// ============================================

interface PromptPart {
  category: PromptCategory;
  priority: number;        // 1-10 (1 = 최고 우선순위)
  content: string;
  isRequired: boolean;
}

type PromptCategory =
  | 'style'           // 아트 스타일
  | 'genre'           // 장르 연출
  | 'beat'            // 스토리 비트
  | 'composition'     // 구도/카메라
  | 'temporal'        // 시간 효과
  | 'spatial'         // 공간/심도
  | 'character'       // 캐릭터 외형
  | 'scene'           // 장면 묘사
  | 'dialogue'        // 대사 지시
  | 'constraints';    // 금지 사항

// ============================================
// Master Prompt Builder 클래스
// ============================================

export class MasterPromptBuilder {
  private parts: PromptPart[] = [];
  private genre: Genre = Genre.ACTION;
  private artStyle: ArtStyle = ArtStyle.WEBTOON_STANDARD;

  constructor() {
    // 기본 금지 사항 추가
    this.addConstraints();
  }

  // 아트 스타일 설정
  setStyle(style: ArtStyle): this {
    this.artStyle = style;
    this.parts.push({
      category: 'style',
      priority: 1,
      content: buildStylePrompt(style),
      isRequired: true
    });
    return this;
  }

  // 장르 설정
  setGenre(genre: Genre): this {
    this.genre = genre;
    this.parts.push({
      category: 'genre',
      priority: 2,
      content: buildGenrePrompt(genre),
      isRequired: true
    });
    return this;
  }

  // 스토리 비트 설정
  setBeat(beat: StoryBeat): this {
    this.parts.push({
      category: 'beat',
      priority: 3,
      content: this.buildBeatPrompt(beat),
      isRequired: true
    });
    return this;
  }

  // 비트 번호로 설정 (1-8)
  setBeatByNumber(panelNumber: number): this {
    const beatIndex = Math.min(Math.max(0, panelNumber - 1), 7);
    const beat = EIGHT_PANEL_STRUCTURE[beatIndex];
    return this.setBeat(beat);
  }

  // 구도 설정 (수동)
  setComposition(
    composition: CompositionRule,
    shotSize: ShotSize,
    angle: CameraAngle,
    movement?: CameraMovement
  ): this {
    this.parts.push({
      category: 'composition',
      priority: 4,
      content: buildCompositionPrompt(composition, shotSize, angle, movement),
      isRequired: false
    });
    return this;
  }

  // 구도 자동 추천
  autoComposition(beatType: BeatType, emotionalWeight: number): this {
    const recommended = recommendComposition(beatType, this.genre, emotionalWeight);
    return this.setComposition(
      recommended.composition,
      recommended.shotSize,
      recommended.angle,
      recommended.movement
    );
  }

  // 시간 효과 설정 (수동)
  setTemporalEffect(config: TemporalEffectConfig): this {
    this.parts.push({
      category: 'temporal',
      priority: 5,
      content: buildTemporalPrompt(config),
      isRequired: false
    });
    return this;
  }

  // 시간 효과 자동 추천
  autoTemporalEffect(beatType: BeatType, emotionalWeight: number): this {
    const recommended = recommendTemporalEffect(beatType, emotionalWeight);
    return this.setTemporalEffect(recommended);
  }

  // 공간 연출 설정 (수동)
  setSpatialDirecting(
    dof: DepthOfFieldConfig,
    layers: SpatialLayerConfig,
    lighting: EnvironmentLightingConfig
  ): this {
    this.parts.push({
      category: 'spatial',
      priority: 6,
      content: buildSpatialPrompt(dof, layers, lighting),
      isRequired: false
    });
    return this;
  }

  // 공간 연출 자동 (간소화 버전)
  autoSpatialDirecting(beatType: BeatType, emotionalWeight: number, sceneDescription: string): this {
    const recommended = recommendSpatialConfig(beatType, this.genre, emotionalWeight);

    const layers: SpatialLayerConfig = {
      midground: sceneDescription,
      background: {
        type: 'environment',
        description: 'contextual background matching scene',
        detailLevel: recommended.dof.aperture === 'deep' ? 'detailed' : 'moderate',
        blur: recommended.dof.bokehIntensity
      },
      atmosphericDepth: recommended.atmosphere,
      depthCues: [
        'size diminution for distant objects',
        'atmospheric perspective',
        'overlapping elements'
      ]
    };

    const timePreset = TIME_OF_DAY_LIGHTING[recommended.timeOfDay];
    const lighting: EnvironmentLightingConfig = {
      timeOfDay: recommended.timeOfDay,
      weather: 'clear',
      ambientColor: timePreset.ambientColor,
      keyLightDirection: timePreset.keyLightDirection,
      shadowIntensity: timePreset.shadowIntensity,
      shadowSoftness: timePreset.shadowSoftness
    };

    return this.setSpatialDirecting(recommended.dof, layers, lighting);
  }

  // 캐릭터 외형 설정
  setCharacterVisuals(characterDescription: string): this {
    this.parts.push({
      category: 'character',
      priority: 7,
      content: `[CHARACTER VISUAL CONSISTENCY - CRITICAL]
${characterDescription}

IMPORTANT: Maintain exact character appearance across all panels.
Pay special attention to:
- Face shape and features
- Hair style, length, and color
- Clothing details and colors
- Any distinguishing marks or accessories`,
      isRequired: true
    });
    return this;
  }

  // 장면 묘사 설정
  setSceneDescription(description: string, descriptionKo?: string): this {
    this.parts.push({
      category: 'scene',
      priority: 8,
      content: `[SCENE DESCRIPTION]
${description}
${descriptionKo ? `\n(한글 참고: ${descriptionKo})` : ''}`,
      isRequired: true
    });
    return this;
  }

  // 대사 지시 (이미지에는 렌더링하지 않음)
  setDialogueGuidance(
    dialogue: string,
    bubbleType: BubbleType,
    characterVoice?: CharacterVoice
  ): this {
    this.parts.push({
      category: 'dialogue',
      priority: 9,
      content: `[DIALOGUE CONTEXT - DO NOT RENDER TEXT]
The character is saying: "${dialogue}"
Bubble Type: ${bubbleType}
${characterVoice ? `Voice Pattern: ${characterVoice.speechPattern}` : ''}

NOTE: Leave appropriate space in the panel for speech bubble overlay.
DO NOT render any text directly on the image.`,
      isRequired: false
    });
    return this;
  }

  // 금지 사항 (기본 추가)
  private addConstraints(): void {
    this.parts.push({
      category: 'constraints',
      priority: 10,
      content: `[CRITICAL CONSTRAINTS - MUST FOLLOW]

TEXT RENDERING:
- DO NOT render any text, letters, words, speech bubbles, or text boxes
- Leave clean space for text overlay (upper area for narration, near faces for dialogue)
- Focus ONLY on visual imagery

QUALITY:
- Avoid blurry, low quality, or pixelated output
- No watermarks, signatures, or artifacts
- Maintain consistent character proportions

COMPOSITION:
- DO NOT copy previous panel composition exactly
- Each panel should feel like the NEXT moment in time
- Advance the visual story with new angles and poses`,
      isRequired: true
    });
  }

  // 사용자 정의 제약 추가
  addCustomConstraint(constraint: string): this {
    const existingConstraint = this.parts.find(p => p.category === 'constraints');
    if (existingConstraint) {
      existingConstraint.content += `\n\nADDITIONAL:\n- ${constraint}`;
    }
    return this;
  }

  // 이전 패널 참조 추가
  addPreviousPanelReference(referenceNote: string): this {
    this.parts.push({
      category: 'character',  // 캐릭터 일관성 카테고리로
      priority: 7.5,
      content: `[PREVIOUS PANEL REFERENCE]
${referenceNote}

USE THIS FOR:
- Character appearance consistency (face, hair, clothing)
- Location/setting continuity (if same location)
- Color palette and lighting mood

DO NOT:
- Copy the composition directly
- Use the same camera angle
- Replicate the pose exactly

CREATE A NEW, DISTINCT COMPOSITION that advances the story.`,
      isRequired: false
    });
    return this;
  }

  // 완전 자동 모드 (비트와 감정만으로 모든 연출 자동 설정)
  autoDirectAll(
    panelNumber: number,
    emotionalWeight: number,
    sceneDescription: string
  ): this {
    const beatIndex = Math.min(Math.max(0, panelNumber - 1), 7);
    const beat = EIGHT_PANEL_STRUCTURE[beatIndex];

    return this
      .setBeat(beat)
      .autoComposition(beat.beatType, emotionalWeight)
      .autoTemporalEffect(beat.beatType, emotionalWeight)
      .autoSpatialDirecting(beat.beatType, emotionalWeight, sceneDescription);
  }

  // 최종 프롬프트 빌드
  build(): string {
    // 우선순위로 정렬
    const sortedParts = [...this.parts].sort((a, b) => a.priority - b.priority);

    // 중복 카테고리 제거 (같은 카테고리면 낮은 우선순위 유지)
    const uniqueParts = new Map<PromptCategory, PromptPart>();
    for (const part of sortedParts) {
      if (!uniqueParts.has(part.category)) {
        uniqueParts.set(part.category, part);
      }
    }

    // 프롬프트 조립
    const finalPrompt = Array.from(uniqueParts.values())
      .sort((a, b) => a.priority - b.priority)
      .map(part => part.content)
      .join('\n\n' + '='.repeat(50) + '\n\n');

    return finalPrompt;
  }

  // 빌드 후 초기화
  reset(): this {
    this.parts = [];
    this.addConstraints();
    return this;
  }
}

// ============================================
// 편의 함수: 빠른 프롬프트 생성
// ============================================

export function quickBuildPrompt(options: {
  style: ArtStyle;
  genre: Genre;
  panelNumber: number;
  emotionalWeight: number;
  characterVisuals: string;
  sceneDescription: string;
  dialogue?: string;
  bubbleType?: BubbleType;
}): string {
  const builder = new MasterPromptBuilder();

  builder
    .setStyle(options.style)
    .setGenre(options.genre)
    .autoDirectAll(options.panelNumber, options.emotionalWeight, options.sceneDescription)
    .setCharacterVisuals(options.characterVisuals)
    .setSceneDescription(options.sceneDescription);

  if (options.dialogue && options.bubbleType) {
    builder.setDialogueGuidance(options.dialogue, options.bubbleType);
  }

  return builder.build();
}

// ============================================
// 프롬프트 검증
// ============================================

export function validatePrompt(prompt: string): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 필수 섹션 확인
  if (!prompt.includes('[VISUAL STYLE')) {
    errors.push('Missing VISUAL STYLE section');
  }
  if (!prompt.includes('[GENRE DIRECTION')) {
    errors.push('Missing GENRE DIRECTION section');
  }
  if (!prompt.includes('[CRITICAL CONSTRAINTS')) {
    errors.push('Missing CONSTRAINTS section');
  }

  // 권장 섹션 확인
  if (!prompt.includes('[CINEMATOGRAPHY')) {
    warnings.push('No cinematography direction - composition may be generic');
  }
  if (!prompt.includes('[TEMPORAL DIRECTING')) {
    warnings.push('No temporal effect - consider adding for dramatic impact');
  }
  if (!prompt.includes('[SPATIAL DIRECTING')) {
    warnings.push('No spatial direction - depth may be flat');
  }

  // 프롬프트 길이 확인
  if (prompt.length < 500) {
    warnings.push('Prompt is short - may lack sufficient detail');
  }
  if (prompt.length > 8000) {
    warnings.push('Prompt is very long - consider simplifying');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}
