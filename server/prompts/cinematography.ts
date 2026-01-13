// ============================================
// Professional Cinematography System
// 전문 시네마토그래피 시스템
// 구도 이론, 카메라 움직임, 프레이밍 가이드
// ============================================

import { Genre } from './genreDirecting';
import { BeatType } from './storyboardPrompts';

// ============================================
// 구도 이론 (Composition Rules)
// ============================================

export type CompositionType =
  | 'rule_of_thirds'      // 삼분법
  | 'golden_ratio'        // 황금비
  | 'diagonal'            // 대각선 구도
  | 'symmetrical'         // 대칭 구도
  | 'asymmetrical'        // 비대칭 구도
  | 'frame_within_frame'  // 프레임 속 프레임
  | 'leading_lines'       // 유도선 구도
  | 'centered'            // 중앙 배치
  | 'negative_space';     // 여백 활용

export type SubjectPlacement =
  | 'left_third'          // 좌측 1/3 지점
  | 'right_third'         // 우측 1/3 지점
  | 'upper_third'         // 상단 1/3 지점
  | 'lower_third'         // 하단 1/3 지점
  | 'golden_point_tl'     // 황금점 좌상
  | 'golden_point_tr'     // 황금점 우상
  | 'golden_point_bl'     // 황금점 좌하
  | 'golden_point_br'     // 황금점 우하
  | 'center'              // 정중앙
  | 'off_center';         // 약간 비껴난 중앙

export interface CompositionRule {
  type: CompositionType;
  subjectPlacement: SubjectPlacement;
  leadingLines?: string;          // "window frame", "road", "stairs", "shadows"
  negativeSpaceDirection?: 'left' | 'right' | 'top' | 'bottom'; // 여백 방향
  visualWeight: 'balanced' | 'left_heavy' | 'right_heavy' | 'top_heavy' | 'bottom_heavy';
}

// ============================================
// 카메라 움직임 (Camera Movement)
// ============================================

export type CameraMovementType =
  | 'static'              // 고정 샷
  | 'pan_left'            // 좌로 패닝
  | 'pan_right'           // 우로 패닝
  | 'tilt_up'             // 위로 틸트
  | 'tilt_down'           // 아래로 틸트
  | 'zoom_in'             // 줌 인
  | 'zoom_out'            // 줌 아웃
  | 'dolly_in'            // 달리 인 (접근)
  | 'dolly_out'           // 달리 아웃 (후퇴)
  | 'tracking'            // 추적 샷
  | 'crane_up'            // 크레인 상승
  | 'crane_down'          // 크레인 하강
  | 'handheld'            // 핸드헬드 (흔들림)
  | 'steadicam';          // 스테디캠 (부드러운 이동)

export type MovementSpeed = 'very_slow' | 'slow' | 'medium' | 'fast' | 'very_fast';

export interface CameraMovement {
  type: CameraMovementType;
  speed: MovementSpeed;
  purpose: string;                // "reveal mystery", "follow action", "build tension"
  startFrame?: string;            // 시작 프레임 설명
  endFrame?: string;              // 종료 프레임 설명
}

// ============================================
// 카메라 앵글 확장
// ============================================

export type CameraAngle =
  | 'eye_level'           // 아이 레벨 (표준)
  | 'low_angle'           // 로우 앵글 (위압감, 영웅적)
  | 'high_angle'          // 하이 앵글 (취약함, 열세)
  | 'dutch_angle'         // 더치 앵글 (불안, 긴장)
  | 'birds_eye'           // 버드아이 (전지적 시점)
  | 'worms_eye'           // 웜아이 (극도로 낮은 시점)
  | 'over_shoulder'       // 오버숄더 (대화 장면)
  | 'pov'                 // 1인칭 시점
  | 'two_shot';           // 투샷 (두 인물)

