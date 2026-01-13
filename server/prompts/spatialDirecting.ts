// ============================================
// Professional Spatial Directing System
// 공간/심도 연출 시스템
// 심도 표현, 레이어링, 환경 조명
// ============================================

import { Genre } from './genreDirecting';
import { BeatType } from './storyboardPrompts';

// ============================================
// 피사계 심도 (Depth of Field)
// ============================================

export type FocusPlane = 'foreground' | 'midground' | 'background';
export type ApertureStyle = 'shallow' | 'medium' | 'deep';  // f/1.4 ~ f/16 느낌

export interface DepthOfFieldConfig {
  focusPlane: FocusPlane;
  aperture: ApertureStyle;
  bokehIntensity: number;     // 0.0-1.0 배경 흐림 정도
  bokehShape: 'circular' | 'hexagonal' | 'anamorphic';  // 보케 모양
  focusFalloff: 'gradual' | 'sharp';  // 초점 이탈 속도
}

// 심도 프리셋
export const DOF_PRESETS: Record<string, DepthOfFieldConfig> = {
  portrait_shallow: {
    focusPlane: 'midground',
    aperture: 'shallow',
    bokehIntensity: 0.8,
    bokehShape: 'circular',
    focusFalloff: 'gradual'
  },
  cinematic_medium: {
    focusPlane: 'midground',
    aperture: 'medium',
    bokehIntensity: 0.5,
    bokehShape: 'anamorphic',
    focusFalloff: 'gradual'
  },
  landscape_deep: {
    focusPlane: 'background',
    aperture: 'deep',
    bokehIntensity: 0.1,
    bokehShape: 'circular',
    focusFalloff: 'sharp'
  },
  dramatic_rack: {
    focusPlane: 'foreground',
    aperture: 'shallow',
    bokehIntensity: 0.9,
    bokehShape: 'circular',
    focusFalloff: 'sharp'
  },
  intimate_closeup: {
    focusPlane: 'midground',
    aperture: 'shallow',
    bokehIntensity: 0.95,
    bokehShape: 'hexagonal',
    focusFalloff: 'gradual'
  }
};

// ============================================
// 공간 레이어 시스템 (Spatial Layers)
// ============================================

export interface SpatialLayerConfig {
  foreground?: ForegroundElement;
  midground: string;           // 주요 피사체 설명
  background: BackgroundElement;
  atmosphericDepth: AtmosphericDepth;
  depthCues: string[];         // 심도감을 주는 시각적 단서
}

export interface ForegroundElement {
  type: 'character_part' | 'object' | 'environmental' | 'effect';
  description: string;
  opacity: number;          // 0.0-1.0
  blur: number;             // 0.0-1.0
}

export interface BackgroundElement {
  type: 'environment' | 'abstract' | 'gradient' | 'detailed';
  description: string;
  detailLevel: 'minimal' | 'moderate' | 'detailed';
  blur: number;
}

export type AtmosphericDepth =
  | 'none'              // 맑은 공기
  | 'light_haze'        // 약간의 안개
  | 'fog'               // 안개
  | 'heavy_atmosphere'  // 짙은 분위기
  | 'dust'              // 먼지
  | 'smoke'             // 연기
  | 'rain'              // 비
  | 'snow';             // 눈

// 대기 효과 설정
export const ATMOSPHERIC_EFFECTS: Record<AtmosphericDepth, {
  visibility: number;       // 0.0-1.0 (1.0 = 완전 가시)
  colorShift: string;       // 멀리 갈수록 적용되는 색상
  scatteringIntensity: number;
  description: string;
}> = {
  none: {
    visibility: 1.0,
    colorShift: 'none',
    scatteringIntensity: 0,
    description: 'crystal clear visibility, sharp details at all distances'
  },
  light_haze: {
    visibility: 0.85,
    colorShift: 'subtle blue',
    scatteringIntensity: 0.2,
    description: 'slight atmospheric haze, distant objects slightly muted'
  },
  fog: {
    visibility: 0.5,
    colorShift: 'white-grey',
    scatteringIntensity: 0.6,
    description: 'foggy atmosphere, background fades into mist, mysterious mood'
  },
  heavy_atmosphere: {
    visibility: 0.3,
    colorShift: 'deep blue-grey',
    scatteringIntensity: 0.8,
    description: 'thick atmosphere, limited visibility, oppressive feeling'
  },
  dust: {
    visibility: 0.6,
    colorShift: 'warm brown-orange',
    scatteringIntensity: 0.5,
    description: 'dust particles in air, warm diffused light, desert or construction feel'
  },
  smoke: {
    visibility: 0.4,
    colorShift: 'grey-black',
    scatteringIntensity: 0.7,
    description: 'smoke-filled environment, dramatic shadows, danger or aftermath'
  },
  rain: {
    visibility: 0.7,
    colorShift: 'cool blue-grey',
    scatteringIntensity: 0.4,
    description: 'rain streaks, wet reflections, moody atmosphere'
  },
  snow: {
    visibility: 0.6,
    colorShift: 'bright white-blue',
    scatteringIntensity: 0.5,
    description: 'falling snowflakes, soft white ambient, winter wonderland or harsh blizzard'
  }
};

