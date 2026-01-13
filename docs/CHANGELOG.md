# 변경 이력 (Changelog)

모든 주요 변경사항을 기록합니다.

형식: `## [날짜] 변경 제목`

---

## [2026-01-13] 웹툰 뷰어 접근성 개선 및 새 작품 시작 기능

### 추가
- `src/components/ui/ConfirmModal.tsx` - 재사용 가능한 확인 모달 컴포넌트
  - 3가지 색상 테마 (danger, warning, info)
  - 앱 디자인에 맞는 커스텀 스타일

### 변경
- `src/components/steps/production/RenderStep.tsx`
  - "웹툰 내보내기" 버튼에 onClick 핸들러 연결
  - 클릭 시 WebtoonViewer로 이동 (AppStep.VIEWER)
  - 뷰어에서 ZIP/합본 이미지 다운로드 안내 텍스트 추가

- `src/components/layout/Header.tsx`
  - 로고 클릭 시 새 작품 시작 기능 추가
  - 작업 내용이 있으면 확인 모달 표시
  - 확인 시 resetProject() 호출하여 초기화

### 수정
- 다운로드 버튼이 작동하지 않던 문제 해결 (WebtoonViewer로 연결)

### 관련 파일
- `src/components/ui/ConfirmModal.tsx` (신규)
- `src/components/steps/production/RenderStep.tsx`
- `src/components/layout/Header.tsx`

---

## [2026-01-13] 프롬프트 파이프라인 완전 재설계 - "한 순간 + 창작 자유"

### 문제
- 기존: 8컷 = 기승전결 (hook → setup → climax → cliffhanger)
- 고정 템플릿으로 인한 연출 단조로움
- 매번 동일한 구조 생성

### 변경

**핵심 원칙 변경**:
- "8컷 = 완전한 이야기" → "8컷 = 한 순간의 하이라이트 (0.5초~3초)"
- 고정 템플릿 제거 → AI 완전 창작 자유

**`services/geminiService.ts` 수정**:
- `refineSynopsis()`: 기승전결 → 단일 하이라이트 순간 선택
- `generateStoryboard()`: 8컷 분해법 템플릿 제거, 창작 가이드라인만 제공

**새 프롬프트 원칙**:
```
[완전한 창작 자유]
8컷의 구성, 순서, 앵글, 샷 크기를 자유롭게 창작하라.
고정 템플릿 없음. 이 순간에 가장 효과적인 시각적 전개를 창작하라.

[연출 가이드라인]
- 리듬 변화: 빠른/느린 전환의 대비
- 스케일 변화: 와이드↔클로즈업 전환으로 긴장감 조절
- 연속 3컷 동일 앵글/샷 크기 금지
- 매 생성마다 다른 구성을 시도하라
```

### 관련 파일
- `services/geminiService.ts` (라인 137-249)

---

## [2026-01-13] 전체 레이아웃 재설계 (Full-Screen Step Flow)

### 문제
- 기존 3컬럼 레이아웃 (사이드바 + 콘텐츠 + 프리뷰) 구조적 한계
- 스크롤 동작 불능 (배포 환경)
- 색상 불일치 (accent-500 등 미정의 색상 사용)

### 변경

**레이아웃 구조 변경**:
- 3컬럼 레이아웃 → 단일 전체 화면 스텝 플로우
- `WizardLayout.tsx` 완전 재작성
  - 새 구조: Header + StepIndicator + Main + StepFooter
  - `h-screen flex flex-col` 기반 단일 컬럼

**새 레이아웃 컴포넌트 생성**:
- `src/components/layout/Header.tsx` - 미니멀 헤더 (로고 + API 버튼)
- `src/components/layout/StepIndicator.tsx` - 가로 스텝 네비게이션
- `src/components/layout/StepFooter.tsx` - 이전/다음 버튼 + 진행 표시

**스텝별 레이아웃 재설계**:
- `UnifiedConceptEditor.tsx` - 2컬럼 레이아웃 (스토리 | 설정)
  - textarea `flex-1` → `h-48` 고정 높이 (스크롤 수정)
- `BlueprintStep.tsx` - 4x2 그리드 뷰 + 우측 편집 패널
- `RenderStep.tsx` - 세로 웹툰 프리뷰 + 우측 컨트롤

**색상 체계 통일**:
- `accent-500` → `emerald-500` (완료 상태)
- `blue-400` → `slate-400` (생성 중 상태)
- 전체 색상: **slate** (기본), **emerald** (완료), **red** (에러)

### 관련 파일
- `src/components/wizard/WizardLayout.tsx`
- `src/components/layout/Header.tsx` (신규)
- `src/components/layout/StepIndicator.tsx` (신규)
- `src/components/layout/StepFooter.tsx` (신규)
- `src/components/concept/UnifiedConceptEditor.tsx`
- `src/components/steps/storyboard/BlueprintStep.tsx`
- `src/components/steps/production/RenderStep.tsx`

