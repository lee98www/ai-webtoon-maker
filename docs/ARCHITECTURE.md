# 아키텍처 개요

## 프로젝트 소개

**ToonCraft AI Studio**는 AI를 활용한 웹툰 자동 생성 플랫폼입니다.

- 사용자의 스토리 아이디어 입력
- AI가 8컷 스토리보드 자동 생성
- 각 패널 이미지 AI 생성
- 완성된 웹툰 다운로드

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 18, TypeScript |
| 상태관리 | Zustand (persist middleware) |
| 스타일링 | Tailwind CSS |
| 빌드 | Vite |
| AI API | Google Gemini (generative-ai) |
| 배포 | Vercel |
| 저장소 | localStorage |

---

## 디렉토리 구조

```
tooncraft-ai-studio/
│
├── App.tsx                     # 앱 엔트리 (API키 체크, 라우팅)
├── index.tsx                   # React DOM 렌더링
├── types.ts                    # 전역 타입 정의
├── constants.ts                # 장르/스타일 상수, 프롬프트
│
├── src/
│   ├── components/
│   │   ├── wizard/             # 마법사 프레임워크
│   │   │   ├── WizardLayout.tsx      # 전체 레이아웃
│   │   │   ├── ContentArea.tsx       # 현재 단계 콘텐츠
│   │   │   ├── StepSidebar.tsx       # 좌측 사이드바
│   │   │   └── PreviewPanel.tsx      # 우측 미리보기
│   │   │
│   │   ├── concept/            # 기획 단계 컴포넌트
│   │   │   ├── UnifiedConceptEditor.tsx  # 통합 기획 에디터
│   │   │   ├── IdeaInput.tsx         # 아이디어 입력
│   │   │   ├── GenreSelector.tsx     # 장르 선택
│   │   │   └── StyleSelector.tsx     # 스타일 선택
│   │   │
│   │   ├── steps/              # 단계별 메인 컴포넌트
│   │   │   ├── storyboard/
│   │   │   │   └── BlueprintStep.tsx # 콘티 생성
│   │   │   └── production/
│   │   │       └── RenderStep.tsx    # 이미지 렌더링
│   │   │
│   │   ├── reference/          # 레퍼런스 시스템
│   │   │   ├── CharacterManager.tsx  # 캐릭터 관리
│   │   │   └── StyleReference.tsx    # 스타일 레퍼런스
│   │   │
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   │   ├── Navigation.tsx        # 상단 네비게이션
│   │   │   ├── Header.tsx            # 헤더
│   │   │   └── StepFooter.tsx        # 하단 네비게이션
│   │   │
│   │   ├── ui/                 # 공통 UI 컴포넌트
│   │   │   ├── Toast.tsx             # 알림 토스트
│   │   │   └── ProgressBar.tsx       # 진행률 표시
│   │   │
│   │   └── ApiKeyModal.tsx     # API 키 설정 모달
│   │
│   ├── store/
│   │   └── projectStore.ts     # Zustand 전역 상태
│   │
│   ├── hooks/
│   │   └── useSequentialGeneration.ts  # 순차 생성 훅
│   │
│   └── pages/                  # 페이지 컴포넌트
│       ├── ConceptPage.tsx
│       ├── StoryboardPage.tsx
│       └── ProductionPage.tsx
│
├── services/
│   └── geminiService.ts        # Gemini API 클라이언트
│
├── components/                 # 레거시 컴포넌트
│   ├── WebtoonViewer.tsx       # 웹툰 뷰어
│   └── Button.tsx              # 버튼
│
├── server/                     # 백엔드 (현재 미사용)
│   ├── index.ts                # Express 서버
│   └── prompts/                # 프롬프트 모음
│
├── docs/                       # 문서
│   ├── ARCHITECTURE.md         # (현재 파일)
│   ├── COMPONENTS.md
│   ├── STATE.md
│   ├── API.md
│   ├── PROMPTS.md
│   └── CHANGELOG.md
│
├── public/                     # 정적 파일
├── dist/                       # 빌드 결과물
├── CLAUDE.md                   # AI 개발 지침
└── package.json
```

---

## 3단계 워크플로우

