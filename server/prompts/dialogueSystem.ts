// ============================================
// Professional Dialogue & SFX System
// 대사 및 효과음 시스템
// 캐릭터 음성 특성, 말풍선 스타일, SFX 카테고리
// ============================================

// ============================================
// 말풍선 타입 시스템 (Bubble Type System)
// ============================================

export type BubbleType =
  | 'speech'       // 일반 대사
  | 'shout'        // 외침 (뾰족한 테두리)
  | 'whisper'      // 속삭임 (점선 테두리)
  | 'thought'      // 속마음 (구름 모양)
  | 'narration'    // 나레이션 (직사각형 박스)
  | 'sfx'          // 효과음 (배경에 통합)
  | 'telepathy'    // 텔레파시 (파도 테두리)
  | 'radio'        // 기계음/전화 (각진 테두리)
  | 'flashback';   // 회상 대사 (빈티지 스타일)

export type BubbleShape = 'round' | 'rectangular' | 'cloud' | 'spiky' | 'wavy' | 'jagged';
export type BubbleBorder = 'solid' | 'dashed' | 'double' | 'none' | 'glow' | 'sketch';
export type TailDirection = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none';

export interface BubbleStyleConfig {
  shape: BubbleShape;
  border: BubbleBorder;
  borderWidth: number;
  backgroundColor: string;
  textColor: string;
  fontStyle: 'normal' | 'bold' | 'italic' | 'bold-italic';
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  tailStyle: 'pointed' | 'curved' | 'none';
  effects?: string[];  // ["glow", "shadow", "shake"]
}

// 말풍선 타입별 기본 스타일
export const BUBBLE_TYPE_STYLES: Record<BubbleType, BubbleStyleConfig> = {
  speech: {
    shape: 'round',
    border: 'solid',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    fontStyle: 'normal',
    fontSize: 'normal',
    tailStyle: 'pointed'
  },
  shout: {
    shape: 'spiky',
    border: 'solid',
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    fontStyle: 'bold',
    fontSize: 'large',
    tailStyle: 'pointed',
    effects: ['shake']
  },
  whisper: {
    shape: 'round',
    border: 'dashed',
    borderWidth: 1,
    backgroundColor: '#F5F5F5',
    textColor: '#666666',
    fontStyle: 'italic',
    fontSize: 'small',
    tailStyle: 'curved'
  },
  thought: {
    shape: 'cloud',
    border: 'solid',
    borderWidth: 1,
    backgroundColor: '#FAFAFA',
    textColor: '#555555',
    fontStyle: 'italic',
    fontSize: 'normal',
    tailStyle: 'none',  // 구름 방울로 대체
    effects: ['bubbles']
  },
  narration: {
    shape: 'rectangular',
    border: 'none',
    borderWidth: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    textColor: '#FFFFFF',
    fontStyle: 'normal',
    fontSize: 'normal',
    tailStyle: 'none'
  },
  sfx: {
    shape: 'jagged',
    border: 'none',
    borderWidth: 0,
    backgroundColor: 'transparent',
    textColor: '#000000',
    fontStyle: 'bold',
    fontSize: 'xlarge',
    tailStyle: 'none',
    effects: ['outline', 'dynamic']
  },
  telepathy: {
    shape: 'wavy',
    border: 'glow',
    borderWidth: 2,
    backgroundColor: 'rgba(138,43,226,0.1)',
    textColor: '#8A2BE2',
    fontStyle: 'italic',
    fontSize: 'normal',
    tailStyle: 'none',
    effects: ['glow', 'pulse']
  },
  radio: {
    shape: 'rectangular',
    border: 'double',
    borderWidth: 2,
    backgroundColor: '#E8E8E8',
    textColor: '#333333',
    fontStyle: 'normal',
    fontSize: 'normal',
    tailStyle: 'pointed',
    effects: ['static']
  },
  flashback: {
    shape: 'round',
    border: 'sketch',
    borderWidth: 1,
    backgroundColor: 'rgba(255,248,220,0.9)',
    textColor: '#8B4513',
    fontStyle: 'italic',
    fontSize: 'normal',
    tailStyle: 'curved',
    effects: ['sepia', 'vignette']
  }
};

// ============================================
// 캐릭터 음성 특성 (Character Voice)
// ============================================