// ============================================
// 환경 조명 시스템 (Environment Lighting)
// ============================================

export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'golden_hour' | 'dusk' | 'blue_hour' | 'night' | 'midnight';
export type WeatherCondition = 'clear' | 'partly_cloudy' | 'overcast' | 'rainy' | 'stormy' | 'snowy' | 'foggy';

export interface EnvironmentLightingConfig {
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;
  artificialLights?: ArtificialLight[];
  ambientColor: string;
  keyLightDirection: string;
  shadowIntensity: number;    // 0.0-1.0
  shadowSoftness: number;     // 0.0-1.0
}

export interface ArtificialLight {
  type: 'neon' | 'streetlamp' | 'window' | 'screen' | 'candle' | 'fire' | 'spotlight' | 'car_headlight';
  color: string;
  intensity: number;
  position: string;
}

// 시간대별 조명 프리셋
export const TIME_OF_DAY_LIGHTING: Record<TimeOfDay, {
  ambientColor: string;
  keyLightColor: string;
  keyLightDirection: string;
  shadowIntensity: number;
  shadowSoftness: number;
  mood: string;
}> = {
  dawn: {
    ambientColor: 'soft pink-purple',
    keyLightColor: 'pale orange-pink',
    keyLightDirection: 'low from east',
    shadowIntensity: 0.4,
    shadowSoftness: 0.7,
    mood: 'hopeful, new beginning, quiet anticipation'
  },
  morning: {
    ambientColor: 'bright warm white',
    keyLightColor: 'warm yellow-white',
    keyLightDirection: 'mid-low from east',
    shadowIntensity: 0.5,
    shadowSoftness: 0.5,
    mood: 'fresh, energetic, optimistic'
  },
  noon: {
    ambientColor: 'neutral bright white',
    keyLightColor: 'pure white with slight yellow',
    keyLightDirection: 'directly overhead',
    shadowIntensity: 0.7,
    shadowSoftness: 0.3,
    mood: 'harsh, revealing, no hiding, confrontational'
  },
  afternoon: {
    ambientColor: 'warm golden white',
    keyLightColor: 'warm yellow',
    keyLightDirection: 'mid from west',
    shadowIntensity: 0.5,
    shadowSoftness: 0.5,
    mood: 'comfortable, productive, everyday'
  },
  golden_hour: {
    ambientColor: 'rich golden orange',
    keyLightColor: 'deep warm orange-gold',
    keyLightDirection: 'low from west',
    shadowIntensity: 0.6,
    shadowSoftness: 0.6,
    mood: 'romantic, nostalgic, magical, cinematic beauty'
  },
  dusk: {
    ambientColor: 'purple-orange gradient',
    keyLightColor: 'deep orange fading to red',
    keyLightDirection: 'very low from west',
    shadowIntensity: 0.7,
    shadowSoftness: 0.5,
    mood: 'melancholic, ending, bittersweet'
  },
  blue_hour: {
    ambientColor: 'deep blue',
    keyLightColor: 'cool blue with purple',
    keyLightDirection: 'ambient, no direct sun',
    shadowIntensity: 0.3,
    shadowSoftness: 0.8,
    mood: 'mysterious, transitional, liminal, ethereal'
  },
  night: {
    ambientColor: 'dark blue-black',
    keyLightColor: 'cool moonlight silver-blue',
    keyLightDirection: 'high from above (moonlight)',
    shadowIntensity: 0.8,
    shadowSoftness: 0.4,
    mood: 'mysterious, dangerous, intimate, secretive'
  },
  midnight: {
    ambientColor: 'near-black with deep blue',
    keyLightColor: 'minimal, artificial sources only',
    keyLightDirection: 'from artificial sources',
    shadowIntensity: 0.9,
    shadowSoftness: 0.2,
    mood: 'isolation, danger, hidden, supernatural'
  }
};