```
┌─────────────────────────────────────────────────────────────┐
│                      ToonCraft AI Studio                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [1. CONCEPT]  ────>  [2. STORYBOARD]  ────>  [3. RENDER]  │
│                                                             │
│   ┌───────────┐       ┌──────────────┐       ┌───────────┐ │
│   │ 아이디어   │       │ 8컷 콘티     │       │ 이미지    │ │
│   │ 입력      │  →    │ 자동 생성    │  →    │ 렌더링    │ │
│   │           │       │              │       │           │ │
│   │ 장르 선택  │       │ 패널별 편집  │       │ 순차 생성  │ │
│   │ 스타일선택 │       │              │       │ 다운로드   │ │
│   └───────────┘       └──────────────┘       └───────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1단계: 기획 (Concept)
- 스토리 아이디어 입력
- AI 시놉시스 정제 (선택)
- 장르 선택 (7종)
- 아트 스타일 선택 (6종)
- 캐릭터 레퍼런스 추가 (선택)

### 2단계: 콘티 (Storyboard)
- AI가 8컷 스토리보드 자동 생성
- 각 패널별 편집 가능
  - 장면 설명 (description)
  - 대사 (dialogue)
  - 나레이션 (caption)
  - 카메라 앵글

### 3단계: 제작 (Production)
- 패널별 이미지 순차 생성
- 이전 패널 참고하여 일관성 유지
- 실패 패널 재시도 가능
- ZIP/합본 이미지 다운로드

---

## 데이터 흐름

```
┌──────────────────────────────────────────────────────────────┐
│                         사용자 입력                           │
│                             │                                │
│                             ▼                                │
│                    ┌─────────────────┐                       │
│                    │  projectStore   │ ◄──── localStorage    │
│                    │   (Zustand)     │        동기화          │
│                    └────────┬────────┘                       │
│                             │                                │
│              ┌──────────────┼──────────────┐                │
│              ▼              ▼              ▼                │
│        ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│        │ Concept  │  │Storyboard│  │Production│            │
│        │Components│  │Components│  │Components│            │
│        └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│             │              │              │                  │
│             ▼              ▼              ▼                  │
│        ┌─────────────────────────────────────┐              │
│        │         geminiService.ts            │              │
│        │  (Google Gemini API 클라이언트)      │              │
│        └──────────────────┬──────────────────┘              │
│                           │                                  │
│                           ▼                                  │
│                  ┌─────────────────┐                        │
│                  │  Gemini API     │                        │
│                  │  (Google Cloud) │                        │
│                  └─────────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 핵심 타입

```typescript
// 앱 단계
enum AppStep {
  CONCEPT = 'CONCEPT',
  STORYBOARD = 'STORYBOARD',
  PRODUCTION = 'PRODUCTION',
  VIEWER = 'VIEWER'
}

// 장르 (7종)
enum Genre {
  ACTION, ROMANCE, SLICE_OF_LIFE,
  POLITICS, NOIR, HORROR, FANTASY
}

// 아트 스타일 (6종)
enum ArtStyle {
  REALISTIC, ANIME, CLAY,
  MINHWA, WEBTOON_STANDARD, SKETCH
}

// 패널 설정
interface PanelConfig {
  id: string;
  panelNumber: number;
  beatType?: BeatType;
  emotionalWeight?: number;
  description: string;      // 영문 프롬프트
  descriptionKo: string;    // 한글 설명
  dialogue: string;         // 대사
  caption: string;          // 나레이션
  characterFocus: string;
  cameraAngle: string;
  generatedImageUrl?: string;
  isGenerating?: boolean;
}

// 프로젝트 전체
interface WebtoonProject {
  title: string;
  synopsis: string;
  characterVisuals: string;
  genre: Genre;
  artStyle: ArtStyle;
  panels: PanelConfig[];
  characters: CharacterReference[];
  styleRef: StyleReference | null;
}
```

---

## 배포 구조

```
GitHub (lee98www/ai-webtoon-maker)
           │
           ▼
    Vercel (자동 배포)
           │
           ▼
  tooncraft-ai-studio.vercel.app
           │
           ▼
    사용자 브라우저
           │
           ├── localStorage (API 키, 프로젝트 데이터)
           │
           └── Gemini API (직접 호출)
```

- **정적 사이트**: 서버 없이 브라우저에서 직접 API 호출
- **API 키**: 사용자 본인 키 사용 (localStorage 저장)
- **자동 저장**: Zustand persist로 작업 자동 보존