export type SpeechPattern = 'formal' | 'casual' | 'archaic' | 'childish' | 'villainous' | 'mysterious' | 'energetic' | 'calm';
export type EmotionalRange = 'cold' | 'passionate' | 'stoic' | 'volatile' | 'warm' | 'sardonic';

export interface CharacterVoice {
  id: string;
  name: string;
  speechPattern: SpeechPattern;
  endingStyle: string;           // "~입니다" vs "~야" vs "~다"
  quirks: string[];              // ["말끝 흐림", "감탄사 많음", "짧은 문장"]
  emotionalRange: EmotionalRange;
  vocabulary: {
    preferred: string[];         // 자주 쓰는 단어
    avoided: string[];           // 피하는 단어
  };
  catchphrase?: string;          // 특징적인 말버릇
}

// 음성 특성 프리셋
export const VOICE_PRESETS: Record<string, Partial<CharacterVoice>> = {
  protagonist_shounen: {
    speechPattern: 'energetic',
    endingStyle: '~야! / ~거야!',
    quirks: ['감탄사 많음', '짧고 강렬한 문장', '결의에 찬 선언'],
    emotionalRange: 'passionate'
  },
  cool_rival: {
    speechPattern: 'calm',
    endingStyle: '~다 / ~군',
    quirks: ['비꼬는 말투', '냉소적 한마디', '말 끝 흐림'],
    emotionalRange: 'cold'
  },
  mysterious_mentor: {
    speechPattern: 'mysterious',
    endingStyle: '~지 / ~려나',
    quirks: ['은유적 표현', '질문으로 대답', '여운 남기기'],
    emotionalRange: 'stoic'
  },
  cheerful_support: {
    speechPattern: 'casual',
    endingStyle: '~요! / ~네요!',
    quirks: ['이모티콘 같은 표현', '밝은 감탄사', '긍정적 리액션'],
    emotionalRange: 'warm'
  },
  villain_mastermind: {
    speechPattern: 'villainous',
    endingStyle: '~하지 / ~할까?',
    quirks: ['조롱하는 말투', '과장된 표현', '위협적 속삭임'],
    emotionalRange: 'sardonic'
  }
};

// ============================================
// SFX 카테고리 시스템 (Sound Effects)
// ============================================

export interface SFXEntry {
  text: string;
  romanization?: string;
  category: SFXCategory;
  intensity: 'soft' | 'medium' | 'strong' | 'extreme';
  visualStyle: {
    fontSize: number;    // 1.0 = 기본 크기 배수
    rotation: number;    // 회전 각도 (도)
    color?: string;      // 색상 오버라이드
    effects: string[];   // ["outline", "shadow", "blur", "glow"]
  };
}

export type SFXCategory =
  | 'impact'        // 충격, 타격
  | 'movement'      // 움직임, 이동
  | 'emotional'     // 감정 표현
  | 'environmental' // 환경음
  | 'action'        // 액션 효과
  | 'magic'         // 마법/초능력
  | 'tech'          // 기계/기술
  | 'nature'        // 자연 현상
  | 'voice'         // 목소리 관련
  | 'silence';      // 침묵/정적

