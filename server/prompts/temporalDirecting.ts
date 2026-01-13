// ============================================
// Professional Temporal Directing System
// 시간 연출 시스템
// 슬로모션, 플래시백, 점프컷 등 시간 표현 문법
// ============================================

import { BeatType } from './storyboardPrompts';

// ============================================
// 시간 효과 타입 (Temporal Effect Types)
// ============================================

export type TemporalEffectType =
  | 'slow_motion'     // 슬로모션 - 시간이 느려짐
  | 'freeze_frame'    // 프리즈 프레임 - 시간 정지
  | 'time_skip'       // 시간 경과 - 시간 점프
  | 'flashback'       // 과거 회상
  | 'flash_forward'   // 미래 예지
  | 'montage'         // 몽타주 - 시간 압축
  | 'real_time'       // 실시간 - 1:1 시간 흐름
  | 'accelerated'     // 가속 - 시간이 빨라짐
  | 'loop'            // 반복 - 같은 순간 반복
  | 'parallel';       // 병렬 - 동시 진행 장면

// ============================================
// 시간 효과 설정 (Temporal Effect Config)
// ============================================

export interface TemporalEffectConfig {
  type: TemporalEffectType;
  intensity: number;           // 0.0-1.0 효과 강도
  duration: 'brief' | 'short' | 'medium' | 'extended';  // 효과 지속 시간
  visualCues: string[];        // 시각적 단서
  transitionIn: TransitionType;   // 진입 전환
  transitionOut: TransitionType;  // 종료 전환
  colorGrading?: ColorGradingConfig;  // 색 보정
}

export type TransitionType =
  | 'cut'           // 직접 전환
  | 'fade'          // 페이드
  | 'dissolve'      // 디졸브
  | 'wipe'          // 와이프
  | 'blur'          // 블러 전환
  | 'zoom'          // 줌 전환
  | 'flash';        // 플래시 전환

export interface ColorGradingConfig {
  saturation: number;      // -100 to +100
  contrast: number;        // -100 to +100
  temperature: number;     // -100 (cool) to +100 (warm)
  tint?: string;           // 특정 색조 오버레이
  vignette?: number;       // 0-100 비네팅 강도
}

// ============================================
// 시간 효과별 기본 설정
// ============================================