export type ShotSize =
  | 'extreme_wide'        // 익스트림 와이드 (환경 전체)
  | 'wide'                // 와이드 (인물 + 배경)
  | 'full'                // 풀샷 (인물 전신)
  | 'medium_full'         // 미디엄 풀 (무릎 위)
  | 'medium'              // 미디엄 (허리 위)
  | 'medium_close'        // 미디엄 클로즈 (가슴 위)
  | 'close_up'            // 클로즈업 (얼굴)
  | 'extreme_close_up'    // 익스트림 클로즈업 (눈, 입 등 부분)
  | 'detail';             // 디테일 샷 (물건, 손 등)

// ============================================
// 비트별 기본 구도 권장사항
// ============================================

export const BEAT_COMPOSITION_DEFAULTS: Record<BeatType, {
  composition: CompositionRule;
  shotSize: ShotSize;
  angle: CameraAngle;
  movement?: CameraMovement;
}> = {
  'hook': {
    composition: {
      type: 'diagonal',
      subjectPlacement: 'golden_point_br',
      visualWeight: 'right_heavy'
    },
    shotSize: 'wide',
    angle: 'dutch_angle',
    movement: { type: 'zoom_in', speed: 'slow', purpose: 'draw viewer in' }
  },
  'setup': {
    composition: {
      type: 'rule_of_thirds',
      subjectPlacement: 'left_third',
      negativeSpaceDirection: 'right',
      visualWeight: 'balanced'
    },
    shotSize: 'medium_full',
    angle: 'eye_level'
  },
  'development': {
    composition: {
      type: 'rule_of_thirds',
      subjectPlacement: 'right_third',
      visualWeight: 'balanced'
    },
    shotSize: 'medium',
    angle: 'eye_level'
  },
  'escalation': {
    composition: {
      type: 'diagonal',
      subjectPlacement: 'center',
      leadingLines: 'converging lines toward subject',
      visualWeight: 'balanced'
    },
    shotSize: 'medium_close',
    angle: 'dutch_angle',
    movement: { type: 'dolly_in', speed: 'medium', purpose: 'increase tension' }
  },
  'pre_climax': {
    composition: {
      type: 'centered',
      subjectPlacement: 'center',
      visualWeight: 'balanced'
    },
    shotSize: 'extreme_close_up',
    angle: 'eye_level',
    movement: { type: 'static', speed: 'very_slow', purpose: 'freeze moment' }
  },
  'climax': {
    composition: {
      type: 'golden_ratio',
      subjectPlacement: 'golden_point_tl',
      visualWeight: 'left_heavy'
    },
    shotSize: 'full',
    angle: 'low_angle',
    movement: { type: 'zoom_out', speed: 'fast', purpose: 'reveal impact' }
  },
  'cliffhanger': {
    composition: {
      type: 'negative_space',
      subjectPlacement: 'lower_third',
      negativeSpaceDirection: 'top',
      visualWeight: 'bottom_heavy'
    },
    shotSize: 'medium',
    angle: 'eye_level',
    movement: { type: 'pan_right', speed: 'slow', purpose: 'reveal mystery' }
  }
};

// ============================================
// 장르별 구도 특성
// ============================================