// 카테고리별 SFX 라이브러리
export const SFX_LIBRARY: Record<SFXCategory, SFXEntry[]> = {
  impact: [
    { text: '쾅!', category: 'impact', intensity: 'extreme', visualStyle: { fontSize: 2.5, rotation: -15, effects: ['outline', 'shake'] }},
    { text: '퍽!', category: 'impact', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: 10, effects: ['outline'] }},
    { text: '쿵!', category: 'impact', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: -5, effects: ['outline', 'shadow'] }},
    { text: '탁!', category: 'impact', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: ['outline'] }},
    { text: '빠악!', category: 'impact', intensity: 'extreme', visualStyle: { fontSize: 2.8, rotation: -20, effects: ['outline', 'glow', 'shake'] }},
    { text: '툭', category: 'impact', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 0, effects: [] }},
    { text: '딱!', category: 'impact', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 5, effects: ['outline'] }},
    { text: '짝!', category: 'impact', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: -10, effects: ['outline'] }},
    { text: '콰앙!', category: 'impact', intensity: 'extreme', visualStyle: { fontSize: 3.0, rotation: -25, color: '#FF4500', effects: ['outline', 'glow', 'shake'] }},
    { text: '와장창!', category: 'impact', intensity: 'extreme', visualStyle: { fontSize: 2.5, rotation: 15, effects: ['outline', 'shake'] }}
  ],

  movement: [
    { text: '휙!', category: 'movement', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: 45, effects: ['blur'] }},
    { text: '슥', category: 'movement', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 30, effects: ['blur'] }},
    { text: '스윽', category: 'movement', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 20, effects: ['blur'] }},
    { text: '쓱', category: 'movement', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 15, effects: [] }},
    { text: '촤악!', category: 'movement', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: -30, effects: ['blur', 'outline'] }},
    { text: '쏴아', category: 'movement', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: ['blur'] }},
    { text: '다다다', category: 'movement', intensity: 'medium', visualStyle: { fontSize: 1.3, rotation: 0, effects: [] }},
    { text: '타닥타닥', category: 'movement', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 0, effects: [] }},
    { text: '펄럭', category: 'movement', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 10, effects: [] }},
    { text: '둥실', category: 'movement', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 0, effects: [] }}
  ],

  emotional: [
    { text: '...', category: 'emotional', intensity: 'soft', visualStyle: { fontSize: 1.5, rotation: 0, effects: [] }},
    { text: '!!!', category: 'emotional', intensity: 'extreme', visualStyle: { fontSize: 2.5, rotation: 0, effects: ['shake'] }},
    { text: '?!', category: 'emotional', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: -5, effects: ['outline'] }},
    { text: '후우...', category: 'emotional', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 0, effects: [] }},
    { text: '하아...', category: 'emotional', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 0, effects: [] }},
    { text: '끄억', category: 'emotional', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '흐읍', category: 'emotional', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '덜덜', category: 'emotional', intensity: 'medium', visualStyle: { fontSize: 1.3, rotation: 5, effects: ['shake'] }},
    { text: '끼익', category: 'emotional', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: -10, effects: ['outline'] }},
    { text: '헉!', category: 'emotional', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: 0, effects: ['outline'] }}
  ],

  environmental: [
    { text: '우르르', category: 'environmental', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: 0, effects: ['blur'] }},
    { text: '쏴아아', category: 'environmental', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: ['blur'] }},
    { text: '삐익', category: 'environmental', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: [] }},
    { text: '띵동', category: 'environmental', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 0, effects: [] }},
    { text: '부웅', category: 'environmental', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: ['blur'] }},
    { text: '찌르릉', category: 'environmental', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '철커덕', category: 'environmental', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: [] }},
    { text: '끼이익', category: 'environmental', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: [] }},
    { text: '탕탕탕', category: 'environmental', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: -5, effects: ['outline'] }},
    { text: '펑!', category: 'environmental', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: -10, effects: ['outline', 'glow'] }}
  ],

  action: [
    { text: '챙!', category: 'action', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: -15, effects: ['outline', 'glow'] }},
    { text: '슈욱!', category: 'action', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: 30, effects: ['blur'] }},
    { text: '파팍!', category: 'action', intensity: 'extreme', visualStyle: { fontSize: 2.5, rotation: -20, effects: ['outline', 'shake'] }},
    { text: '번쩍!', category: 'action', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: 0, color: '#FFD700', effects: ['glow'] }},
    { text: '찰칵', category: 'action', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 0, effects: [] }},
    { text: '척!', category: 'action', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: [] }},
    { text: '슛!', category: 'action', intensity: 'medium', visualStyle: { fontSize: 1.6, rotation: 25, effects: ['blur'] }},
    { text: '뻥!', category: 'action', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: -10, effects: ['outline'] }},
    { text: '캬악!', category: 'action', intensity: 'extreme', visualStyle: { fontSize: 2.2, rotation: -15, effects: ['outline', 'shake'] }},
    { text: '쨍!', category: 'action', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: 0, effects: ['outline', 'glow'] }}
  ],

  magic: [
    { text: '파아아', category: 'magic', intensity: 'medium', visualStyle: { fontSize: 1.8, rotation: 0, color: '#9370DB', effects: ['glow', 'blur'] }},
    { text: '콰아아!', category: 'magic', intensity: 'extreme', visualStyle: { fontSize: 2.5, rotation: -15, color: '#FF6347', effects: ['glow', 'shake'] }},
    { text: '슈우웅', category: 'magic', intensity: 'medium', visualStyle: { fontSize: 1.6, rotation: 10, color: '#00CED1', effects: ['glow', 'blur'] }},
    { text: '부웅', category: 'magic', intensity: 'soft', visualStyle: { fontSize: 1.4, rotation: 0, color: '#DDA0DD', effects: ['glow'] }},
    { text: '핑!', category: 'magic', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 0, color: '#FFB6C1', effects: ['glow'] }},
    { text: '촤아악!', category: 'magic', intensity: 'strong', visualStyle: { fontSize: 2.2, rotation: -20, color: '#4169E1', effects: ['glow', 'blur'] }},
    { text: '치이익', category: 'magic', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, color: '#32CD32', effects: ['glow'] }},
    { text: '으으응', category: 'magic', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, color: '#8B008B', effects: ['glow', 'pulse'] }},
    { text: '휘이잉', category: 'magic', intensity: 'medium', visualStyle: { fontSize: 1.6, rotation: 15, color: '#00BFFF', effects: ['blur', 'glow'] }},
    { text: '폭!', category: 'magic', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: -10, color: '#FF4500', effects: ['glow', 'outline'] }}
  ],

  tech: [
    { text: '삐비빅', category: 'tech', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, color: '#00FF00', effects: [] }},
    { text: '윙윙', category: 'tech', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 0, effects: ['blur'] }},
    { text: '부우웅', category: 'tech', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: ['blur'] }},
    { text: '치지직', category: 'tech', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 5, color: '#FFD700', effects: ['glow'] }},
    { text: '찌지직', category: 'tech', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: -5, color: '#00FFFF', effects: ['glow', 'shake'] }},
    { text: '딸깍', category: 'tech', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 0, effects: [] }},
    { text: '틱틱틱', category: 'tech', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 0, effects: [] }},
    { text: '두두두', category: 'tech', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '핑!', category: 'tech', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 0, color: '#00FF00', effects: ['glow'] }},
    { text: '붕!', category: 'tech', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: 0, effects: ['glow'] }}
  ],

  nature: [
    { text: '쏴아아', category: 'nature', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: ['blur'] }},
    { text: '후우웅', category: 'nature', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 10, effects: ['blur'] }},
    { text: '우르르르', category: 'nature', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: 0, effects: ['shake'] }},
    { text: '쿠르르릉', category: 'nature', intensity: 'strong', visualStyle: { fontSize: 2.0, rotation: 0, effects: ['shake', 'blur'] }},
    { text: '주룩주룩', category: 'nature', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '토독토독', category: 'nature', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 0, effects: [] }},
    { text: '사각사각', category: 'nature', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 0, effects: [] }},
    { text: '솨아아', category: 'nature', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: ['blur'] }},
    { text: '파도독', category: 'nature', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 5, effects: [] }},
    { text: '와아아', category: 'nature', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: 0, effects: ['blur'] }}
  ],

  voice: [
    { text: '크윽', category: 'voice', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '으윽', category: 'voice', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '끄윽', category: 'voice', intensity: 'strong', visualStyle: { fontSize: 1.6, rotation: 0, effects: [] }},
    { text: '킥킥', category: 'voice', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 5, effects: [] }},
    { text: '흐흐흐', category: 'voice', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '크크크', category: 'voice', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: [] }},
    { text: '하하하', category: 'voice', intensity: 'medium', visualStyle: { fontSize: 1.4, rotation: 0, effects: [] }},
    { text: '흑흑', category: 'voice', intensity: 'soft', visualStyle: { fontSize: 1.3, rotation: 0, effects: [] }},
    { text: '윽!', category: 'voice', intensity: 'strong', visualStyle: { fontSize: 1.6, rotation: -5, effects: ['outline'] }},
    { text: '악!', category: 'voice', intensity: 'strong', visualStyle: { fontSize: 1.8, rotation: -10, effects: ['outline'] }}
  ],

  silence: [
    { text: '...', category: 'silence', intensity: 'soft', visualStyle: { fontSize: 1.5, rotation: 0, effects: [] }},
    { text: '......', category: 'silence', intensity: 'medium', visualStyle: { fontSize: 1.5, rotation: 0, effects: [] }},
    { text: '쥐 죽은 듯', category: 'silence', intensity: 'medium', visualStyle: { fontSize: 1.0, rotation: 0, color: '#999999', effects: [] }},
    { text: '고요', category: 'silence', intensity: 'soft', visualStyle: { fontSize: 1.2, rotation: 0, color: '#AAAAAA', effects: [] }}
  ]
};