export const TEMPORAL_EFFECT_PRESETS: Record<TemporalEffectType, TemporalEffectConfig> = {
  slow_motion: {
    type: 'slow_motion',
    intensity: 0.8,
    duration: 'short',
    visualCues: [
      'motion blur trails on moving objects',
      'floating particles frozen in air',
      'hair and fabric suspended mid-movement',
      'droplets or debris captured in detail',
      'light streaks extending from bright sources'
    ],
    transitionIn: 'blur',
    transitionOut: 'cut',
    colorGrading: {
      saturation: 20,
      contrast: 15,
      temperature: 0
    }
  },

  freeze_frame: {
    type: 'freeze_frame',
    intensity: 1.0,
    duration: 'brief',
    visualCues: [
      'absolute stillness captured',
      'sharp detail on all elements',
      'dramatic lighting emphasis',
      'environmental elements frozen (leaves, rain, sparks)',
      'spotlight or vignette on focal point'
    ],
    transitionIn: 'flash',
    transitionOut: 'cut',
    colorGrading: {
      saturation: -10,
      contrast: 30,
      temperature: -20,
      vignette: 40
    }
  },

  time_skip: {
    type: 'time_skip',
    intensity: 0.5,
    duration: 'brief',
    visualCues: [
      'environmental change showing time passage',
      'sun/moon position shift',
      'seasonal indicators (leaves, snow, flowers)',
      'clock or calendar visible',
      'character appearance subtle change (tired, rested)'
    ],
    transitionIn: 'dissolve',
    transitionOut: 'dissolve',
    colorGrading: {
      saturation: 0,
      contrast: 0,
      temperature: 0
    }
  },

  flashback: {
    type: 'flashback',
    intensity: 0.7,
    duration: 'medium',
    visualCues: [
      'sepia or desaturated color tone',
      'soft diffused edges (dream-like quality)',
      'slight vignette framing',
      'nostalgic warm lighting',
      'grain or film texture overlay',
      'slightly overexposed highlights'
    ],
    transitionIn: 'dissolve',
    transitionOut: 'dissolve',
    colorGrading: {
      saturation: -40,
      contrast: -10,
      temperature: 30,
      tint: 'sepia',
      vignette: 30
    }
  },

  flash_forward: {
    type: 'flash_forward',
    intensity: 0.6,
    duration: 'brief',
    visualCues: [
      'cool blue-tinted atmosphere',
      'slightly desaturated colors',
      'subtle distortion or blur at edges',
      'ethereal glow on subjects',
      'uncertainty in details (faces unclear)'
    ],
    transitionIn: 'flash',
    transitionOut: 'flash',
    colorGrading: {
      saturation: -20,
      contrast: 5,
      temperature: -40,
      tint: 'cyan',
      vignette: 25
    }
  },

  montage: {
    type: 'montage',
    intensity: 0.5,
    duration: 'extended',
    visualCues: [
      'multiple moments collapsed into single frame',
      'overlapping semi-transparent images',
      'progress indicators (before/after)',
      'sequential action fragments',
      'time markers visible'
    ],
    transitionIn: 'wipe',
    transitionOut: 'wipe',
    colorGrading: {
      saturation: 10,
      contrast: 10,
      temperature: 0
    }
  },

  real_time: {
    type: 'real_time',
    intensity: 0.3,
    duration: 'medium',
    visualCues: [
      'natural lighting and colors',
      'realistic motion capture',
      'documentary-like framing',
      'minimal stylization',
      'authentic environmental detail'
    ],
    transitionIn: 'cut',
    transitionOut: 'cut',
    colorGrading: {
      saturation: 0,
      contrast: 0,
      temperature: 0
    }
  },

  accelerated: {
    type: 'accelerated',
    intensity: 0.6,
    duration: 'short',
    visualCues: [
      'extreme motion blur',
      'blurred background with sharp subject',
      'speed lines emanating from direction of movement',
      'compressed action sequences',
      'streaking light trails'
    ],
    transitionIn: 'zoom',
    transitionOut: 'cut',
    colorGrading: {
      saturation: 30,
      contrast: 20,
      temperature: 10
    }
  },

  loop: {
    type: 'loop',
    intensity: 0.7,
    duration: 'short',
    visualCues: [
      'déjà vu visual indicators',
      'repeated elements with slight variations',
      'circular composition',
      'mirrored or echoed imagery',
      'glitch or stutter effect'
    ],
    transitionIn: 'cut',
    transitionOut: 'blur',
    colorGrading: {
      saturation: -10,
      contrast: 5,
      temperature: -10
    }
  },

  parallel: {
    type: 'parallel',
    intensity: 0.5,
    duration: 'medium',
    visualCues: [
      'split screen composition',
      'matching action between scenes',
      'contrasting environments showing same moment',
      'visual rhyming between parallel events',
      'synchronized emotional beats'
    ],
    transitionIn: 'wipe',
    transitionOut: 'wipe',
    colorGrading: {
      saturation: 0,
      contrast: 5,
      temperature: 0
    }
  }
};

// ============================================
// 비트별 시간 효과 권장사항
// ============================================

export const BEAT_TEMPORAL_RECOMMENDATIONS: Record<BeatType, {
  recommended: TemporalEffectType[];
  avoid: TemporalEffectType[];
  rationale: string;
}> = {
  hook: {
    recommended: ['freeze_frame', 'flash_forward', 'slow_motion'],
    avoid: ['time_skip', 'montage'],
    rationale: '첫 컷은 순간을 포착하여 시선을 사로잡아야 함. 프리즈 프레임이나 미래 예지로 호기심 유발.'
  },
  setup: {
    recommended: ['real_time', 'time_skip'],
    avoid: ['slow_motion', 'freeze_frame'],
    rationale: '상황 설정은 자연스러운 시간 흐름으로. 필요시 시간 경과로 배경 정보 전달.'
  },
  development: {
    recommended: ['real_time', 'flashback', 'parallel'],
    avoid: ['freeze_frame', 'slow_motion'],
    rationale: '전개는 스토리 진행에 집중. 복선용 플래시백이나 병렬 장면 활용 가능.'
  },
  escalation: {
    recommended: ['accelerated', 'slow_motion', 'loop'],
    avoid: ['time_skip', 'montage'],
    rationale: '긴장감 고조는 시간 조작으로 강화. 가속이나 슬로모션으로 심박수 조절.'
  },
  pre_climax: {
    recommended: ['slow_motion', 'freeze_frame'],
    avoid: ['time_skip', 'accelerated', 'montage'],
    rationale: '절정 직전은 시간을 늘여 긴장 극대화. 폭발 직전의 순간을 잡아야 함.'
  },
  climax: {
    recommended: ['freeze_frame', 'slow_motion', 'accelerated'],
    avoid: ['time_skip', 'flashback', 'montage'],
    rationale: '클라이막스는 임팩트가 핵심. 프리즈로 순간 포착하거나 슬로모션으로 연장.'
  },
  cliffhanger: {
    recommended: ['flash_forward', 'freeze_frame', 'parallel'],
    avoid: ['montage', 'time_skip'],
    rationale: '다음 회차 유도를 위한 궁금증 유발. 미래 예지나 프리즈로 질문 던지기.'
  }
};