export const GENRE_COMPOSITION_STYLE: Record<Genre, {
  preferredCompositions: CompositionType[];
  avoidCompositions: CompositionType[];
  preferredAngles: CameraAngle[];
  movementStyle: string;
}> = {
  [Genre.ACTION]: {
    preferredCompositions: ['diagonal', 'asymmetrical', 'leading_lines'],
    avoidCompositions: ['symmetrical', 'centered'],
    preferredAngles: ['low_angle', 'worms_eye', 'dutch_angle'],
    movementStyle: 'dynamic, rapid changes, tracking shots'
  },
  [Genre.ROMANCE]: {
    preferredCompositions: ['rule_of_thirds', 'negative_space', 'frame_within_frame'],
    avoidCompositions: ['diagonal', 'asymmetrical'],
    preferredAngles: ['eye_level', 'over_shoulder', 'two_shot'],
    movementStyle: 'slow, gentle, dolly movements'
  },
  [Genre.HORROR]: {
    preferredCompositions: ['asymmetrical', 'negative_space', 'frame_within_frame'],
    avoidCompositions: ['symmetrical', 'centered'],
    preferredAngles: ['dutch_angle', 'high_angle', 'pov'],
    movementStyle: 'unsettling, irregular, unexpected movements'
  },
  [Genre.FANTASY]: {
    preferredCompositions: ['golden_ratio', 'symmetrical', 'leading_lines'],
    avoidCompositions: ['asymmetrical'],
    preferredAngles: ['low_angle', 'birds_eye', 'wide'],
    movementStyle: 'epic, sweeping, crane shots'
  },
  [Genre.SLICE_OF_LIFE]: {
    preferredCompositions: ['rule_of_thirds', 'centered', 'negative_space'],
    avoidCompositions: ['diagonal', 'asymmetrical'],
    preferredAngles: ['eye_level', 'medium'],
    movementStyle: 'natural, observational, minimal movement'
  },
  [Genre.NOIR]: {
    preferredCompositions: ['diagonal', 'frame_within_frame', 'negative_space'],
    avoidCompositions: ['centered', 'symmetrical'],
    preferredAngles: ['dutch_angle', 'low_angle', 'over_shoulder'],
    movementStyle: 'slow reveal, shadows, tracking through environment'
  },
  [Genre.POLITICS]: {
    preferredCompositions: ['symmetrical', 'rule_of_thirds', 'frame_within_frame'],
    avoidCompositions: ['diagonal'],
    preferredAngles: ['low_angle', 'high_angle', 'eye_level'],
    movementStyle: 'calculated, deliberate, power dynamics'
  }
};

// ============================================
// 구도 프롬프트 빌더
// ============================================

export function buildCompositionPrompt(
  composition: CompositionRule,
  shotSize: ShotSize,
  angle: CameraAngle,
  movement?: CameraMovement
): string {
  const compositionDescriptions: Record<CompositionType, string> = {
    'rule_of_thirds': 'using rule of thirds - subject placed on intersection points, creating balanced visual flow',
    'golden_ratio': 'using golden ratio composition - subject at golden spiral focal point for natural visual harmony',
    'diagonal': 'using diagonal composition - strong diagonal lines creating dynamic energy and movement',
    'symmetrical': 'using symmetrical composition - balanced mirroring for formal, powerful aesthetic',
    'asymmetrical': 'using asymmetrical composition - intentional imbalance creating visual tension',
    'frame_within_frame': 'using frame-within-frame composition - natural elements framing the subject',
    'leading_lines': 'using leading lines composition - environmental lines guiding eye to subject',
    'centered': 'using centered composition - subject perfectly centered for maximum impact',
    'negative_space': 'using negative space composition - meaningful empty space emphasizing subject'
  };

  const placementDescriptions: Record<SubjectPlacement, string> = {
    'left_third': 'subject positioned on left third intersection',
    'right_third': 'subject positioned on right third intersection',
    'upper_third': 'subject positioned on upper horizontal third',
    'lower_third': 'subject positioned on lower horizontal third',
    'golden_point_tl': 'subject at upper-left golden ratio point',
    'golden_point_tr': 'subject at upper-right golden ratio point',
    'golden_point_bl': 'subject at lower-left golden ratio point',
    'golden_point_br': 'subject at lower-right golden ratio point',
    'center': 'subject dead center of frame',
    'off_center': 'subject slightly off-center for subtle tension'
  };

  const shotDescriptions: Record<ShotSize, string> = {
    'extreme_wide': 'EXTREME WIDE SHOT - vast landscape with tiny figure, establishing scale',
    'wide': 'WIDE SHOT - full environment with character in context',
    'full': 'FULL SHOT - complete character from head to toe',
    'medium_full': 'MEDIUM FULL SHOT - character from knees up',
    'medium': 'MEDIUM SHOT - character from waist up, standard dialogue framing',
    'medium_close': 'MEDIUM CLOSE-UP - character from chest up, intimate but contextual',
    'close_up': 'CLOSE-UP - face filling frame, capturing emotion',
    'extreme_close_up': 'EXTREME CLOSE-UP - single feature (eyes, mouth, hand), maximum intensity',
    'detail': 'DETAIL SHOT - specific object or body part, narrative significance'
  };

  const angleDescriptions: Record<CameraAngle, string> = {
    'eye_level': 'EYE LEVEL angle - neutral, relatable perspective',
    'low_angle': 'LOW ANGLE - looking up at subject, conveying power and dominance',
    'high_angle': 'HIGH ANGLE - looking down at subject, showing vulnerability',
    'dutch_angle': 'DUTCH ANGLE (tilted frame) - creating unease and tension',
    'birds_eye': 'BIRD\'S EYE VIEW - directly overhead, god-like perspective',
    'worms_eye': 'WORM\'S EYE VIEW - extreme low angle from ground level',
    'over_shoulder': 'OVER-THE-SHOULDER - viewer positioned behind one character',
    'pov': 'POV (point of view) - seeing through character\'s eyes',
    'two_shot': 'TWO-SHOT - both characters visible in frame'
  };

  let prompt = `[CINEMATOGRAPHY DIRECTION]

COMPOSITION: ${compositionDescriptions[composition.type]}
PLACEMENT: ${placementDescriptions[composition.subjectPlacement]}
${composition.leadingLines ? `LEADING LINES: ${composition.leadingLines}` : ''}
${composition.negativeSpaceDirection ? `NEGATIVE SPACE: empty space toward ${composition.negativeSpaceDirection}` : ''}
VISUAL WEIGHT: ${composition.visualWeight.replace('_', ' ')}

FRAMING: ${shotDescriptions[shotSize]}
CAMERA ANGLE: ${angleDescriptions[angle]}`;

  if (movement && movement.type !== 'static') {
    prompt += `

CAMERA MOVEMENT FEEL: ${movement.type.replace('_', ' ')} at ${movement.speed} speed
PURPOSE: ${movement.purpose}
${movement.startFrame ? `START: ${movement.startFrame}` : ''}
${movement.endFrame ? `END: ${movement.endFrame}` : ''}`;
  }

  return prompt;
}

