# API 레퍼런스

## 개요

**파일**: `services/geminiService.ts`

브라우저에서 직접 Google Gemini API를 호출하는 클라이언트.

**사용 라이브러리**: `@google/generative-ai`

---

## API 키 관리

### getApiKey

```typescript
export const getApiKey = (): string | null
```

localStorage에서 API 키 조회.

**저장 키**: `gemini-api-key`

### setApiKey

```typescript
export const setApiKey = (key: string): void
```

API 키를 localStorage에 저장.

### checkApiHealth

```typescript
export const checkApiHealth = async (): Promise<boolean>
```

API 키 유효성 검사.

**방법**: Google API models 목록 조회

---

## 핵심 API 함수

### refineSynopsis

```typescript
export const refineSynopsis = async (
  input: string,
  genre: Genre
): Promise<string>
```

사용자 아이디어를 상업적 시놉시스로 정제.

**모델**: `gemini-2.0-flash`

**입력**:
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| input | string | 사용자 아이디어 텍스트 |
| genre | Genre | 선택된 장르 |

**출력**: 정제된 시놉시스 (한국어, 300자 이내)

**사용처**: UnifiedConceptEditor

---

### generateStoryboard

```typescript
export const generateStoryboard = async (
  synopsis: string,
  genre: Genre,
  count: number = 8
): Promise<StoryboardResponse>
```

시놉시스로부터 8컷 스토리보드 생성.

**모델**: `gemini-2.0-flash` (JSON 응답)

**입력**:
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| synopsis | string | 정제된 시놉시스 |
| genre | Genre | 선택된 장르 |
| count | number | 패널 수 (기본 8) |

**출력**:
```typescript
interface StoryboardResponse {
  title: string;           // 작품 제목
  characterVisuals: string; // 캐릭터 비주얼 설명 (영문)
  panels: PanelConfig[];    // 패널 목록
}
```

**사용처**: BlueprintStep

---

### generatePanelImage

```typescript
export const generatePanelImage = async (
  panel: PanelConfig,
  style: ArtStyle,
  genre: Genre,
  characterVisuals: string,
  panelIndex: number = 0,
  options: GenerationOptions = {}
): Promise<string>
```

단일 패널 이미지 생성.

**모델**: `gemini-2.0-flash-exp-image-generation`

**입력**:
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| panel | PanelConfig | 패널 정보 |
| style | ArtStyle | 아트 스타일 |
| genre | Genre | 장르 |
| characterVisuals | string | 캐릭터 비주얼 설명 |
| panelIndex | number | 패널 순서 |
| options | GenerationOptions | 추가 옵션 |

**GenerationOptions**:
```typescript
interface GenerationOptions {
  characterRefs?: Array<{
    name: string;
    description: string;
    image: string;        // Base64
  }>;
  styleRef?: string | null;  // Base64
  previousPanelImage?: string; // Base64
  includeDialogue?: boolean;
}
```

**출력**: Base64 이미지 URL (`data:image/png;base64,...`)

**사용처**: RenderStep, useSequentialGeneration

---

### generateCharacterSheet

```typescript
export const generateCharacterSheet = async (
  request: CharacterSheetRequest
): Promise<CharacterSheetResponse>
```

캐릭터 레퍼런스 시트 생성.

**모델**: `gemini-2.0-flash-exp-image-generation`

**입력**:
```typescript
interface CharacterSheetRequest {
  name: string;
  description: string;
  artStyle?: ArtStyle;
  gender?: 'male' | 'female' | 'unspecified';
}
```

**출력**:
```typescript
interface CharacterSheetResponse {
  imageUrl: string;          // Base64 이미지
  extractedFeatures: string; // AI 추출 특징
  name: string;
}
```

**레이아웃**: 정면/얼굴 클로즈업/3/4앵글/표정 변화

**사용처**: CharacterManager

---

### generateStyleReference

```typescript
export const generateStyleReference = async (
  request: StyleReferenceRequest
): Promise<StyleReferenceResponse>
```

스타일 레퍼런스 이미지 생성.

**모델**: `gemini-2.0-flash-exp-image-generation`