// ============================================
// 시간 연출 프롬프트 빌더
// ============================================

export function buildTemporalPrompt(config: TemporalEffectConfig): string {
  let prompt = `[TEMPORAL DIRECTING - ${config.type.toUpperCase().replace('_', ' ')}]

EFFECT INTENSITY: ${(config.intensity * 100).toFixed(0)}%
DURATION: ${config.duration}

VISUAL CUES TO INCLUDE:
${config.visualCues.map(cue => `• ${cue}`).join('\n')}

TRANSITION:
• Entry: ${config.transitionIn}
• Exit: ${config.transitionOut}`;

  if (config.colorGrading) {
    prompt += `

COLOR GRADING:
• Saturation: ${config.colorGrading.saturation > 0 ? '+' : ''}${config.colorGrading.saturation}%
• Contrast: ${config.colorGrading.contrast > 0 ? '+' : ''}${config.colorGrading.contrast}%
• Temperature: ${config.colorGrading.temperature > 0 ? 'warm +' : config.colorGrading.temperature < 0 ? 'cool ' : ''}${config.colorGrading.temperature}`;

    if (config.colorGrading.tint) {
      prompt += `\n• Tint Overlay: ${config.colorGrading.tint}`;
    }
    if (config.colorGrading.vignette) {
      prompt += `\n• Vignette: ${config.colorGrading.vignette}%`;
    }
  }

  return prompt;
}

// 비트에 맞는 시간 효과 추천
export function recommendTemporalEffect(
  beatType: BeatType,
  emotionalIntensity: number
): TemporalEffectConfig {
  const recommendation = BEAT_TEMPORAL_RECOMMENDATIONS[beatType];

  // 감정 강도에 따라 효과 선택
  let selectedType: TemporalEffectType;

  if (emotionalIntensity >= 0.9) {
    // 최고조: freeze_frame 또는 slow_motion 우선
    selectedType = recommendation.recommended.includes('freeze_frame')
      ? 'freeze_frame'
      : recommendation.recommended.includes('slow_motion')
        ? 'slow_motion'
        : recommendation.recommended[0];
  } else if (emotionalIntensity >= 0.7) {
    // 고조: 첫 번째 추천 효과
    selectedType = recommendation.recommended[0];
  } else if (emotionalIntensity >= 0.5) {
    // 중간: real_time 또는 두 번째 추천
    selectedType = recommendation.recommended.includes('real_time')
      ? 'real_time'
      : recommendation.recommended[1] || recommendation.recommended[0];
  } else {
    // 낮음: real_time
    selectedType = 'real_time';
  }

  // 프리셋 가져와서 감정 강도에 맞게 조정
  const preset = { ...TEMPORAL_EFFECT_PRESETS[selectedType] };
  preset.intensity = Math.min(1.0, preset.intensity * (0.5 + emotionalIntensity * 0.5));

  return preset;
}

// 시간 효과 조합 (여러 효과 레이어링)
export function combineTemporalEffects(
  primary: TemporalEffectConfig,
  secondary?: TemporalEffectConfig
): string {
  let prompt = buildTemporalPrompt(primary);

  if (secondary) {
    prompt += `

[SECONDARY TEMPORAL LAYER]
${buildTemporalPrompt(secondary)}

BLEND NOTE: Combine both temporal effects harmoniously.
Primary effect (${primary.type}) takes visual precedence.
Secondary effect (${secondary.type}) adds subtle atmosphere.`;
  }

  return prompt;
}
