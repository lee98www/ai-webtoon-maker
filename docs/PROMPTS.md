# AI 프롬프트 시스템

## 개요

웹툰 생성에 사용되는 AI 프롬프트 구조와 전략.

**관련 파일**:
- `constants.ts` - 장르/스타일 프롬프트
- `services/geminiService.ts` - 프롬프트 조합 로직
- `server/prompts/` - 고급 프롬프트 (레거시)

---

## 8컷 스토리 구조

### BeatType

```typescript
type BeatType =
  | 'hook'         // 1컷: 오프닝 훅
  | 'setup'        // 2컷: 상황 설정
  | 'development'  // 3-4컷: 전개
  | 'escalation'   // 5컷: 긴장감 고조
  | 'pre_climax'   // 6컷: 클라이막스 직전
  | 'climax'       // 7컷: 절정
  | 'cliffhanger'; // 8컷: 다음회 예고
```

### 구조 설명

```
┌─────────────────────────────────────────────────┐
│  1컷 [HOOK]      독자를 단번에 사로잡는 오프닝   │
├─────────────────────────────────────────────────┤
│  2컷 [SETUP]     상황/캐릭터 소개               │
├─────────────────────────────────────────────────┤
│  3컷 [DEVELOPMENT] 스토리 전개 시작             │
├─────────────────────────────────────────────────┤
│  4컷 [DEVELOPMENT] 스토리 전개 계속             │
├─────────────────────────────────────────────────┤
│  5컷 [ESCALATION]  긴장감/갈등 고조             │
├─────────────────────────────────────────────────┤
│  6컷 [PRE_CLIMAX]  절정 직전, 긴장 최고조       │
├─────────────────────────────────────────────────┤
│  7컷 [CLIMAX]      감정/액션의 정점             │
├─────────────────────────────────────────────────┤
│  8컷 [CLIFFHANGER] 다음이 궁금한 마무리         │
└─────────────────────────────────────────────────┘
```

---

## 장르별 프롬프트

### GENRE_DESCRIPTIONS

```typescript
const GENRE_DESCRIPTIONS: Record<Genre, string> = {
  ACTION: "타격감 넘치는 액션, 다이내믹한 앵글, 속도감 있는 연출",
  ROMANCE: "감성적인 작화, 인물의 미세한 표정 변화, 설레는 분위기",
  SLICE_OF_LIFE: "편안하고 따뜻한 색감, 공감가는 일상적 묘사",
  POLITICS: "느와르적 긴장감, 무거운 명암 대비, 수트와 실내극",
  NOIR: "차가운 도시의 밤, 강렬한 흑백 대비, 비, 네온 사인",
  HORROR: "기괴한 텍스처, 불안한 구도, 심리적 공포를 자극하는 연출",
  FANTASY: "웅장한 세계관, 마법 효과, 이세계적인 배경과 크리처"
};
```

### 장르별 특징

| 장르 | 핵심 키워드 | 연출 포인트 |
|------|-----------|------------|
| ACTION | 다이내믹, 속도감 | 모션 블러, 강한 앵글 |
| ROMANCE | 감성, 설레임 | 부드러운 조명, 표정 |
| SLICE_OF_LIFE | 따뜻함, 공감 | 일상적 배경, 자연광 |
| POLITICS | 긴장감, 무게감 | 어두운 톤, 클로즈업 |
| NOIR | 대비, 도시 | 하드 라이팅, 비/밤 |
| HORROR | 공포, 불안 | 왜곡, 그림자 |
| FANTASY | 웅장함, 마법 | 화려한 이펙트, 스케일 |

---

## 스타일별 프롬프트

### STYLE_PROMPTS

```typescript
const STYLE_PROMPTS: Record<ArtStyle, string> = {
  REALISTIC:
    "photorealistic, 8k resolution, cinematic lighting, " +
    "highly detailed texture, korean blockbuster movie style",

  ANIME:
    "high quality anime style, cel shaded, vibrant colors, " +
    "makoto shinkai style, detailed background",

  CLAY:
    "claymation style, plasticine texture, stop motion look, " +
    "soft shadows, cute and rounded",

  MINHWA:
    "korean traditional folk painting style, oriental ink painting, " +
    "hanji paper texture, flat perspective, elegant colors",

  WEBTOON_STANDARD:
    "premium webtoon style, manhwa style, clean lines, " +
    "digital coloring, vertical format optimized, high contrast",

  SKETCH:
    "rough pencil sketch, charcoal, black and white, " +
    "artistic strokes, storyboard style"
};
```

### 스타일별 특징

| 스타일 | 특징 | 용도 |
|--------|------|------|
| REALISTIC | 실사, 시네마틱 | 성인 드라마, 스릴러 |
| ANIME | 셀 셰이딩, 선명 | 액션, 판타지 |
| CLAY | 클레이, 귀여움 | 아동용, 코미디 |
| MINHWA | 한국화, 전통 | 사극, 민담 |
| WEBTOON_STANDARD | 웹툰, 깔끔 | 범용 |
| SKETCH | 스케치, 흑백 | 스토리보드 |

---

