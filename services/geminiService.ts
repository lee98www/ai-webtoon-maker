import { GoogleGenAI } from '@google/genai';
import { ArtStyle, Genre, PanelConfig } from "../types";
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

  const prompt = `당신은 영화 감독급 웹툰 연출가다.

[입력]
소재: ${synopsis}
장르: ${genre}

[핵심 원칙]
8컷 = 한 순간의 하이라이트 (0.5초~3초).
소재에서 가장 임팩트 있는 **단일 순간**을 선택해 8컷으로 분해하라.
전체 이야기 금지. 기승전결 금지. 캐릭터 소개 금지.

[완전한 창작 자유]
8컷의 구성, 순서, 앵글, 샷 크기를 **자유롭게 창작**하라.
고정 템플릿 없음. 이 순간에 가장 효과적인 시각적 전개를 창작하라.

예시 (참고만, 따라하지 마):
- "복수의 칼날" → 1컷부터 눈 익스트림 클로즈업, 3컷에서 갑자기 와이드
- "첫 키스" → 느린 줌인, 손→입술→눈 순서
- "폭발" → 와이드→클로즈→와이드 빠른 전환

[연출 원칙]
- 리듬 변화: 빠른/느린 전환의 대비
- 스케일 변화: 와이드↔클로즈업 전환으로 긴장감 조절
- 시선 유도: 독자의 눈이 자연스럽게 흐르도록
- 연속 3컷 동일 앵글/샷 크기 금지
- 매 생성마다 다른 구성을 시도하라

[시각적 디테일 - 반드시 포함]
- 마이크로: 땀방울, 떨리는 손끝, 확대되는 눈동자, 입술의 떨림
- 환경: 흩날리는 머리카락, 옷자락, 먼지, 파편
- 빛과 그림자: 역광, 실루엣, 하이라이트, 렌즈 플레어
- 속도감: 모션 블러, 집중선, 임팩트 이펙트

[옵션]
샷: extreme_wide / wide / full / medium / medium_close / close_up / extreme_close_up
앵글: eye_level / low_angle / high_angle / dutch_angle / over_shoulder / pov / birds_eye / worms_eye

[JSON 출력]
{
  "title": "제목",
  "characterVisuals": "캐릭터 외형 (영어)",
  "highlightMoment": "선택한 하이라이트 순간 (한국어, 1줄)",
  "panels": [
    {
      "panelNumber": 1,
      "timeOffset": "0.0s",
      "description": "영어 시각 묘사 (디테일 필수)",
      "descriptionKo": "한국어 연출 노트",
      "shotSize": "자유 선택",
      "cameraAngle": "자유 선택",
      "visualDetails": ["디테일1", "디테일2", "디테일3"],
      "dialogue": "",
      "caption": "",
      "characterFocus": "피사체",
      "composition": "구도 설명",
      "directorNote": "이 컷의 연출 의도"
    }
  ]
}

dialogue/caption은 최소화. 시각으로 말하라. JSON만 출력.`;

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
  } = options;

  // Build prompt
  let prompt = `[MASTERPIECE WEBTOON PANEL - PANEL ${panelIndex + 1}]

TARGET: Professional Korean webtoon publication quality
FORMAT: 9:16 vertical (mobile optimized)

[STYLE]
${stylePrompt}

[GENRE: ${genre}]
${genreDesc}

[CHARACTER]
${characterVisuals}

[SCENE]
${panel.description}

Camera: ${panel.cameraAngle || 'medium shot'}
Focus: ${panel.characterFocus || 'main character'}

[RULES]
- Cinematic lighting, high-end illustration
- DO NOT render any text or speech bubbles
- Maintain character consistency
- Vertical 9:16 composition
- Professional webtoon quality`;

  // Build contents array
  const contents: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt }
  ];

  // Add previous panel reference if available
  if (previousPanelImage) {
    contents.push({
      text: '\n[PREVIOUS PANEL - Use for character/style consistency only, create NEW composition]'
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