// ============================================
// 자동 구도 추천
// ============================================

export function recommendComposition(
  beatType: BeatType,
  genre: Genre,
  emotionalWeight: number
): { composition: CompositionRule; shotSize: ShotSize; angle: CameraAngle; movement?: CameraMovement } {
  // 기본 비트별 구도 가져오기
  const beatDefault = BEAT_COMPOSITION_DEFAULTS[beatType];
  const genreStyle = GENRE_COMPOSITION_STYLE[genre];

  // 장르에 맞게 조정
  let composition = { ...beatDefault.composition };
  let shotSize = beatDefault.shotSize;
  let angle = beatDefault.angle;
  let movement = beatDefault.movement;

  // 장르 선호 구도가 있으면 적용 (높은 감정 강도일 때)
  if (emotionalWeight > 0.7 && genreStyle.preferredCompositions.length > 0) {
    const preferredType = genreStyle.preferredCompositions[0];
    if (!genreStyle.avoidCompositions.includes(composition.type)) {
      composition.type = preferredType;
    }
  }

  // 장르 선호 앵글 적용
  if (genreStyle.preferredAngles.includes(angle) === false && genreStyle.preferredAngles.length > 0) {
    // 클라이막스나 에스컬레이션에서만 장르 앵글 적용
    if (beatType === 'climax' || beatType === 'escalation') {
      angle = genreStyle.preferredAngles[0];
    }
  }

  // 감정 강도에 따른 샷 크기 조정
  if (emotionalWeight >= 0.9) {
    // 최고조에서는 클로즈업 또는 익스트림 클로즈업
    if (shotSize !== 'extreme_close_up' && shotSize !== 'close_up') {
      shotSize = 'close_up';
    }
  }

  return { composition, shotSize, angle, movement };
}