// 날씨별 조명 수정자
export const WEATHER_LIGHTING_MODIFIERS: Record<WeatherCondition, {
  shadowReduction: number;    // 그림자 감소 (0-1)
  colorDesaturation: number;  // 색상 채도 감소 (0-1)
  ambientBoost: number;       // 환경광 증가 (0-1)
  description: string;
}> = {
  clear: {
    shadowReduction: 0,
    colorDesaturation: 0,
    ambientBoost: 0,
    description: 'sharp shadows, vibrant colors, high contrast'
  },
  partly_cloudy: {
    shadowReduction: 0.2,
    colorDesaturation: 0.1,
    ambientBoost: 0.1,
    description: 'softer shadows, slightly muted colors, dynamic sky'
  },
  overcast: {
    shadowReduction: 0.6,
    colorDesaturation: 0.3,
    ambientBoost: 0.3,
    description: 'very soft shadows, muted colors, flat even lighting'
  },
  rainy: {
    shadowReduction: 0.7,
    colorDesaturation: 0.4,
    ambientBoost: 0.2,
    description: 'minimal shadows, desaturated, wet reflective surfaces'
  },
  stormy: {
    shadowReduction: 0.5,
    colorDesaturation: 0.5,
    ambientBoost: 0,
    description: 'dramatic contrast from lightning, dark mood, unpredictable'
  },
  snowy: {
    shadowReduction: 0.4,
    colorDesaturation: 0.2,
    ambientBoost: 0.4,
    description: 'bright ambient from snow reflection, soft shadows, cool tones'
  },
  foggy: {
    shadowReduction: 0.8,
    colorDesaturation: 0.4,
    ambientBoost: 0.3,
    description: 'almost no shadows, faded colors, mysterious atmosphere'
  }
};

// ============================================
// 장르별 공간 연출 선호도
// ============================================

export const GENRE_SPATIAL_PREFERENCES: Record<Genre, {
  preferredDOF: ApertureStyle;
  preferredAtmosphere: AtmosphericDepth[];
  preferredTimeOfDay: TimeOfDay[];
  layeringStyle: string;
}> = {
  [Genre.ACTION]: {
    preferredDOF: 'medium',
    preferredAtmosphere: ['dust', 'smoke', 'none'],
    preferredTimeOfDay: ['noon', 'night', 'golden_hour'],
    layeringStyle: 'dynamic foreground elements (debris, sparks, motion blur)'
  },
  [Genre.ROMANCE]: {
    preferredDOF: 'shallow',
    preferredAtmosphere: ['light_haze', 'none'],
    preferredTimeOfDay: ['golden_hour', 'blue_hour', 'dawn'],
    layeringStyle: 'soft foreground blur (flowers, lights), romantic bokeh'
  },
  [Genre.HORROR]: {
    preferredDOF: 'shallow',
    preferredAtmosphere: ['fog', 'heavy_atmosphere', 'smoke'],
    preferredTimeOfDay: ['night', 'midnight', 'blue_hour'],
    layeringStyle: 'obscured foreground (shadows, hands), threatening background'
  },
  [Genre.FANTASY]: {
    preferredDOF: 'deep',
    preferredAtmosphere: ['light_haze', 'none'],
    preferredTimeOfDay: ['golden_hour', 'dawn', 'night'],
    layeringStyle: 'epic backgrounds with magical particles foreground'
  },
  [Genre.SLICE_OF_LIFE]: {
    preferredDOF: 'medium',
    preferredAtmosphere: ['none', 'light_haze'],
    preferredTimeOfDay: ['afternoon', 'morning', 'golden_hour'],
    layeringStyle: 'naturalistic depth, everyday objects in foreground'
  },
  [Genre.NOIR]: {
    preferredDOF: 'shallow',
    preferredAtmosphere: ['fog', 'smoke', 'rain'],
    preferredTimeOfDay: ['night', 'midnight', 'blue_hour'],
    layeringStyle: 'venetian blind shadows, cigarette smoke foreground'
  },
  [Genre.POLITICS]: {
    preferredDOF: 'medium',
    preferredAtmosphere: ['none', 'light_haze'],
    preferredTimeOfDay: ['afternoon', 'night', 'morning'],
    layeringStyle: 'formal framing, chess pieces or documents foreground'
  }
};

// ============================================
// 공간 연출 프롬프트 빌더
// ============================================

