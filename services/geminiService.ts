import { GoogleGenAI } from '@google/genai';
import { ArtStyle, Genre, PanelConfig, CharacterSheetInfo, LocationSheetInfo } from "../types";
import { STYLE_PROMPTS, GENRE_DESCRIPTIONS } from "../constants";

// API Key Storage
const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

// ============================================
// Error Handling
// ============================================

export enum ErrorCode {
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  CONTENT_FILTERED = 'CONTENT_FILTERED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_KEY_INVALID = 'API_KEY_INVALID',
  UNKNOWN = 'UNKNOWN'
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_OFFLINE]: '인터넷 연결을 확인해주세요.',
  [ErrorCode.TIMEOUT]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  [ErrorCode.RATE_LIMITED]: '요청이 너무 빈번합니다. 1분 후 다시 시도해주세요.',
  [ErrorCode.CONTENT_FILTERED]: '콘텐츠가 안전 필터에 의해 차단되었습니다.',
  [ErrorCode.VALIDATION_ERROR]: '입력값을 확인해주세요.',
  [ErrorCode.PARSE_ERROR]: 'AI 응답 형식 오류. 다시 시도해주세요.',
  [ErrorCode.API_KEY_MISSING]: 'API 키가 설정되지 않았습니다.',
  [ErrorCode.API_KEY_INVALID]: 'API 키가 유효하지 않습니다.',
  [ErrorCode.UNKNOWN]: '알 수 없는 오류가 발생했습니다.'
};

export class ApiError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message || ERROR_MESSAGES[code]);
    this.code = code;
    this.name = 'ApiError';
  }
}

function classifyError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError(ErrorCode.NETWORK_OFFLINE);
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('api key') || msg.includes('api_key_invalid')) {
      return new ApiError(ErrorCode.API_KEY_INVALID);
    }
    if (msg.includes('timeout') || msg.includes('시간 초과')) {
      return new ApiError(ErrorCode.TIMEOUT);
    }
    if (msg.includes('rate') || msg.includes('429') || msg.includes('quota')) {
      return new ApiError(ErrorCode.RATE_LIMITED);
    }
    if (msg.includes('safety') || msg.includes('blocked') || msg.includes('차단')) {
      return new ApiError(ErrorCode.CONTENT_FILTERED);
    }
    if (msg.includes('parse') || msg.includes('json')) {
      return new ApiError(ErrorCode.PARSE_ERROR);
    }

    return new ApiError(ErrorCode.UNKNOWN, error.message);
  }

  return new ApiError(ErrorCode.UNKNOWN);
}

// ============================================
// AI Client
// ============================================

function getAiClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ApiError(ErrorCode.API_KEY_MISSING);
  }
  return new GoogleGenAI({ apiKey });
}

// ============================================
// Helper Functions
// ============================================

function safeParseJSON(text: string): unknown {
  let cleaned = text.trim();

  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/'/g, '"');

    return JSON.parse(cleaned);
  }
}

// ============================================
// API Functions
// ============================================

interface StoryboardResponse {
  title: string;
  characterVisuals: string;
  highlightMoment: string;
  mainCharacter: CharacterSheetInfo;
  location: LocationSheetInfo;
  panels: PanelConfig[];
}

// 텍스트 모델
const TEXT_MODEL = 'gemini-2.5-flash';
// 이미지 생성 모델 (Gemini 3.0)
const IMAGE_MODEL = 'gemini-3-pro-image-preview';