// ============================================
// 대사 포맷터 (Dialogue Formatter)
// ============================================

export interface FormattedDialogue {
  text: string;
  bubbleType: BubbleType;
  style: BubbleStyleConfig;
  tailDirection: TailDirection;
  position: { x: number; y: number };  // 0-100%
  speakerId?: string;
  delay?: number;  // 순차 등장 딜레이 (ms)
}

// 대사 타입 자동 감지
export function detectDialogueType(text: string): BubbleType {
  // 효과음 감지 (한글 의성어/의태어 패턴)
  const sfxPatterns = [
    /^[ㄱ-ㅎ가-힣]{1,4}[!]+$/,  // 쾅! 퍽! 휙!
    /^[ㄱ-ㅎ가-힣]{2,6}$/,      // 우르르, 쏴아아
  ];
  if (sfxPatterns.some(p => p.test(text.trim()))) {
    return 'sfx';
  }

  // 외침 감지
  if (text.includes('!') && text.length <= 20 && text === text.toUpperCase()) {
    return 'shout';
  }
  if (/[!]{2,}/.test(text)) {
    return 'shout';
  }

  // 속삭임 감지
  if (text.startsWith('(') && text.endsWith(')')) {
    return 'whisper';
  }

  // 속마음 감지
  if (text.startsWith("'") && text.endsWith("'")) {
    return 'thought';
  }

  // 나레이션 감지
  if (text.length > 60 || text.includes('그때') || text.includes('그리고')) {
    return 'narration';
  }

  // 기본 대사
  return 'speech';
}