### 새 레이아웃 구조
```
┌──────────────────────────────────────┐
│  ToonCraft                    [API]  │  ← Header (h-14)
├──────────────────────────────────────┤
│      [1] ──── [2] ──── [3]           │  ← StepIndicator (h-20)
├──────────────────────────────────────┤
│                                      │
│       [ 전체 화면 작업 공간 ]         │  ← main (flex-1)
│       (스텝별 전용 레이아웃)          │
│                                      │
├──────────────────────────────────────┤
│            [이전]  [다음]             │  ← StepFooter (h-16)
└──────────────────────────────────────┘
```

---

## [2026-01-13] 카메라 앵글 창의적 연출 시스템

### 문제
- 패널 콘티 생성 시 카메라 앵글이 항상 "클로즈업"으로 고정
- 연출 다양성 없음, 죽은 연출

### 변경
- `services/geminiService.ts` - generateStoryboard 프롬프트 전면 개편
  - AI에게 "영화 감독급 연출가" 역할 부여
  - 샷 크기 8종 + 카메라 앵글 8종 명시
  - 장르별 선호 스타일 가이드
  - "연속 3컷 동일 앵글 금지" 규칙
  - 연출 의도(directorNote) 필드 추가

- `types.ts` - PanelConfig 타입 확장
  - `shotSize`: 샷 크기 (wide, medium, close_up 등)
  - `composition`: 구도 설명
  - `directorNote`: 연출 의도 (한국어)

- `src/components/steps/storyboard/BlueprintStep.tsx` - UI 개선
  - 패널 카드에 샷 크기/앵글 배지 표시
  - 편집 패널에 연출 의도 박스 추가
  - 샷 크기 드롭다운 추가
  - 카메라 앵글 드롭다운 옵션 확장

### 관련 파일
- `services/geminiService.ts` (라인 172-243)
- `types.ts` (라인 165-168)
- `src/components/steps/storyboard/BlueprintStep.tsx`

---

## [2026-01-13] 시스템 문서 추가

### 추가
- `CLAUDE.md` - AI 개발 지침서 (루트)
- `docs/ARCHITECTURE.md` - 아키텍처 개요
- `docs/COMPONENTS.md` - 컴포넌트 가이드
- `docs/STATE.md` - 상태 관리 문서
- `docs/API.md` - API 레퍼런스
- `docs/PROMPTS.md` - AI 프롬프트 시스템
- `docs/CHANGELOG.md` - 변경 이력 (현재 파일)

### 목적
- 추후 개발 시 맥락 파악 용이
- 파일 위치 및 역할 문서화
- 작업 완료 시 자동 문서 업데이트 규칙 수립

---

## [2026-01-13] 클라이언트 직접 API 호출 전환

### 변경
- `services/geminiService.ts` - 백엔드 프록시 → 브라우저 직접 호출
- `App.tsx` - API 키 체크 로직 변경
- `src/components/layout/Navigation.tsx` - API Key 변경 버튼 추가

### 추가
- `src/components/ApiKeyModal.tsx` - API 키 입력 모달
- `@google/generative-ai` 패키지

### 제거
- 백엔드 서버 의존성 (배포 시)

### 이유
- Vercel 정적 배포 지원
- 사용자 본인 API 키 사용
- 서버 비용 절감

---

## [2026-01-13] 웹툰 내보내기 기능

### 추가
- `components/WebtoonViewer.tsx`
  - ZIP 다운로드 (jszip)
  - 합본 이미지 다운로드 (Canvas API)

### 패키지
- `jszip` 추가

---

## [2026-01-13] 자동 저장 기능

### 변경
- `src/store/projectStore.ts` - Zustand persist middleware 추가

### 기능
- localStorage 자동 저장
- 새로고침 후 작업 복원
- Set 직렬화 처리 (Set ↔ Array)

---

## [2026-01-13] 초기 커밋

### 추가
- React + TypeScript 기반 웹툰 생성 앱
- 3단계 마법사 UI (기획 → 콘티 → 제작)
- Gemini API 연동
- 8컷 스토리보드 자동 생성
- 패널별 이미지 생성

### 배포
- GitHub: `lee98www/ai-webtoon-maker`
- Vercel: `tooncraft-ai-studio.vercel.app`

---

## 템플릿

새 변경사항 기록 시 아래 형식 사용:

```markdown
## [YYYY-MM-DD] 변경 제목

### 추가
- 새로 추가된 파일/기능

### 변경
- 수정된 파일/기능

### 수정
- 버그 수정

### 제거
- 삭제된 파일/기능

### 관련 파일
- `경로/파일명.tsx`
```