**입력**:
```typescript
interface StyleReferenceRequest {
  keywords: string[];    // 스타일 키워드
  baseStyle?: ArtStyle;
  sampleScene?: string;  // 샘플 씬 설명
}
```

**출력**:
```typescript
interface StyleReferenceResponse {
  imageUrl: string;       // Base64 이미지
  extractedStyle: string; // 스타일 설명
  keywords: string[];
}
```

**사용처**: StyleReference

---

## 에러 처리

### ErrorCode

```typescript
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
```

### ERROR_MESSAGES

```typescript
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  NETWORK_OFFLINE: '인터넷 연결을 확인해주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  RATE_LIMITED: '요청이 너무 빈번합니다. 1분 후 다시 시도해주세요.',
  CONTENT_FILTERED: '콘텐츠가 안전 필터에 의해 차단되었습니다.',
  VALIDATION_ERROR: '입력값을 확인해주세요.',
  PARSE_ERROR: 'AI 응답 형식 오류. 다시 시도해주세요.',
  API_KEY_MISSING: 'API 키가 설정되지 않았습니다.',
  API_KEY_INVALID: 'API 키가 유효하지 않습니다.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.'
};
```

### ApiError

```typescript
export class ApiError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message?: string);
}
```

### classifyError

```typescript
function classifyError(error: unknown): ApiError
```

일반 에러를 ApiError로 변환.

**분류 기준**:
- fetch 에러 → NETWORK_OFFLINE
- api key 관련 → API_KEY_INVALID
- timeout → TIMEOUT
- rate/429/quota → RATE_LIMITED
- safety/blocked → CONTENT_FILTERED
- parse/json → PARSE_ERROR

---

## 헬퍼 함수

### safeParseJSON

```typescript
function safeParseJSON(text: string): unknown
```

AI 응답에서 JSON 안전하게 파싱.

**처리**:
1. 코드 블록 (```json) 제거
2. trailing comma 제거
3. 작은따옴표 → 큰따옴표 변환

### getAiClient

```typescript
function getAiClient(): GoogleGenerativeAI
```

Gemini AI 클라이언트 인스턴스 생성.

**에러**: API 키 없으면 `API_KEY_MISSING` 에러

---

## 사용 예시

### 시놉시스 정제

```typescript
import { refineSynopsis } from '../services/geminiService';
import { Genre } from '../types';

const handleRefine = async () => {
  try {
    const synopsis = await refineSynopsis(
      '고등학생이 우연히 마법 능력을 얻게 되는 이야기',
      Genre.FANTASY
    );
    setProject({ synopsis });
  } catch (error) {
    if (error instanceof ApiError) {
      setError({ message: error.message, type: 'error' });
    }
  }
};
```

### 스토리보드 생성

```typescript
import { generateStoryboard } from '../services/geminiService';

const handleGenerate = async () => {
  const result = await generateStoryboard(
    project.synopsis,
    project.genre,
    8
  );

  setProject({
    title: result.title,
    characterVisuals: result.characterVisuals,
    panels: result.panels,
  });
};
```

### 이미지 생성 (순차)

```typescript
import { generatePanelImage } from '../services/geminiService';

for (let i = 0; i < panels.length; i++) {
  const imageUrl = await generatePanelImage(
    panels[i],
    project.artStyle,
    project.genre,
    project.characterVisuals,
    i,
    {
      previousPanelImage: i > 0 ? panels[i-1].generatedImageUrl : undefined,
      characterRefs: project.characters.map(c => ({
        name: c.name,
        description: c.description,
        image: c.referenceImages[0],
      })),
    }
  );

  updatePanelByIndex(i, { generatedImageUrl: imageUrl });
}
```

---

## 모델 정보

| 용도 | 모델 ID |
|------|---------|
| 텍스트 생성 | `gemini-2.0-flash` |
| JSON 응답 | `gemini-2.0-flash` (responseMimeType: application/json) |
| 이미지 생성 | `gemini-2.0-flash-exp-image-generation` |

---

## 제한사항

- **Rate Limit**: Google API 기본 제한 적용
- **이미지 크기**: 최대 ~4MB (Base64)
- **콘텐츠 필터**: 폭력/성인 콘텐츠 차단됨
- **CORS**: 브라우저 직접 호출 지원
