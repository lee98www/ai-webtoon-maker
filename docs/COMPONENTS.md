# 컴포넌트 가이드

## 컴포넌트 계층 구조

```
App.tsx
│
├── [API 키 없음] → ApiKeyModal
│
├── [VIEWER 모드] → WebtoonViewer
│
└── [일반 모드] → WizardLayout
    │
    ├── Navigation (상단 네비게이션)
    │   └── ApiKeyModal (설정 시)
    │
    ├── StepIndicator (단계 표시)
    │
    ├── ContentArea (현재 단계 콘텐츠)
    │   │
    │   ├── [CONCEPT] → UnifiedConceptEditor
    │   │   ├── StoryPanel (좌측 70%)
    │   │   │   └── 아이디어 입력, 시놉시스 생성
    │   │   └── SidePanel (우측 30%)
    │   │       ├── GenreSelector
    │   │       ├── StyleSelector
    │   │       ├── CharacterManager
    │   │       └── StyleReference
    │   │
    │   ├── [STORYBOARD] → BlueprintStep
    │   │   ├── 스토리보드 생성 버튼
    │   │   └── 패널 목록 (편집 가능)
    │   │
    │   └── [PRODUCTION] → RenderStep
    │       ├── 웹툰 미리보기 (좌측)
    │       └── 제어 패널 (우측)
    │
    ├── StepFooter (하단 네비게이션)
    │
    └── [Global]
        ├── ProgressBar
        └── Toast
```

---

## 레이아웃 컴포넌트

### WizardLayout

**위치**: `src/components/wizard/WizardLayout.tsx`

전체 마법사 레이아웃을 구성하는 최상위 컴포넌트.

```tsx
<WizardLayout>
  <Header />
  <StepIndicator />
  <ContentArea />
  <StepFooter />
</WizardLayout>
```

### Navigation

**위치**: `src/components/layout/Navigation.tsx`

상단 네비게이션 바.

**기능**:
- 로고 표시
- API Key 변경 버튼
- Load/Save Project 버튼
- 단계 네비게이션 (01, 02, 03)

**상태**:
- `showApiKeyModal: boolean` - API 키 모달 표시 여부

### StepFooter

**위치**: `src/components/layout/StepFooter.tsx`

하단 네비게이션 버튼.

**Props**:
```tsx
interface StepFooterProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  showSkip?: boolean;
}
```

---

## 단계별 컴포넌트

### UnifiedConceptEditor (기획 단계)

**위치**: `src/components/concept/UnifiedConceptEditor.tsx`

기획 단계의 통합 에디터. 좌우 분할 레이아웃.

**구조**:
```
┌─────────────────────┬───────────────┐
│                     │ GenreSelector │
│   StoryPanel        ├───────────────┤
│   (아이디어 입력)    │ StyleSelector │
│                     ├───────────────┤
│   [AI 시놉시스 생성] │ CharacterMgr  │
│                     ├───────────────┤
│                     │ StyleRef      │
└─────────────────────┴───────────────┘
```

**하위 컴포넌트**:

| 컴포넌트 | 역할 |
|---------|------|
| `IdeaInput` | 텍스트 입력 영역 |
| `GenreSelector` | 7개 장르 카드 선택 |
| `StyleSelector` | 6개 스타일 카드 선택 |
| `CharacterManager` | 캐릭터 레퍼런스 관리 |
| `StyleReference` | 스타일 레퍼런스 설정 |

### BlueprintStep (콘티 단계)

**위치**: `src/components/steps/storyboard/BlueprintStep.tsx`

8컷 스토리보드 생성 및 편집.

**기능**:
- "스토리보드 생성하기" 버튼
- 패널 목록 표시 (확장/축소)
- 각 패널 편집 (description, dialogue, caption)

**상태** (from store):
- `project.panels: PanelConfig[]`
- `expandedPanels: Set<number>`

### RenderStep (제작 단계)

**위치**: `src/components/steps/production/RenderStep.tsx`

이미지 렌더링 및 다운로드.

**구조**:
```
┌─────────────────┬──────────────┐
│                 │              │
│  웹툰 미리보기   │  제어 패널    │
│  (세로 스크롤)   │              │
│                 │  [생성 시작]  │
│  - 패널 1       │  진행률: 3/8  │
│  - 패널 2       │  예상: 2분    │
│  - ...          │              │
│                 │  [재시도]     │
│                 │              │
└─────────────────┴──────────────┘
```

**훅 사용**:
- `useSequentialGeneration()` - 순차 이미지 생성

---

## UI 컴포넌트

### ApiKeyModal

**위치**: `src/components/ApiKeyModal.tsx`

API 키 입력 모달.

**Props**:
```tsx
interface ApiKeyModalProps {
  onApiKeySet: (key: string) => void;
  onClose?: () => void;
  isChanging?: boolean;  // true면 닫기 버튼 표시
}
```

**내보내기**:
```tsx
export const ApiKeyModal: React.FC<ApiKeyModalProps>
export const getStoredApiKey: () => string | null
export const clearStoredApiKey: () => void
```

### Toast

**위치**: `src/components/ui/Toast.tsx`

알림 토스트 메시지.

**스토어 연동**:
```tsx
const { error, clearError } = useProjectStore();
```

**자동 닫힘**: 5초 후

### ProgressBar

**위치**: `src/components/ui/ProgressBar.tsx`

전역 진행률 표시 바.

**스토어 연동**:
```tsx
const { progress } = useProjectStore();
// progress: { current: number, total: number, message: string }
```

### Button

**위치**: `components/Button.tsx`

공통 버튼 컴포넌트.

**Props**:
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'toon' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

---

## 레퍼런스 컴포넌트

### CharacterManager

**위치**: `src/components/reference/CharacterManager.tsx`

캐릭터 레퍼런스 관리.

**기능**:
- 캐릭터 추가/편집/삭제
- AI 캐릭터 시트 생성
- 이미지 업로드

**데이터 구조**:
```tsx
interface CharacterReference {
  id: string;
  name: string;
  role: 'protagonist' | 'supporting' | 'antagonist';
  description: string;
  referenceImages: string[];  // Base64
  extractedFeatures?: string;
}
```

### StyleReference

**위치**: `src/components/reference/StyleReference.tsx`

스타일 레퍼런스 설정.

**기능**:
- 스타일 키워드 선택
- 샘플 씬 입력
- AI 스타일 레퍼런스 생성

---

## 뷰어 컴포넌트

### WebtoonViewer

**위치**: `components/WebtoonViewer.tsx`

완성된 웹툰 뷰어.

**Props**:
```tsx
interface WebtoonViewerProps {
  project: WebtoonProject;
  onEdit: () => void;
}
```

**기능**:
- 세로 스크롤 뷰
- 패널 이미지 표시
- ZIP 다운로드
- 합본 이미지 다운로드
- 편집 모드로 돌아가기

---

## 컴포넌트 생성 가이드

새 컴포넌트 추가 시:

1. **위치 결정**:
   - 단계 관련 → `src/components/steps/[phase]/`
   - 레이아웃 → `src/components/layout/`
   - 공통 UI → `src/components/ui/`

2. **파일 생성**:
   ```tsx
   // src/components/[category]/NewComponent.tsx
   import React from 'react';

   interface NewComponentProps {
     // props 정의
   }

   export const NewComponent: React.FC<NewComponentProps> = ({}) => {
     return (
       <div>
         {/* 컴포넌트 내용 */}
       </div>
     );
   };
   ```

3. **문서 업데이트**:
   - 이 파일(COMPONENTS.md)에 컴포넌트 추가
   - Props 인터페이스 문서화