export const refineSynopsis = async (input: string, genre: Genre): Promise<string> => {
  const ai = getAiClient();

  const systemPrompt = `당신은 네이버/카카오 웹툰 연출 PD입니다.

[핵심 원칙]
사용자 아이디어에서 가장 임팩트 있는 **단일 순간**을 찾아라.
전체 스토리가 아닌, 8컷으로 표현할 **결정적 장면** 하나를 선택하라.

[장르별 하이라이트 순간 예시]
- Action: 펀치가 얼굴에 닿는 0.5초, 칼날이 스치는 순간, 폭발 직전~직후
- Romance: 고백 직전 떨리는 입술, 눈이 마주치는 순간, 손이 닿는 찰나
- Horror: 뒤에 뭔가 있다는 걸 깨닫는 순간, 문이 열리는 3초, 눈을 마주치는 공포
- Fantasy: 마법 발동의 순간, 용이 나타나는 임팩트, 각성의 순간
- Noir: 총구가 겨눠지는 순간, 배신을 깨닫는 표정, 비 오는 거리의 대면
- Slice of Life: 눈물이 흐르는 순간, 웃음이 터지는 찰나, 깨달음의 순간

[출력 형식]
1줄: 선택한 하이라이트 순간 (예: "복수를 결심하며 검을 쥐는 그 순간")
2줄: 그 순간의 감정/긴장감
3줄: 핵심 시각적 요소 (표정, 동작, 빛, 공간)

한국어, 150자 이내.`;

  const prompt = `${systemPrompt}

[장르: ${genre}]
아이디어: "${input}"

위 아이디어에서 8컷으로 분해할 **가장 임팩트 있는 단일 순간**을 선택하고 묘사하라.`;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt
  });

  const text = response.text;

  if (!text) {
    throw new ApiError(ErrorCode.PARSE_ERROR, '시놉시스 생성에 실패했습니다.');
  }

  return text.trim();
};

