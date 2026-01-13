# ToonCraft AI Studio

AI 기반 웹툰 자동 생성 플랫폼

**배포 URL**: https://tooncraft-ai-studio.vercel.app

---

## 소개

ToonCraft AI Studio는 스토리 아이디어만 입력하면 AI가 자동으로 웹툰을 생성해주는 플랫폼입니다.

### 주요 기능

- **AI 시놉시스 정제**: 아이디어를 상업적 시놉시스로 변환
- **8컷 스토리보드 자동 생성**: 기승전결 구조의 콘티 생성
- **AI 이미지 생성**: 각 패널별 웹툰 이미지 생성
- **캐릭터 일관성**: 레퍼런스 이미지로 캐릭터 일관성 유지
- **다양한 스타일**: 6가지 아트 스타일 지원
- **7가지 장르**: 액션, 로맨스, 일상, 정치, 느와르, 공포, 판타지
- **웹툰 내보내기**: ZIP 다운로드, 합본 이미지

---

## 시작하기

### 온라인 사용

1. https://tooncraft-ai-studio.vercel.app 접속
2. Google AI Studio에서 Gemini API 키 발급
3. API 키 입력 후 사용 시작

### 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

---

## 사용 방법

### 1단계: 기획 (Concept)

1. 스토리 아이디어 입력
2. "AI 시놉시스 생성" 클릭 (선택)
3. 장르 선택 (7종)
4. 아트 스타일 선택 (6종)
5. 캐릭터 레퍼런스 추가 (선택)

### 2단계: 콘티 (Storyboard)

1. "스토리보드 생성" 클릭
2. 8컷 콘티 자동 생성
3. 각 패널 편집 (장면 설명, 대사, 나레이션)

### 3단계: 제작 (Production)

1. "이미지 생성 시작" 클릭
2. 패널별 순차 생성
3. 실패 시 재시도 가능
4. 완성 후 다운로드

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 18, TypeScript |
| 상태관리 | Zustand |
| 스타일링 | Tailwind CSS |
| 빌드 | Vite |
| AI | Google Gemini API |
| 배포 | Vercel |

---

## 문서

| 문서 | 내용 |
|------|------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 프로젝트 구조, 데이터 흐름 |
| [COMPONENTS.md](docs/COMPONENTS.md) | 컴포넌트 계층, Props |
| [STATE.md](docs/STATE.md) | Zustand 상태 관리 |
| [API.md](docs/API.md) | API 함수, 에러 코드 |
| [PROMPTS.md](docs/PROMPTS.md) | AI 프롬프트 시스템 |
| [CHANGELOG.md](docs/CHANGELOG.md) | 변경 이력 |

---

## 프로젝트 구조

```
tooncraft-ai-studio/
├── App.tsx                 # 메인 앱
├── types.ts                # 타입 정의
├── constants.ts            # 상수
│
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── wizard/         # 마법사 레이아웃
│   │   ├── concept/        # 기획 단계
│   │   ├── steps/          # 각 단계 메인
│   │   ├── layout/         # 레이아웃
│   │   └── ui/             # 공통 UI
│   │
│   └── store/
│       └── projectStore.ts # 상태 관리
│
├── services/
│   └── geminiService.ts    # API 클라이언트
│
└── docs/                   # 문서
```

---

## 라이선스

MIT License

---

## 개발자 가이드

개발 시 [CLAUDE.md](CLAUDE.md) 참조.

### 문서 업데이트 규칙

- 새 파일 생성 → `docs/ARCHITECTURE.md` 업데이트
- 컴포넌트 수정 → `docs/COMPONENTS.md` 업데이트
- API 변경 → `docs/API.md` 업데이트
- 모든 작업 완료 → `docs/CHANGELOG.md` 업데이트
