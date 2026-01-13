# 상태 관리 (Zustand)

## 개요

**Zustand**를 사용한 전역 상태 관리.
- 파일: `src/store/projectStore.ts`
- 영속화: `localStorage` (persist middleware)
- 키: `tooncraft-project`

---

## 상태 구조

```typescript
interface ProjectState {
  // 앱 단계
  step: AppStep;

  // 프로젝트 데이터
  project: WebtoonProject;

  // 마법사 상태
  wizard: WizardState;

  // 입력 상태
  ideaInput: string;

  // 로딩 상태
  isRefining: boolean;
  isProcessing: boolean;

  // API 키 상태 (레거시)
  hasApiKey: boolean;

  // 에러/진행도
  error: ErrorMessage | null;
  progress: ProgressInfo | null;

  // UI 상태
  expandedPanels: Set<number>;

  // 액션들...
}
```

---

## 핵심 타입

### WebtoonProject

```typescript
interface WebtoonProject {
  title: string;                    // 작품 제목
  synopsis: string;                 // 시놉시스
  characterVisuals: string;         // 캐릭터 비주얼 설명 (텍스트)
  genre: Genre;                     // 선택된 장르
  artStyle: ArtStyle;               // 선택된 스타일
  panels: PanelConfig[];            // 패널 목록
  characters: CharacterReference[]; // 캐릭터 레퍼런스
  styleRef: StyleReference | null;  // 스타일 레퍼런스
}
```

### WizardState

```typescript
interface WizardState {
  currentStepId: WizardStepId;      // 현재 단계 ID
  completedSteps: Set<WizardStepId>; // 완료된 단계들
  skippedSteps: Set<WizardStepId>;   // 건너뛴 단계들
  visitedSteps: Set<WizardStepId>;   // 방문한 단계들
}
```

### PanelConfig

```typescript
interface PanelConfig {
  id: string;
  panelNumber: number;
  beatType?: BeatType;
  emotionalWeight?: number;
  description: string;       // 영문 프롬프트
  descriptionKo: string;     // 한글 설명
  dialogue: string;          // 대사
  caption: string;           // 나레이션
  characterFocus: string;
  cameraAngle: string;
  generatedImageUrl?: string;
  isGenerating?: boolean;
}
```

---

## 액션 목록

### 네비게이션

| 액션 | 설명 | 사용처 |
|------|------|-------|
| `setStep(step)` | 앱 단계 변경 | Navigation |
| `setCurrentStep(stepId)` | 마법사 단계 변경 | StepFooter |
| `goToNextStep()` | 다음 단계로 이동 | StepFooter |
| `goToPreviousStep()` | 이전 단계로 이동 | StepFooter |

### 프로젝트 관리

| 액션 | 설명 | 사용처 |
|------|------|-------|
| `setProject(updates)` | 프로젝트 부분 업데이트 | 전역 |
| `updatePanel(id, updates)` | ID로 패널 업데이트 | BlueprintStep |
| `updatePanelByIndex(idx, updates)` | 인덱스로 패널 업데이트 | RenderStep |

### 입력/상태

| 액션 | 설명 | 사용처 |
|------|------|-------|
| `setIdeaInput(input)` | 아이디어 입력 설정 | IdeaInput |
| `setIsRefining(bool)` | AI 정제 상태 | UnifiedConcept |
| `setIsProcessing(bool)` | 처리 중 상태 | 전역 |

### 캐릭터/스타일

| 액션 | 설명 | 사용처 |
|------|------|-------|
| `addCharacter(char)` | 캐릭터 추가 | CharacterManager |
| `updateCharacter(id, updates)` | 캐릭터 수정 | CharacterManager |
| `removeCharacter(id)` | 캐릭터 삭제 | CharacterManager |
| `setStyleRef(ref)` | 스타일 레퍼런스 설정 | StyleReference |

### 마법사 단계

| 액션 | 설명 | 사용처 |
|------|------|-------|
| `markStepComplete(stepId)` | 단계 완료 표시 | StepFooter |
| `markStepSkipped(stepId)` | 단계 건너뛰기 | StepFooter |

### 에러/진행도

| 액션 | 설명 | 사용처 |
|------|------|-------|
| `setError(error)` | 에러 설정 | 전역 |
| `clearError()` | 에러 초기화 | Toast |
| `setProgress(progress)` | 진행도 설정 | RenderStep |

### UI

