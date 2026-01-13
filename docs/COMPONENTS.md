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
    ├── Header (미니멀 헤더)
    │   └── ApiKeyModal (설정 시)
    │
    ├── StepIndicator (가로 스텝 표시)
    │
    ├── main (스텝별 전체화면 콘텐츠)
    │   │
    │   ├── [CONCEPT] → UnifiedConceptEditor
    │   │   ├── StoryPanel (좌측 - 아이디어 입력)
    │   │   │   └── textarea (h-48 고정 높이)
    │   │   └── SettingsPanel (우측 400px)
    │   │       ├── 장르 선택 (2x3 그리드)
    │   │       ├── 스타일 선택 (2x3 그리드)
    │   │       └── 고급 옵션 (캐릭터/스타일 레퍼런스)
    │   │
    │   ├── [STORYBOARD] → BlueprintStep
    │   │   ├── PanelGrid (좌측 - 4x2 그리드)
    │   │   └── PanelEditor (우측 400px)
    │   │
    │   └── [PRODUCTION] → RenderStep
    │       ├── WebtoonPreview (좌측 - 세로 스크롤)
    │       └── ControlPanel (우측 340px)
    │
    ├── StepFooter (이전/다음 + 진행 표시)
    │
    └── [Global]
        ├── ProgressBar
        └── Toast
```

---

## 레이아웃 컴포넌트

### WizardLayout

**위치**: `src/components/wizard/WizardLayout.tsx`

전체 마법사 레이아웃을 구성하는 최상위 컴포넌트. Full-Screen Step Flow 패턴.

```tsx
// 새로운 구조 (2026-01-13 재설계)
<div className="h-screen w-screen flex flex-col bg-slate-50">
  <Header />           {/* h-14 고정 */}
  <StepIndicator />    {/* h-20 고정 */}
  <main className="flex-1 min-h-0 overflow-auto">
    {StepComponent}    {/* 스텝별 전용 레이아웃 */}
  </main>
  <StepFooter />       {/* h-16 고정 */}
</div>
```

**핵심 CSS 패턴**:
- `h-screen flex flex-col` - 전체 화면 세로 배치
- `flex-1 min-h-0` - 남은 공간 채우기 + 스크롤 가능

### Header

**위치**: `src/components/layout/Header.tsx`

미니멀 헤더. 로고와 API 설정 버튼만 표시.

```tsx
<header className="h-14 border-b border-slate-200 bg-white">
  <Logo />              {/* ToonCraft AI Studio - 클릭 시 새 작품 시작 */}
  <ApiButton />         {/* API 키 변경 */}
</header>
```

**기능**:
- 로고 클릭 시 새 작품 시작 (작업 내용 있으면 확인 모달 표시)
- API 키 설정 모달 열기

### StepIndicator

**위치**: `src/components/layout/StepIndicator.tsx`

가로 스텝 네비게이션. 3단계 표시.

**구조**:
```
[1] ──── [2] ──── [3]
기획     콘티     제작
```

**색상 체계**:
- 완료: `bg-emerald-500`
- 현재: `bg-slate-900`
- 미완료: `bg-slate-200`

### StepFooter

**위치**: `src/components/layout/StepFooter.tsx`

하단 네비게이션. 이전/다음 버튼 + 진행 표시 (dot).

**구조**:
```tsx
<footer className="h-16 border-t border-slate-200 bg-white">
  <PreviousButton />
  <ProgressDots />     {/* emerald-500 완료, slate-900 현재 */}
  <NextButton />
</footer>
```

---

## 단계별 컴포넌트

### UnifiedConceptEditor (기획 단계)

**위치**: `src/components/concept/UnifiedConceptEditor.tsx`

기획 단계의 통합 에디터. 2컬럼 그리드 레이아웃.

**구조** (2026-01-13 재설계):
```
┌─────────────────────────────┬────────────────────┐
│                             │ 설정 헤더           │
│  StoryPanel                 ├────────────────────┤
│  - textarea (h-48 고정)      │ 장르 선택 (2x3)    │
│  - 글자수 표시               ├────────────────────┤
│  - AI 시놉시스 정제 버튼      │ 스타일 선택 (2x3)  │
│                             ├────────────────────┤
│  (생성된 시놉시스 표시)       │ 고급 옵션          │
│                             │ - 캐릭터 설정 →    │
│                             │ - 스타일 레퍼런스 → │
│                             ├────────────────────┤
│                             │ 설정 요약          │
└─────────────────────────────┴────────────────────┘
```

**핵심 CSS**:
```tsx
<div className="h-full min-h-0 flex flex-col">
  <div className="flex-1 min-h-0 grid grid-cols-[1fr_400px]">
    <div className="min-h-0 overflow-auto">
      <StoryPanel />
    </div>
    <div className="min-h-0 overflow-auto border-l">
      <SettingsPanel />
    </div>
  </div>