export const generateStoryboard = async (
  synopsis: string,
  genre: Genre,
  _count: number = 8
): Promise<StoryboardResponse> => {
  const ai = getAiClient();

  const prompt = `당신은 봉준호, 박찬욱급 시네마토그래퍼다.

[입력]
소재: ${synopsis}
장르: ${genre}

[핵심 원칙]
8컷 = 0.5초~3초의 **결정적 순간**을 시네마틱하게 분해.
정적인 AI 그림이 아닌, 영화 스틸컷 같은 역동적 연출.

[절대 금지]
- 시간 경과, 장면 전환, 새 캐릭터 등장
- 정면 바스트샷의 반복 (가장 지루한 구도)
- 평범한 아이레벨 정중앙 배치
- "설명하는" 구도 (인물 전체가 다 보이는 안전한 구도)

[시네마틱 연출 원칙 - 반드시 적용]

1. **극단적 앵글 사용**
   - 로우앵글로 위압감/영웅적 순간 강조
   - 하이앵글로 취약함/고립감 표현
   - 더치앵글로 불안/긴장 고조
   - 버즈아이(조감)로 상황 전체 조망
   - 웜즈아이(개미시점)로 극적 임팩트

2. **과감한 구도**
   - 프레임 가장자리 배치 (dead center 금지)
   - 대각선 구도로 역동성 부여
   - 여백 활용으로 긴장감 (캐릭터를 작게, 공간을 크게)
   - 전경(foreground) 요소로 깊이감 (흐릿한 손, 물체 등)
   - 실루엣/역광으로 분위기 강조

3. **카메라 움직임 느낌**
   - 줌인 효과: 갑자기 가까워지는 임팩트
   - 달리샷 느낌: 피사체를 따라가는 역동성
   - 페이스 투 페이스: 두 인물의 극적 대치
   - 리액션 컷: 보는 자 → 보이는 것 교차

4. **빛과 그림자의 영화적 활용**
   - 림라이트(윤곽광)으로 인물 분리
   - 하드 라이트로 극적 명암
   - 렌즈 플레어로 감정적 순간 강조
   - 실루엣으로 미스터리/드라마틱 연출

5. **마이크로 디테일 (필수)**
   - 떨리는 손끝, 쥐어지는 주먹
   - 흘러내리는 땀방울/눈물
   - 확대되는 눈동자(동공 수축/확장)
   - 바람에 날리는 머리카락/옷자락
   - 공기 중 먼지/파편/불꽃

[샷 구성 규칙]
- 컷1: 와이드 또는 익스트림 앵글로 임팩트 있는 시작
- 컷2-3: 리듬 변화 (빠름↔느림)
- 컷4-5: 스케일 전환 (와이드↔클로즈업)
- 컷6-7: 긴장 고조, 극단적 앵글
- 컷8: 임팩트 또는 여운 (익스트림 클로즈업 or 풀백)
- **연속 2컷 동일 앵글/샷 크기 금지**

[샷 옵션]
샷: extreme_wide / wide / full / medium / medium_close / close_up / extreme_close_up / detail
앵글: eye_level / low_angle / high_angle / dutch_angle / over_shoulder / pov / birds_eye / worms_eye

[JSON 출력]
{
  "title": "제목",
  "characterVisuals": "캐릭터 외형 (영어)",
  "highlightMoment": "이 순간의 본질 (한국어)",
  "mainCharacter": {
    "name": "이름",
    "appearance": "얼굴형, 눈색, 머리카락, 피부톤, 나이대 (영어, 상세히)",
    "clothing": "의상 상세 (영어)",
    "distinctiveFeatures": "특징 (영어)"
  },
  "location": {
    "name": "장소명",
    "description": "공간 상세 (영어)",
    "lighting": "조명 (역광, 림라이트 등)",
    "atmosphere": "분위기",
    "timeOfDay": "시간대"
  },
  "panels": [
    {
      "panelNumber": 1,
      "timeOffset": "0.0s",
      "description": "시네마틱한 영어 시각 묘사 (앵글, 조명, 구도 명시)",
      "descriptionKo": "연출 노트",
      "shotSize": "샷",
      "cameraAngle": "앵글",
      "visualDetails": ["디테일1", "디테일2", "디테일3"],
      "dialogue": "캐릭터 대사 (한국어, 짧고 임팩트 있게)",
      "caption": "나레이션 (선택)",
      "characterFocus": "피사체",
      "composition": "구도 (삼분법, 대각선, 프레임인프레임 등)",
      "directorNote": "연출 의도 (왜 이 앵글인지)"
    }
  ]
}

[대사 규칙 - 중요]
- 8컷 중 최소 3~4컷에는 반드시 대사(dialogue) 포함
- 대사는 한국어, 짧고 임팩트 있게 (1~2문장)
- 감정적 순간, 결정적 대사 필수
- 클로즈업/익스트림 클로즈업 컷에 대사 배치 권장

JSON만 출력.`;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const text = response.text;

  if (!text) {
    throw new ApiError(ErrorCode.PARSE_ERROR, '콘티 생성에 실패했습니다.');
  }

  try {
    const parsed = safeParseJSON(text) as StoryboardResponse;

    // Add IDs to panels
    const panels = parsed.panels.map((p, idx) => ({
      ...p,
      id: `panel-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      isGenerating: false
    }));

    return {
      title: parsed.title,
      characterVisuals: parsed.characterVisuals,
      highlightMoment: parsed.highlightMoment || '',
      mainCharacter: parsed.mainCharacter || {
        name: '',
        appearance: parsed.characterVisuals || '',
        clothing: '',
        distinctiveFeatures: ''
      },
      location: parsed.location || {
        name: '',
        description: '',
        lighting: '',
        atmosphere: '',
        timeOfDay: ''
      },
      panels
    };
  } catch (err) {
    console.error('JSON parse error:', text.slice(0, 500));
    throw new ApiError(ErrorCode.PARSE_ERROR, 'AI 응답 형식 오류. 다시 시도해주세요.');
  }
};

export interface GenerationOptions {
  characterRefs?: Array<{
    name: string;
    description: string;
    image: string;
  }>;
  styleRef?: string | null;
  previousPanelImage?: string;
  includeDialogue?: boolean;
  // 시트 참조 (일관성 강화)
  characterSheet?: string;  // base64 캐릭터 시트 이미지
  locationSheet?: string;   // base64 장소 시트 이미지
  characterInfo?: CharacterSheetInfo;  // 캐릭터 텍스트 정보
  locationInfo?: LocationSheetInfo;    // 장소 텍스트 정보
}

export const generatePanelImage = async (
  panel: PanelConfig,
  style: ArtStyle,
  genre: Genre,
  characterVisuals: string,
  panelIndex: number = 0,
  options: GenerationOptions = {}
): Promise<string> => {
  const ai = getAiClient();

  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS[ArtStyle.WEBTOON_STANDARD];
  const genreDesc = GENRE_DESCRIPTIONS[genre] || '';

  const {
    previousPanelImage = null,
    characterSheet = null,
    locationSheet = null,
    characterInfo = null,
    locationInfo = null,
  } = options;

  // 캐릭터 정보 구성
  let characterDesc = characterVisuals;
  if (characterInfo) {
    characterDesc = `${characterInfo.name}: ${characterInfo.appearance}. Clothing: ${characterInfo.clothing}. Features: ${characterInfo.distinctiveFeatures}`;
  }

  // 장소 정보 구성
  let locationDesc = '';
  if (locationInfo) {
    locationDesc = `\n[LOCATION - MUST MATCH EXACTLY]
${locationInfo.name}: ${locationInfo.description}
Lighting: ${locationInfo.lighting}
Atmosphere: ${locationInfo.atmosphere}
Time: ${locationInfo.timeOfDay}`;
  }

  // 말풍선 처리 (대사가 있으면 필수로 포함)
  let dialogueSection = '';
  let speechBubbleRule = '- DO NOT render any text or speech bubbles';

  if (panel.dialogue && panel.dialogue.trim()) {
    dialogueSection = `

[SPEECH BUBBLE - MANDATORY]
⚠️ THIS PANEL MUST INCLUDE A SPEECH BUBBLE WITH THE FOLLOWING TEXT:
Text: "${panel.dialogue}"

SPEECH BUBBLE REQUIREMENTS:
- Style: Clean white speech bubble with black outline
- Shape: Oval/rounded rectangle shape
- Tail: Clear tail pointing to the speaker's mouth
- Position: Upper portion of panel (top 1/3), NOT covering the character's face
- Text: Korean text "${panel.dialogue}" clearly readable
- Font: Clean, bold, easy to read
- Size: Large enough to read on mobile (speech bubble takes 15-25% of panel width)

⚠️ DO NOT SKIP THE SPEECH BUBBLE. IT IS REQUIRED FOR THIS PANEL.`;

    speechBubbleRule = `- MUST render speech bubble with Korean text: "${panel.dialogue}"
- Speech bubble is MANDATORY, not optional`;
  }

  // Build prompt - 시네마틱 연출 강화
  let prompt = `[CINEMATIC WEBTOON PANEL - PANEL ${panelIndex + 1}]

GOAL: 영화 스틸컷 퀄리티의 웹툰 패널. 정적인 AI 그림이 아닌 역동적 연출.
FORMAT: 9:16 vertical (mobile webtoon)

[ART STYLE]
${stylePrompt}

[GENRE MOOD: ${genre}]
${genreDesc}

[CHARACTER - EXACT MATCH REQUIRED]
${characterDesc}
${locationDesc}

[SCENE DIRECTION]
${panel.description}
${panel.visualDetails ? `Visual Details: ${panel.visualDetails.join(', ')}` : ''}

[CAMERA WORK - CRITICAL]
Camera Angle: ${panel.cameraAngle || 'dynamic angle'}
Shot Size: ${panel.shotSize || 'medium'}
Subject: ${panel.characterFocus || 'main character'}
Composition: ${panel.composition || 'cinematic composition'}
${dialogueSection}

[CINEMATIC REQUIREMENTS - MUST APPLY]
1. DRAMATIC LIGHTING:
   - Strong rim light separating subject from background
   - Atmospheric lighting (volumetric rays, dust particles in light)
   - High contrast shadows for mood
   - Lens flare or light bloom for emotional moments

2. DYNAMIC COMPOSITION:
   - Subject NOT dead center (use rule of thirds or golden ratio)
   - Diagonal lines for energy and tension
   - Foreground elements for depth (blurred objects, hands, debris)
   - Negative space to emphasize emotion

3. CINEMATIC CAMERA:
   - ${panel.cameraAngle === 'low_angle' ? 'Camera looking UP at subject - heroic/powerful feel' : ''}
   - ${panel.cameraAngle === 'high_angle' ? 'Camera looking DOWN at subject - vulnerable/isolated feel' : ''}
   - ${panel.cameraAngle === 'dutch_angle' ? 'TILTED frame (15-30 degrees) - tension/unease' : ''}
   - ${panel.cameraAngle === 'worms_eye' ? 'Extreme low angle from ground - dramatic impact' : ''}
   - ${panel.cameraAngle === 'birds_eye' ? 'Directly overhead view - omniscient perspective' : ''}

4. MICRO DETAILS (REQUIRED):
   - Sweat droplets, trembling fingers, dilated pupils
   - Hair/clothing movement from wind or motion
   - Dust particles, debris, sparks in air
   - Motion blur on fast elements

5. ATMOSPHERE:
   - NOT flat lighting - create depth with light/shadow
   - Environmental storytelling (weather, time of day)
   - Emotional color grading matching the mood

[HARD RULES]
- EXACT character appearance from reference sheet
- EXACT environment from location reference
- Vertical 9:16 composition
- Publication-ready quality
- NO generic AI look - cinematic feel only
${speechBubbleRule}`;

  // Build contents array
  const contents: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt }
  ];

  // Add character sheet reference (최우선)
  if (characterSheet) {
    contents.push({
      text: '\n[CHARACTER REFERENCE SHEET - MUST MATCH THIS CHARACTER EXACTLY]'
    });

    const base64Data = characterSheet.startsWith('data:')
      ? characterSheet.split(',')[1]
      : characterSheet;

    contents.push({
      inlineData: {
        mimeType: 'image/png',
        data: base64Data
      }
    });
  }

  // Add location sheet reference
  if (locationSheet) {
    contents.push({
      text: '\n[LOCATION REFERENCE - MUST MATCH THIS ENVIRONMENT]'
    });

    const base64Data = locationSheet.startsWith('data:')
      ? locationSheet.split(',')[1]
      : locationSheet;

    contents.push({
      inlineData: {
        mimeType: 'image/png',
        data: base64Data
      }
    });
  }

  // Add previous panel reference if available
  if (previousPanelImage) {
    contents.push({
      text: '\n[PREVIOUS PANEL - For style/lighting consistency]'
    });

    const base64Data = previousPanelImage.startsWith('data:')
      ? previousPanelImage.split(',')[1]
      : previousPanelImage;

    contents.push({
      inlineData: {
        mimeType: 'image/png',
        data: base64Data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });

    // Find image part in response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('이미지 생성에 실패했습니다.');
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      throw new Error('이미지 생성에 실패했습니다.');
    }

    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart?.inlineData?.data) {
      throw new Error('이미지 생성에 실패했습니다.');
    }

    return `data:image/png;base64,${imagePart.inlineData.data}`;
  } catch (error) {
    throw classifyError(error);
  }
};

// ============================================
// AI Generation API Functions
// ============================================

export interface CharacterSheetRequest {
  name: string;
  description: string;
  artStyle?: ArtStyle;
  gender?: 'male' | 'female' | 'unspecified';
}

export interface CharacterSheetResponse {
  imageUrl: string;
  extractedFeatures: string;
  name: string;
}

export interface StyleReferenceRequest {
  keywords: string[];
  baseStyle?: ArtStyle;
  sampleScene?: string;
}

export interface StyleReferenceResponse {
  imageUrl: string;
  extractedStyle: string;
  keywords: string[];
}

export const generateCharacterSheet = async (
  request: CharacterSheetRequest
): Promise<CharacterSheetResponse> => {
  const ai = getAiClient();

  const stylePrompt = request.artStyle
    ? STYLE_PROMPTS[request.artStyle]
    : STYLE_PROMPTS[ArtStyle.WEBTOON_STANDARD];

  const prompt = `[CHARACTER REFERENCE SHEET]

Create a professional character reference sheet for webtoon production.

CHARACTER:
- Name: ${request.name || 'Character'}
- Description: ${request.description}
- Gender: ${request.gender || 'unspecified'}

LAYOUT: Single image containing:
1. FRONT VIEW (3/4 body) - LEFT
2. FACE CLOSE-UP - CENTER TOP
3. 3/4 ANGLE VIEW - CENTER BOTTOM
4. 3 EXPRESSION VARIATIONS - RIGHT

STYLE: ${stylePrompt}

REQUIREMENTS:
- All views show EXACT SAME character
- Clean white background
- NO text labels
- High detail on face, hair, clothing
- Consistent proportions`;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('캐릭터 시트 생성에 실패했습니다.');
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      throw new Error('캐릭터 시트 생성에 실패했습니다.');
    }

    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart?.inlineData?.data) {
      throw new Error('캐릭터 시트 생성에 실패했습니다.');
    }

    // Extract features with text model
    const featureResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Based on this character description, extract precise visual features:
${request.description}

Output detailed features in English:
- Face shape, Eyes, Hair, Nose/lips, Skin tone, Body type, Distinctive marks, Clothing`
    });

    const extractedFeatures = featureResponse.text || '';

    return {
      imageUrl: `data:image/png;base64,${imagePart.inlineData.data}`,
      extractedFeatures,
      name: request.name || 'Character'
    };
  } catch (error) {
    throw classifyError(error);
  }
};

export const generateStyleReference = async (
  request: StyleReferenceRequest
): Promise<StyleReferenceResponse> => {
  const ai = getAiClient();

  const baseStyle = request.baseStyle
    ? STYLE_PROMPTS[request.baseStyle]
    : STYLE_PROMPTS[ArtStyle.WEBTOON_STANDARD];

  const keywordMap: Record<string, string> = {
    '선명한 선화': 'crisp clean line art',
    '수채화 느낌': 'watercolor texture',
    '그라데이션': 'smooth gradient shading',
    '플랫 컬러': 'flat solid colors',
    '강한 명암': 'high contrast dramatic shadows',
    '파스텔 톤': 'soft pastel colors',
    '네온 컬러': 'vibrant neon colors',
    '빈티지': 'vintage retro aesthetic',
    '미니멀': 'minimalist clean design',
    '디테일함': 'highly detailed artwork'
  };

  const englishKeywords = request.keywords
    .map(k => keywordMap[k] || k)
    .join(', ');

  const prompt = `[STYLE REFERENCE SAMPLE]

Create a style reference for webtoon production.

BASE STYLE: ${baseStyle}
ADDITIONAL: ${englishKeywords}
SCENE: ${request.sampleScene || 'Character in urban setting'}

REQUIREMENTS:
- Demonstrate specific visual style clearly
- Focus on: line quality, color palette, shading
- Professional webtoon quality
- Vertical 9:16 format`;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('스타일 레퍼런스 생성에 실패했습니다.');
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      throw new Error('스타일 레퍼런스 생성에 실패했습니다.');
    }

    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart?.inlineData?.data) {
      throw new Error('스타일 레퍼런스 생성에 실패했습니다.');
    }

    return {
      imageUrl: `data:image/png;base64,${imagePart.inlineData.data}`,
      extractedStyle: `Style: ${request.baseStyle}\nKeywords: ${request.keywords.join(', ')}`,
      keywords: request.keywords
    };
  } catch (error) {
    throw classifyError(error);
  }
};