| 액션 | 설명 | 사용처 |
|------|------|-------|
| `togglePanelExpand(idx)` | 패널 확장/축소 토글 | BlueprintStep |
| `setExpandedPanels(set)` | 확장 패널 설정 | BlueprintStep |

---

## 셀렉터/헬퍼 함수

### canGoToStep

```typescript
export function canGoToStep(targetStep: AppStep, project: WebtoonProject): boolean
```

특정 단계로 이동 가능한지 확인.

**조건**:
- CONCEPT: 항상 가능
- STORYBOARD: 장르, 스타일 선택됨
- PRODUCTION: 패널이 1개 이상 있음
- VIEWER: 생성된 이미지가 1개 이상 있음

### isStepComplete

```typescript
isStepComplete(stepId: WizardStepId): boolean
```

특정 단계가 완료되었는지 확인.

### canGoToWizardStep

```typescript
canGoToWizardStep(stepId: WizardStepId): boolean
```

특정 마법사 단계로 이동 가능한지 확인.

---

## localStorage 영속화

### 설정

```typescript
export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'tooncraft-project',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        project: state.project,
        ideaInput: state.ideaInput,
        wizard: {
          currentStepId: state.wizard.currentStepId,
          completedSteps: setToArray(state.wizard.completedSteps),
          skippedSteps: setToArray(state.wizard.skippedSteps),
          visitedSteps: setToArray(state.wizard.visitedSteps),
        },
        expandedPanels: setToArray(state.expandedPanels),
      }),
      onRehydrateStorage: () => (state) => {
        // Set 복원 로직
      },
    }
  )
);
```

### Set 직렬화

JSON은 Set을 지원하지 않으므로 Array로 변환:

```typescript
// 저장 시: Set → Array
const setToArray = <T>(set: Set<T>): T[] => [...set];

// 복원 시: Array → Set
const arrayToSet = <T>(arr: T[]): Set<T> => new Set(arr);
```

### 저장되는 데이터

| 필드 | 타입 | 설명 |
|------|------|------|
| step | AppStep | 현재 앱 단계 |
| project | WebtoonProject | 전체 프로젝트 데이터 |
| ideaInput | string | 아이디어 입력 텍스트 |
| wizard | object | 마법사 상태 (Set→Array) |
| expandedPanels | number[] | 확장된 패널 인덱스 |

### 저장되지 않는 데이터

- `isRefining`, `isProcessing` - 로딩 상태
- `error`, `progress` - 일시적 UI 상태
- `hasApiKey` - 별도 localStorage 키 사용

---

## 사용 예시

### 컴포넌트에서 사용

```tsx
import { useProjectStore } from '../../store/projectStore';

const MyComponent: React.FC = () => {
  // 상태 읽기
  const { project, step, ideaInput } = useProjectStore();

  // 액션 가져오기
  const { setProject, setIdeaInput, goToNextStep } = useProjectStore();

  // 사용
  const handleSubmit = () => {
    setProject({ synopsis: '새 시놉시스' });
    goToNextStep();
  };

  return <div>...</div>;
};
```

### 조건부 렌더링

```tsx
const { step } = useProjectStore();

if (step === AppStep.CONCEPT) {
  return <ConceptEditor />;
} else if (step === AppStep.STORYBOARD) {
  return <StoryboardEditor />;
}
```

### 네비게이션 가드

```tsx
import { canGoToStep } from '../../store/projectStore';

const { project } = useProjectStore();

const handleNavigate = (targetStep: AppStep) => {
  if (canGoToStep(targetStep, project)) {
    setStep(targetStep);
  }
};
```

---

## 상태 초기값

```typescript
const initialProject: WebtoonProject = {
  title: '',
  synopsis: '',
  characterVisuals: '',
  genre: Genre.ACTION,
  artStyle: ArtStyle.WEBTOON_STANDARD,
  panels: [],
  characters: [],
  styleRef: null,
};

const initialWizard: WizardState = {
  currentStepId: 'concept',
  completedSteps: new Set(),
  skippedSteps: new Set(),
  visitedSteps: new Set(['concept']),
};
```

---

## 디버깅

브라우저 콘솔에서 상태 확인:

```javascript
// localStorage 직접 확인
JSON.parse(localStorage.getItem('tooncraft-project'))

// Zustand 상태 확인 (React DevTools 필요)
// 또는 window에 노출 시
window.__ZUSTAND_STORE__?.getState()
```