</div>
```

**하위 컴포넌트**:

| 컴포넌트 | 역할 |
|---------|------|
| `StoryPanel` | 스토리 입력 (textarea h-48) |
| `SettingsPanel` | 장르/스타일/고급 옵션 |
| `CharacterModal` | 캐릭터 설정 모달 |
| `StyleRefModal` | 스타일 레퍼런스 모달 |

### BlueprintStep (콘티 단계)

**위치**: `src/components/steps/storyboard/BlueprintStep.tsx`

8컷 스토리보드 생성 및 편집. 4x2 그리드 + 우측 편집 패널.

**구조** (2026-01-13 재설계):
```
┌────────────────────────────────────┬─────────────────┐
│ 패널 구성 헤더        [다시 생성]   │ 패널 N          │
├────────────────────────────────────┤ ┌─────────────┐ │
│ ┌─────┬─────┬─────┬─────┐         │ │ 비주얼 설명  │ │
│ │  1  │  2  │  3  │  4  │         │ ├─────────────┤ │
│ ├─────┼─────┼─────┼─────┤         │ │ 샷 크기     │ │
│ │  5  │  6  │  7  │  8  │         │ ├─────────────┤ │
│ └─────┴─────┴─────┴─────┘         │ │ 카메라 앵글  │ │
│                                    │ ├─────────────┤ │
│  (4x2 그리드 - 클릭하여 선택)       │ │ 대사        │ │
│                                    │ │ 나레이션    │ │
│                                    │ └─────────────┘ │
│                                    │ [이전] N/8 [다음] │
└────────────────────────────────────┴─────────────────┘
```

**상태** (from store):
- `project.panels: PanelConfig[]`
- `selectedPanelIndex: number | null` (로컬)

### RenderStep (제작 단계)

**위치**: `src/components/steps/production/RenderStep.tsx`

이미지 렌더링 및 다운로드. 세로 웹툰 프리뷰 + 우측 컨트롤.

**구조** (2026-01-13 재설계):
```
┌─────────────────────────────┬──────────────────┐
│ 웹툰 미리보기     완료: 3/8  │ 렌더링 설정 헤더  │
├─────────────────────────────┤──────────────────┤
│  ┌─────────────────────┐    │ 생성 모드        │
│  │ 제목 카드           │    │ [순차] [병렬]    │
│  └─────────────────────┘    ├──────────────────┤
│  ┌─────────────────────┐    │ 진행 상황        │
│  │ 패널 1 (3:4 비율)   │    │ ████░░░░ 37%    │
│  └─────────────────────┘    │ 3/8 패널         │
│  ┌─────────────────────┐    ├──────────────────┤
│  │ 패널 2 (생성 중...)  │    │ [모든 패널 렌더링]│
│  └─────────────────────┘    ├──────────────────┤
│  ...                        │ 팁              │
│  ┌─────────────────────┐    │ • 순차 모드...   │
│  │ To be continued...  │    │                  │
│  └─────────────────────┘    ├──────────────────┤
│                             │ [웹툰 내보내기]   │
└─────────────────────────────┴──────────────────┘
```

**훅 사용**:
- `useSequentialGeneration()` - 순차/병렬 이미지 생성

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

### ConfirmModal

**위치**: `src/components/ui/ConfirmModal.tsx`

재사용 가능한 확인 모달 컴포넌트.

**Props**:
```tsx
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;    // 기본값: "확인"
  cancelText?: string;     // 기본값: "취소"
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';  // 기본값: "warning"
}
```

**색상 테마**:
- `danger`: 빨간색 (삭제 등 위험 작업)
- `warning`: 주황색 (주의 필요)
- `info`: 파란색 (정보성 확인)

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
