# 변경 이력 (Changelog)

모든 주요 변경사항을 기록합니다.

형식: `## [날짜] 변경 제목`

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
