# ToonCraft AI Studio - 개발 지침

> Claude Code가 이 프로젝트 작업 시 따라야 할 규칙

## 프로젝트 개요

AI 기반 웹툰 자동 생성 플랫폼
- **3단계 워크플로우**: 기획(Concept) → 콘티(Storyboard) → 제작(Production)
- **배포 URL**: https://tooncraft-ai-studio.vercel.app
- **GitHub**: https://github.com/lee98www/ai-webtoon-maker

---

## 문서 업데이트 규칙

### 필수: 작업 완료 시 문서 갱신

| 작업 유형 | 업데이트할 문서 |
|----------|----------------|
| 새 파일 생성 | `docs/ARCHITECTURE.md` 디렉토리 구조 |
| 컴포넌트 추가/수정 | `docs/COMPONENTS.md` |
| 상태 관리 변경 | `docs/STATE.md` |
| API 함수 추가/수정 | `docs/API.md` |
| 프롬프트 변경 | `docs/PROMPTS.md` |
| **모든 작업 완료 시** | `docs/CHANGELOG.md` |

### 문서 갱신 체크리스트

작업 완료 전 반드시 확인:
- [ ] 새로 생성한 파일이 `ARCHITECTURE.md`에 반영됨
- [ ] 수정한 컴포넌트가 `COMPONENTS.md`에 반영됨
- [ ] API 변경이 `API.md`에 반영됨
- [ ] `CHANGELOG.md`에 오늘 작업 내역 추가됨

---

## 파일 구조

```
tooncraft-ai-studio/
├── App.tsx                    # 메인 앱 (API 키 체크, 라우팅)
├── types.ts                   # 전역 타입 정의
├── constants.ts               # 장르/스타일 상수
├── index.tsx                  # React 엔트리포인트
│
├── src/
│   ├── components/
│   │   ├── wizard/            # 마법사 프레임워크
│   │   │   ├── WizardLayout.tsx
│   │   │   ├── ContentArea.tsx
│   │   │   └── PreviewPanel.tsx
│   │   │
│   │   ├── concept/           # 기획 단계
│   │   │   └── UnifiedConceptEditor.tsx
│   │   │
│   │   ├── steps/             # 각 단계 컴포넌트
│   │   │   ├── storyboard/BlueprintStep.tsx
│   │   │   └── production/RenderStep.tsx
│   │   │
│   │   ├── layout/            # 레이아웃
│   │   │   ├── Navigation.tsx
│   │   │   └── StepFooter.tsx
│   │   │
│   │   ├── ui/                # 공통 UI
│   │   │   ├── Toast.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   └── ApiKeyModal.tsx    # API 키 입력 모달
│   │
│   ├── store/
│   │   └── projectStore.ts    # Zustand 상태 관리
│   │
│   └── hooks/
│       └── useSequentialGeneration.ts
│
├── services/
│   └── geminiService.ts       # Gemini API 클라이언트
│
├── components/                # 레거시
│   ├── WebtoonViewer.tsx
│   └── Button.tsx
│
├── server/                    # 백엔드 (현재 미사용)
│   └── index.ts
│
└── docs/                      # 문서
    ├── ARCHITECTURE.md
    ├── COMPONENTS.md
    ├── STATE.md
    ├── API.md
    ├── PROMPTS.md
    └── CHANGELOG.md
```

---

## 핵심 파일 Quick Reference

| 파일 | 역할 | 수정 시 주의사항 |
|------|------|-----------------|
| `types.ts` | 모든 타입 정의 | 타입 변경 시 영향 범위 넓음 |
| `constants.ts` | 장르/스타일 상수 | 프롬프트에 직접 영향 |
| `projectStore.ts` | 전역 상태 | localStorage 직렬화 주의 |
| `geminiService.ts` | API 호출 | 에러 처리 패턴 유지 |
| `WizardLayout.tsx` | 전체 레이아웃 | 단계 전환 로직 |

---

## 코딩 컨벤션

### 네이밍
- 컴포넌트: `PascalCase` (예: `ApiKeyModal.tsx`)
- 함수/변수: `camelCase` (예: `handleSubmit`)
- 상수: `UPPER_SNAKE_CASE` (예: `API_KEY_STORAGE_KEY`)
- 타입/인터페이스: `PascalCase` (예: `PanelConfig`)

### 파일명
- 컴포넌트: `PascalCase.tsx`
- 유틸/서비스: `camelCase.ts`
- 상수: `camelCase.ts`

### 컴포넌트 구조
```tsx
// 1. imports
import React from 'react';

// 2. types (필요시)
interface Props { }

// 3. component
export const ComponentName: React.FC<Props> = ({ }) => {
  // hooks
  // handlers
  // render
};

// 4. export default (필요시)
export default ComponentName;
```

---

## 커밋 메시지 규칙

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 업데이트
refactor: 리팩토링
style: 코드 포맷팅
chore: 빌드/설정 변경
```

예시:
```
feat: Add character reference system
fix: Resolve panel image generation timeout
docs: Update API documentation
```

---

## 주요 워크플로우

### 1. 기획 단계 (Concept)
```
사용자 입력 → refineSynopsis() → 시놉시스 생성
           → 장르/스타일 선택
           → 캐릭터 레퍼런스 추가 (선택)
```

### 2. 콘티 단계 (Storyboard)
```
시놉시스 → generateStoryboard() → 8컷 패널 생성
        → 각 패널 편집 가능
```

### 3. 제작 단계 (Production)
```
패널 목록 → generatePanelImage() (순차) → 이미지 생성
         → 이전 패널 참고하여 일관성 유지
```

---

## API 키 관리

- 저장 위치: `localStorage['gemini-api-key']`
- 검증: Google API models 엔드포인트 호출
- 보안: 서버 전송 없음, 브라우저에만 저장

---

## 자주 사용하는 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 배포 (Vercel)
npx vercel --prod

# Git
git add -A && git commit -m "message" && git push
```

---

## 문서 위치

| 문서 | 내용 |
|------|------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 전체 구조, 데이터 흐름 |
| [COMPONENTS.md](docs/COMPONENTS.md) | 컴포넌트 계층, Props |
| [STATE.md](docs/STATE.md) | Zustand 스토어, 액션 |
| [API.md](docs/API.md) | API 함수, 에러 코드 |
| [PROMPTS.md](docs/PROMPTS.md) | AI 프롬프트 시스템 |
| [CHANGELOG.md](docs/CHANGELOG.md) | 변경 이력 |
