import { ArtStyle, Genre, PanelConfig } from "../types";

// API 서버 URL
const API_BASE = '/api';

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
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_OFFLINE]: '인터넷 연결을 확인해주세요.',
  [ErrorCode.TIMEOUT]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  [ErrorCode.RATE_LIMITED]: '요청이 너무 빈번합니다. 1분 후 다시 시도해주세요.',
  [ErrorCode.CONTENT_FILTERED]: '콘텐츠가 안전 필터에 의해 차단되었습니다.',
  [ErrorCode.VALIDATION_ERROR]: '입력값을 확인해주세요.',
  [ErrorCode.PARSE_ERROR]: 'AI 응답 형식 오류. 다시 시도해주세요.',
  [ErrorCode.SERVER_ERROR]: '서버 오류가 발생했습니다.',
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

    if (msg.includes('timeout') || msg.includes('시간 초과')) {
      return new ApiError(ErrorCode.TIMEOUT);
    }
    if (msg.includes('rate') || msg.includes('429') || msg.includes('빈번')) {
      return new ApiError(ErrorCode.RATE_LIMITED);
    }
    if (msg.includes('safety') || msg.includes('filtered') || msg.includes('차단')) {
      return new ApiError(ErrorCode.CONTENT_FILTERED);
    }
    if (msg.includes('validation') || msg.includes('입력')) {
      return new ApiError(ErrorCode.VALIDATION_ERROR, error.message);
    }
    if (msg.includes('parse') || msg.includes('json') || msg.includes('형식')) {
      return new ApiError(ErrorCode.PARSE_ERROR);
    }
    if (msg.includes('server') || msg.includes('500')) {
      return new ApiError(ErrorCode.SERVER_ERROR);
    }

    return new ApiError(ErrorCode.UNKNOWN, error.message);
  }

  return new ApiError(ErrorCode.UNKNOWN);
}

// ============================================
// API Request Helper
// ============================================

interface FetchOptions {
  method?: string;
  body?: unknown;
  timeout?: number;
}

async function apiRequest<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'POST', body, timeout = 60000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}`;

      if (response.status === 408) throw new ApiError(ErrorCode.TIMEOUT);
      if (response.status === 429) throw new ApiError(ErrorCode.RATE_LIMITED);
      if (response.status === 422) throw new ApiError(ErrorCode.CONTENT_FILTERED);
      if (response.status === 400) throw new ApiError(ErrorCode.VALIDATION_ERROR, errorMessage);
      if (response.status >= 500) throw new ApiError(ErrorCode.SERVER_ERROR);

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(ErrorCode.TIMEOUT);
    }

    throw classifyError(error);
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
  const result = await apiRequest<{ synopsis: string }>('/refine-synopsis', {
    body: { input, genre },
    timeout: 30000
  });
  return result.synopsis;
};

export const generateStoryboard = async (
  synopsis: string,
  genre: Genre,
  count: number = 8
): Promise<StoryboardResponse> => {
  return apiRequest<StoryboardResponse>('/generate-storyboard', {
    body: { synopsis, genre, count },
    timeout: 60000
  });
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

// AI 캐릭터 시트 생성
export const generateCharacterSheet = async (
  request: CharacterSheetRequest
): Promise<CharacterSheetResponse> => {
  return apiRequest<CharacterSheetResponse>('/generate-character-sheet', {
    body: request,
    timeout: 180000
  });
};

// AI 스타일 레퍼런스 생성
export const generateStyleReference = async (
  request: StyleReferenceRequest
): Promise<StyleReferenceResponse> => {
  return apiRequest<StyleReferenceResponse>('/generate-style-reference', {
    body: request,
    timeout: 180000
  });
};

export const generatePanelImage = async (
  panel: PanelConfig,
  style: ArtStyle,
  genre: Genre,
  characterVisuals: string,
  panelIndex: number = 0,
  options: GenerationOptions = {}
): Promise<string> => {
  const {
    characterRefs = [],
    styleRef = null,
    previousPanelImage = null,
    includeDialogue = false  // 기본값 false - 말풍선은 프론트엔드 오버레이로 처리
  } = options;

  const result = await apiRequest<{ imageUrl: string }>('/generate-panel', {
    body: {
      panel,
      style,
      genre,
      characterVisuals,
      panelIndex,
      characterRefs,
      styleRef,
      previousPanelImage,
      includeDialogue
    },
    timeout: 180000
  });
  return result.imageUrl;
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await apiRequest<{ status: string }>('/health', {
      method: 'GET',
      timeout: 5000
    });
    return true;
  } catch {
    return false;
  }
};