## 이미지 생성 프롬프트

### 기본 구조

```
[MASTERPIECE WEBTOON PANEL - PANEL {N}]

TARGET: Professional Korean webtoon publication quality
FORMAT: 9:16 vertical (mobile optimized)

[STYLE]
{STYLE_PROMPTS[style]}

[GENRE: {genre}]
{GENRE_DESCRIPTIONS[genre]}

[CHARACTER]
{characterVisuals}

[SCENE]
{panel.description}

Camera: {panel.cameraAngle}
Focus: {panel.characterFocus}

[RULES]
- Cinematic lighting, high-end illustration
- DO NOT render any text or speech bubbles
- Maintain character consistency
- Vertical 9:16 composition
- Professional webtoon quality
```

### 이전 패널 참조

```
[PREVIOUS PANEL - Use for character/style consistency only, create NEW composition]
{Base64 이미지}
```

---

## 시놉시스 정제 프롬프트

```
당신은 네이버/카카오 웹툰 유료 결제율 1위의 메인 PD입니다.
사용자의 아이디어를 상업적 베스트셀러의 '로그라인'과 '기승전결'로 재구성하십시오.
독자의 도파민을 자극하는 '사이다'와 '반전' 요소를 반드시 포함하고, 상업적인 어휘를 사용하십시오.
출력은 한국어로만, 300자 이내로 간결하게 작성하십시오.

[장르: {genre}] 아이디어: "{input}"
작품의 상업적 가치를 극대화한 시놉시스를 한국어로 작성해.
```

---

## 스토리보드 생성 프롬프트

```
당신은 프로페셔널 웹툰 콘티 작가입니다.

시놉시스: {synopsis}
장르: {genre} - {genreDesc}
총 {count}컷의 웹툰 콘티를 생성하세요.

[8컷 구조]
1컷: 훅 - 독자를 사로잡는 오프닝
2컷: 셋업 - 상황/캐릭터 소개
3-4컷: 전개 - 스토리 진행
5-6컷: 고조 - 긴장감 상승
7컷: 클라이막스 - 감정의 정점
8컷: 클리프행어 - 다음이 궁금하도록

[출력 JSON 형식]
{
  "title": "작품 제목",
  "characterVisuals": "주인공 외형 상세 설명 (영어)",
  "panels": [
    {
      "panelNumber": 1,
      "beatType": "hook",
      "emotionalWeight": 0.7,
      "description": "영어로 된 상세 시각 묘사",
      "descriptionKo": "한국어 연출 가이드",
      "dialogue": "캐릭터 대사 (한국어, 40자 이내)",
      "caption": "나레이션 (한국어, 80자 이내)",
      "characterFocus": "초점 캐릭터",
      "cameraAngle": "카메라 앵글"
    }
  ]
}
```

---

## 캐릭터 시트 프롬프트

```
[CHARACTER REFERENCE SHEET]

Create a professional character reference sheet for webtoon production.

CHARACTER:
- Name: {name}
- Description: {description}
- Gender: {gender}

LAYOUT: Single image containing:
1. FRONT VIEW (3/4 body) - LEFT
2. FACE CLOSE-UP - CENTER TOP
3. 3/4 ANGLE VIEW - CENTER BOTTOM
4. 3 EXPRESSION VARIATIONS - RIGHT

STYLE: {stylePrompt}

REQUIREMENTS:
- All views show EXACT SAME character
- Clean white background
- NO text labels
- High detail on face, hair, clothing
- Consistent proportions
```

---

## 스타일 레퍼런스 프롬프트

```
[STYLE REFERENCE SAMPLE]

Create a style reference for webtoon production.

BASE STYLE: {baseStyle}
ADDITIONAL: {englishKeywords}
SCENE: {sampleScene}

REQUIREMENTS:
- Demonstrate specific visual style clearly
- Focus on: line quality, color palette, shading
- Professional webtoon quality
- Vertical 9:16 format
```

---

## 프롬프트 최적화 팁

### 1. 일관성 유지
- 이전 패널 이미지를 참조로 제공
- characterVisuals를 모든 패널에 포함
- 동일한 스타일 프롬프트 유지

### 2. 퀄리티 향상
- "professional", "high quality" 키워드 포함
- 구체적인 조명/앵글 지정
- 부정 지시 ("DO NOT render text")

### 3. 한국 웹툰 최적화
- 9:16 세로 포맷 명시
- "Korean webtoon", "manhwa" 키워드
- "mobile optimized" 명시

---

## 스타일 키워드 매핑

한국어 → 영어 변환:

```typescript
const keywordMap = {
  '선명한 선화': 'crisp clean line art',
  '수채화 느낌': 'watercolor texture',
  '그라데이션': 'smooth gradient shading',
  '플랫 컬러': 'flat solid colors',
  '강한 명암': 'high contrast dramatic shadows',
  '파스텔 톤': 'soft pastel colors',
  '네온 컬러': 'vibrant neon colors',
  '빈티지': 'vintage retro aesthetic',
  '미니멀': 'minimalist clean design',
  '디테일함': 'highly detailed artwork'
};
```
