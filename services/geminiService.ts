import { GoogleGenerativeAI } from '@google/generative-ai';
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

function getAiClient(): GoogleGenerativeAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ApiError(ErrorCode.API_KEY_MISSING);
  }
  return new GoogleGenerativeAI(apiKey);
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

export const refineSynopsis = async (input: string, genre: Genre): Promise<string> => {
  const ai = getAiClient();
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = `당신은 네이버/카카오 웹툰 유료 결제율 1위의 메인 PD입니다.
사용자의 아이디어를 상업적 베스트셀러의 '로그라인'과 '기승전결'로 재구성하십시오.
독자의 도파민을 자극하는 '사이다'와 '반전' 요소를 반드시 포함하고, 상업적인 어휘를 사용하십시오.
출력은 한국어로만, 300자 이내로 간결하게 작성하십시오.`;

  const prompt = `${systemPrompt}

[장르: ${genre}] 아이디어: "${input}"
작품의 상업적 가치를 극대화한 시놉시스를 한국어로 작성해.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

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
  const model = ai.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const genreDesc = GENRE_DESCRIPTIONS[genre] || '';

  const prompt = `당신은 프로페셔널 웹툰 콘티 작가입니다.

시놉시스: ${synopsis}
장르: ${genre} - ${genreDesc}
총 ${count}컷의 웹툰 콘티를 생성하세요.

[8컷 구조]
1컷: 훅 - 독자를 사로잡는 오프닝
2컷: 셋업 - 상황/캐릭터 소개
3-4컷: 전개 - 스토리 진행
5-6컷: 고조 - 긴장감 상승
7컷: 클라이막스 - 감정의 정점
8컷: 클리프행어 - 다음이 궁금하도록

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
      "cameraAngle": "카메라 앵글"
    }
  ]
}

dialogue와 caption은 빈 문자열 가능. JSON만 출력하세요.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

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
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS[ArtStyle.WEBTOON_STANDARD];
  const genreDesc = GENRE_DESCRIPTIONS[genre] || '';

  const {
    previousPanelImage = null,
  } = options;

  // Build prompt parts
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  parts.push({
    text: `[MASTERPIECE WEBTOON PANEL - PANEL ${panelIndex + 1}]

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
- Professional webtoon quality`
  });

  // Add previous panel reference if available
  if (previousPanelImage) {
    parts.push({
      text: '\n[PREVIOUS PANEL - Use for character/style consistency only, create NEW composition]'
    });

    const base64Data = previousPanelImage.startsWith('data:')
      ? previousPanelImage.split(',')[1]
      : previousPanelImage;

    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: base64Data
      }
    });
  }

  try {
    const result = await model.generateContent(parts);
    const response = result.response;

    // Find image part in response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    );

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
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

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
    const result = await model.generateContent(prompt);
    const response = result.response;

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    );

    if (!imagePart?.inlineData?.data) {
      throw new Error('캐릭터 시트 생성에 실패했습니다.');
    }

    // Extract features with text model
    const textModel = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const featureResult = await textModel.generateContent(
      `Based on this character description, extract precise visual features:
${request.description}

Output detailed features in English:
- Face shape, Eyes, Hair, Nose/lips, Skin tone, Body type, Distinctive marks, Clothing`
    );

    const extractedFeatures = featureResult.response.text() || '';

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
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

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
    const result = await model.generateContent(prompt);
    const response = result.response;

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    );

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