// ============================================
// Location Sheet Generation (장소 시트 생성)
// ============================================

export interface LocationSheetRequest {
  name: string;
  description: string;
  lighting: string;
  atmosphere: string;
  timeOfDay: string;
  artStyle?: ArtStyle;
  genre?: Genre;
}

export interface LocationSheetResponse {
  imageUrl: string;
  extractedDetails: string;
}

export const generateLocationSheet = async (
  request: LocationSheetRequest
): Promise<LocationSheetResponse> => {
  const ai = getAiClient();

  const stylePrompt = request.artStyle
    ? STYLE_PROMPTS[request.artStyle]
    : STYLE_PROMPTS[ArtStyle.WEBTOON_STANDARD];

  const genreDesc = request.genre
    ? GENRE_DESCRIPTIONS[request.genre]
    : '';

  const prompt = `[LOCATION REFERENCE SHEET]

Create a professional location/environment reference sheet for webtoon production.

LOCATION:
- Name: ${request.name}
- Description: ${request.description}
- Lighting: ${request.lighting}
- Atmosphere: ${request.atmosphere}
- Time of Day: ${request.timeOfDay}

LAYOUT: Single image containing 3 views:
1. WIDE SHOT (full environment overview) - TOP
2. MEDIUM SHOT (key area with more detail) - BOTTOM LEFT
3. DETAIL SHOT (important props/textures) - BOTTOM RIGHT

STYLE: ${stylePrompt}
${genreDesc ? `GENRE MOOD: ${genreDesc}` : ''}

REQUIREMENTS:
- All views show EXACT SAME location
- Consistent lighting across all views
- Show key environmental details (furniture, props, textures)
- ${request.timeOfDay} lighting atmosphere
- Professional webtoon background quality
- NO characters in the scene`;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('장소 시트 생성에 실패했습니다.');
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      throw new Error('장소 시트 생성에 실패했습니다.');
    }

    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart?.inlineData?.data) {
      throw new Error('장소 시트 생성에 실패했습니다.');
    }

    return {
      imageUrl: `data:image/png;base64,${imagePart.inlineData.data}`,
      extractedDetails: `Location: ${request.name}\nLighting: ${request.lighting}\nAtmosphere: ${request.atmosphere}`
    };
  } catch (error) {
    throw classifyError(error);
  }
};

// API 키 검증
export const checkApiHealth = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  if (!apiKey) return false;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    return response.ok;
  } catch {
    return false;
  }
};
