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

  const systemPrompt = `당신은 네이버/카카오 웹툰 유료 결제율 1위의 메인 PD입니다.
사용자의 아이디어를 상업적 베스트셀러의 '로그라인'과 '기승전결'로 재구성하십시오.
독자의 도파민을 자극하는 '사이다'와 '반전' 요소를 반드시 포함하고, 상업적인 어휘를 사용하십시오.
출력은 한국어로만, 300자 이내로 간결하게 작성하십시오.`;

  const prompt = `${systemPrompt}

[장르: ${genre}] 아이디어: "${input}"
작품의 상업적 가치를 극대화한 시놉시스를 한국어로 작성해.`;

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
  count: number = 8
): Promise<StoryboardResponse> => {
  const ai = getAiClient();

  const genreDesc = GENRE_DESCRIPTIONS[genre] || '';

  const prompt = `당신은 프로페셔널 웹툰 콘티 작가이자 **영화 감독급 연출가**입니다.

시놉시스: ${synopsis}
장르: ${genre} - ${genreDesc}
총 ${count}컷의 웹툰 콘티를 생성하세요.

[연출 철학 - 반드시 준수]
- 카메라는 감정을 전달하는 도구. 모든 컷이 같은 앵글이면 죽은 연출이다.
- 스토리의 리듬과 긴장감에 따라 샷 크기와 앵글을 **의도적으로** 변화시켜라.
- 이전 컷과의 대비, 다음 컷으로의 흐름을 고려한 시퀀스를 구성하라.
- 연속 3컷 이상 동일한 shotSize나 cameraAngle을 사용하지 마라.

[사용 가능한 샷 크기 - shotSize]
- extreme_wide: 광활한 풍경, 스케일 강조, 인물이 작게
- wide: 환경 + 캐릭터 전체 맥락
- full: 캐릭터 전신
- medium_full: 무릎 위
- medium: 허리 위 (대화 기본)
- medium_close: 가슴 위 (감정 전달)
- close_up: 얼굴 (강렬한 감정)
- extreme_close_up: 눈/입/손 디테일 (결정적 순간)

[사용 가능한 카메라 앵글 - cameraAngle]
- eye_level: 중립, 관객과 동일시
- low_angle: 위압감, 영웅적, 힘
- high_angle: 취약함, 열세, 압도당함
- dutch_angle: 불안, 긴장, 혼란
- over_shoulder: 대화 장면, 관계성
- pov: 1인칭 시점, 몰입
- birds_eye: 전지적 시점, 운명적
- worms_eye: 극도로 낮은 시점, 극적 위압감

[장르별 선호 스타일 참고]
- Action: low_angle, dutch_angle, worms_eye 선호. 빠른 샷 전환, 역동적 구도
- Romance: eye_level, over_shoulder 선호. 부드러운 흐름, 친밀한 거리감
- Horror: dutch_angle, high_angle, pov 선호. 불안한 프레이밍, 여백 활용
- Fantasy: wide, extreme_wide, low_angle 선호. 스케일 강조
- Slice of Life: eye_level, medium 중심. 자연스러운 관찰자 시점
- Noir: dutch_angle, low_angle, over_shoulder 선호. 그림자와 대비
- Politics: low_angle, high_angle 대비. 권력 역학 표현

[핵심 원칙 - 하이라이트 연출]
⚠️ 8컷에 전체 이야기를 담지 마라. 기승전결 구조 금지.
✅ 시놉시스에서 가장 임팩트 있는 **한 순간**을 선택하라.
✅ 그 순간을 8컷으로 **디테일하게** 펼쳐라.

예시:
- "복수를 다짐하는 남자" → 복수 전체 스토리 X → 복수를 결심하는 **그 순간**의 표정, 주먹, 눈빛, 회상
- "첫사랑 고백" → 만남부터 결말 X → 고백 직전 긴장, 말을 꺼내는 순간, 상대 반응의 **디테일**

[8컷 시퀀스 설계]
- 1-2컷: 순간의 직전 - 긴장감 구축, 상황 암시
- 3-5컷: 핵심 순간 - 감정/액션의 절정을 여러 앵글로 분해
- 6-7컷: 반응/여파 - 그 순간 직후의 임팩트
- 8컷: 여운 또는 반전 - 강렬한 마무리

각 컷은 **같은 순간을 다른 각도로** 보여주거나, **0.5초 단위의 미세한 시간 흐름**을 표현할 수 있다.

[출력 JSON 형식]
{
  "title": "작품 제목",
  "characterVisuals": "주인공 외형 상세 설명 (영어, 얼굴/머리/체형/의상 포함)",
  "panels": [
    {
      "panelNumber": 1,
      "beatType": "hook",
      "emotionalWeight": 0.7,
      "description": "영어로 된 상세 시각 묘사 (캐릭터 외형 키워드 포함)",
      "descriptionKo": "한국어 연출 가이드",
      "dialogue": "캐릭터 대사 (한국어, 40자 이내)",
      "caption": "나레이션 (한국어, 80자 이내)",
      "characterFocus": "초점 캐릭터",
      "shotSize": "wide | medium | close_up 등 위 목록에서 선택",
      "cameraAngle": "low_angle | dutch_angle 등 위 목록에서 선택",
      "composition": "구도 설명 (삼분법, 대각선, 중앙배치, 여백활용 등)",
      "directorNote": "이 앵글과 샷을 선택한 연출 의도 (한국어, 1줄)"
    }
  ]
}

dialogue와 caption은 빈 문자열 가능. JSON만 출력하세요.`;

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