export function buildSpatialPrompt(
  dof: DepthOfFieldConfig,
  layers: SpatialLayerConfig,
  lighting: EnvironmentLightingConfig
): string {
  const timePreset = TIME_OF_DAY_LIGHTING[lighting.timeOfDay];
  const weatherMod = WEATHER_LIGHTING_MODIFIERS[lighting.weather];
  const atmospherePreset = ATMOSPHERIC_EFFECTS[layers.atmosphericDepth];

  let prompt = `[SPATIAL DIRECTING]

DEPTH OF FIELD:
• Focus Plane: ${dof.focusPlane}
• Aperture Style: ${dof.aperture} (${dof.aperture === 'shallow' ? 'f/1.4-2.8' : dof.aperture === 'medium' ? 'f/4-5.6' : 'f/8-16'})
• Bokeh Intensity: ${(dof.bokehIntensity * 100).toFixed(0)}%
• Bokeh Shape: ${dof.bokehShape}
• Focus Falloff: ${dof.focusFalloff}

SPATIAL LAYERS:`;

  if (layers.foreground) {
    prompt += `
• Foreground: ${layers.foreground.description}
  - Type: ${layers.foreground.type}
  - Opacity: ${(layers.foreground.opacity * 100).toFixed(0)}%
  - Blur: ${(layers.foreground.blur * 100).toFixed(0)}%`;
  }

  prompt += `
• Midground (Main Subject): ${layers.midground}
• Background: ${layers.background.description}
  - Type: ${layers.background.type}
  - Detail Level: ${layers.background.detailLevel}
  - Blur: ${(layers.background.blur * 100).toFixed(0)}%

ATMOSPHERIC DEPTH: ${layers.atmosphericDepth}
• ${atmospherePreset.description}
• Visibility: ${(atmospherePreset.visibility * 100).toFixed(0)}%
• Color Shift: ${atmospherePreset.colorShift}

DEPTH CUES:
${layers.depthCues.map(cue => `• ${cue}`).join('\n')}

ENVIRONMENT LIGHTING:
• Time of Day: ${lighting.timeOfDay.replace('_', ' ').toUpperCase()}
• Weather: ${lighting.weather.replace('_', ' ')}
• Mood: ${timePreset.mood}
• Ambient Color: ${timePreset.ambientColor}
• Key Light: ${timePreset.keyLightColor} from ${timePreset.keyLightDirection}
• Shadow Intensity: ${((timePreset.shadowIntensity * (1 - weatherMod.shadowReduction)) * 100).toFixed(0)}%
• Shadow Softness: ${(timePreset.shadowSoftness * 100).toFixed(0)}%`;

  if (lighting.artificialLights && lighting.artificialLights.length > 0) {
    prompt += `

ARTIFICIAL LIGHTS:`;
    for (const light of lighting.artificialLights) {
      prompt += `
• ${light.type}: ${light.color} at ${light.position} (intensity: ${(light.intensity * 100).toFixed(0)}%)`;
    }
  }

  return prompt;
}

// 비트와 장르에 맞는 공간 연출 추천
export function recommendSpatialConfig(
  beatType: BeatType,
  genre: Genre,
  emotionalWeight: number
): {
  dof: DepthOfFieldConfig;
  atmosphere: AtmosphericDepth;
  timeOfDay: TimeOfDay;
} {
  const genrePref = GENRE_SPATIAL_PREFERENCES[genre];

  // 감정 강도에 따른 심도 조절
  let aperture: ApertureStyle = genrePref.preferredDOF;
  if (emotionalWeight >= 0.9) {
    aperture = 'shallow';  // 극적인 순간은 얕은 심도
  } else if (emotionalWeight <= 0.3) {
    aperture = 'deep';     // 차분한 순간은 깊은 심도
  }

  // 비트에 따른 초점면 결정
  let focusPlane: FocusPlane = 'midground';
  if (beatType === 'hook' || beatType === 'cliffhanger') {
    focusPlane = Math.random() > 0.5 ? 'foreground' : 'background';  // 변화 있게
  } else if (beatType === 'climax' || beatType === 'pre_climax') {
    focusPlane = 'midground';  // 주인공에 집중
  }

  const dof: DepthOfFieldConfig = {
    focusPlane,
    aperture,
    bokehIntensity: aperture === 'shallow' ? 0.8 : aperture === 'medium' ? 0.5 : 0.2,
    bokehShape: genre === Genre.ROMANCE ? 'circular' : 'anamorphic',
    focusFalloff: emotionalWeight > 0.7 ? 'sharp' : 'gradual'
  };

  // 장르 선호 대기 효과 중 첫 번째 사용
  const atmosphere = genrePref.preferredAtmosphere[0];

  // 비트에 따른 시간대 선택
  let timeOfDay: TimeOfDay;
  if (beatType === 'climax' || beatType === 'escalation') {
    // 극적인 순간은 극적인 조명
    timeOfDay = genrePref.preferredTimeOfDay.includes('golden_hour')
      ? 'golden_hour'
      : genrePref.preferredTimeOfDay.includes('night')
        ? 'night'
        : genrePref.preferredTimeOfDay[0];
  } else if (beatType === 'setup') {
    // 설정은 평범한 시간대
    timeOfDay = genrePref.preferredTimeOfDay.includes('afternoon')
      ? 'afternoon'
      : genrePref.preferredTimeOfDay.includes('morning')
        ? 'morning'
        : genrePref.preferredTimeOfDay[0];
  } else {
    timeOfDay = genrePref.preferredTimeOfDay[0];
  }

  return { dof, atmosphere, timeOfDay };
}