// SFX 추천
export function recommendSFX(
  action: string,
  category?: SFXCategory,
  intensity?: 'soft' | 'medium' | 'strong' | 'extreme'
): SFXEntry[] {
  const library = category ? SFX_LIBRARY[category] : Object.values(SFX_LIBRARY).flat();

  let filtered = library;
  if (intensity) {
    filtered = filtered.filter(sfx => sfx.intensity === intensity);
  }

  // 액션 키워드 매칭 (간단한 버전)
  const actionKeywords: Record<string, SFXCategory[]> = {
    '때리': ['impact', 'action'],
    '달리': ['movement'],
    '걷': ['movement'],
    '날아': ['movement', 'action'],
    '울': ['emotional', 'voice'],
    '웃': ['voice'],
    '비': ['nature', 'environmental'],
    '바람': ['nature'],
    '마법': ['magic'],
    '전기': ['tech', 'magic'],
    '폭발': ['impact', 'action', 'magic'],
    '문': ['environmental'],
    '칼': ['action'],
    '총': ['action', 'environmental']
  };

  for (const [keyword, categories] of Object.entries(actionKeywords)) {
    if (action.includes(keyword)) {
      filtered = filtered.filter(sfx => categories.includes(sfx.category));
      break;
    }
  }

  return filtered.slice(0, 5);  // 상위 5개 추천
}

// 대사 빌드 프롬프트
export function buildDialoguePrompt(
  dialogue: string,
  bubbleType: BubbleType,
  characterVoice?: CharacterVoice
): string {
  const style = BUBBLE_TYPE_STYLES[bubbleType];

  let prompt = `[DIALOGUE RENDERING]
Type: ${bubbleType.toUpperCase()}
Text: "${dialogue}"

Bubble Style:
- Shape: ${style.shape}
- Border: ${style.border} (${style.borderWidth}px)
- Background: ${style.backgroundColor}
- Text: ${style.textColor}, ${style.fontStyle}, ${style.fontSize}`;

  if (style.effects && style.effects.length > 0) {
    prompt += `\n- Effects: ${style.effects.join(', ')}`;
  }

  if (characterVoice) {
    prompt += `

Character Voice:
- Pattern: ${characterVoice.speechPattern}
- Ending: ${characterVoice.endingStyle}
- Traits: ${characterVoice.quirks.join(', ')}`;
  }

  return prompt;
}
