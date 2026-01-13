// ============================================
// Professional Storyboard Generation System
// 프로페셔널 스토리보드 생성 시스템
// 템포, 몰입감, 긴장감, 페이지 턴 훅 등 엔터테인먼트 연출
// ============================================

import { Genre } from './genreDirecting';

// ============================================
// 패널 레이아웃 시스템 (Panel Layout System)
// 세로 스크롤 웹툰 최적화
// ============================================

export type PanelSizeRatio = 'small' | 'medium' | 'large' | 'full_bleed';
export type ScrollPace = 'rapid' | 'normal' | 'pause';
export type GutterSize = 'tight' | 'normal' | 'dramatic';

export interface PanelLayoutRecommendation {
  sizeRatio: PanelSizeRatio;
  scrollPace: ScrollPace;
  gutterBefore: GutterSize;
  gutterAfter: GutterSize;
  verticalAlign: 'flush' | 'centered' | 'offset';
  rationale: string;
}

// 8컷 스토리 구조 (황금률)
export interface StoryBeat {
  position: number;      // 1-8
  beatType: BeatType;
  emotionalWeight: number; // 0.0-1.0
  description: string;
  cameraRecommendation: string[];
  dialogueGuideline: string;
  layoutRecommendation: PanelLayoutRecommendation;  // 패널 레이아웃 권장사항
}

export type BeatType =
  | 'hook'           // 1컷: 시선을 사로잡는 오프닝
  | 'setup'          // 2컷: 상황 설정
  | 'development'    // 3-4컷: 전개
  | 'escalation'     // 5컷: 긴장감 고조
  | 'pre_climax'     // 6컷: 절정 직전
  | 'climax'         // 7컷: 감정/액션의 정점
  | 'cliffhanger';   // 8컷: 다음회 예고 (페이지 턴 훅)

// 8컷 황금 구조 (패널 레이아웃 권장사항 포함)
export const EIGHT_PANEL_STRUCTURE: StoryBeat[] = [
  {
    position: 1,
    beatType: 'hook',
    emotionalWeight: 0.6,
    description: "HOOK - 독자의 시선을 단번에 사로잡는 오프닝. 질문을 던지거나, 충격적인 장면으로 시작하거나, 미스터리를 제시",
    cameraRecommendation: ["wide establishing shot with dramatic element", "close-up on intriguing detail", "silhouette with mystery"],
    dialogueGuideline: "짧고 강렬한 한 마디. 질문형이나 선언형. '...그날이었다.' '믿을 수 없었다.' '시작은 평범했다.'",
    layoutRecommendation: {
      sizeRatio: 'large',
      scrollPace: 'normal',
      gutterBefore: 'normal',
      gutterAfter: 'tight',
      verticalAlign: 'flush',
      rationale: "첫 컷은 크게 시작해서 독자의 시선을 사로잡는다. 바로 다음 컷으로 연결되도록 여백 최소화."
    }
  },
  {
    position: 2,
    beatType: 'setup',
    emotionalWeight: 0.4,
    description: "SETUP - 상황과 캐릭터 소개. 독자가 세계관과 주인공에 몰입할 수 있는 정보 제공",
    cameraRecommendation: ["medium shot introducing character", "establishing shot of location", "character in environment"],
    dialogueGuideline: "자연스러운 상황 설명. 내레이션 또는 일상적 대화. 캐릭터 성격을 드러내는 말투.",
    layoutRecommendation: {
      sizeRatio: 'medium',
      scrollPace: 'normal',
      gutterBefore: 'tight',
      gutterAfter: 'normal',
      verticalAlign: 'centered',
      rationale: "정보 전달 컷. 너무 크면 지루하고, 작으면 정보가 부족. 적당한 크기로 배경과 캐릭터 모두 표현."
    }
  },
  {
    position: 3,
    beatType: 'development',
    emotionalWeight: 0.5,
    description: "DEVELOPMENT 1 - 갈등이나 문제의 씨앗이 등장. 독자가 '어? 뭔가 있네?' 느끼는 순간",
    cameraRecommendation: ["reaction shot", "over-shoulder revealing something", "detail shot on important element"],
    dialogueGuideline: "복선을 깔거나 의문을 제기하는 대사. '그런데...' '이상하다...' '왜 갑자기...'",
    layoutRecommendation: {
      sizeRatio: 'small',
      scrollPace: 'rapid',
      gutterBefore: 'normal',
      gutterAfter: 'tight',
      verticalAlign: 'flush',
      rationale: "작은 컷으로 빠르게 복선을 깔고 다음으로 넘어간다. 독자가 멈추지 않고 스크롤하게 유도."
    }
  },
  {
    position: 4,
    beatType: 'development',
    emotionalWeight: 0.6,
    description: "DEVELOPMENT 2 - 갈등 구체화. 문제가 명확해지고 주인공이 반응",
    cameraRecommendation: ["two-shot showing conflict", "close-up on emotional reaction", "dynamic angle for tension"],
    dialogueGuideline: "갈등을 명확히 하는 대사. 대립하는 두 입장이 드러나거나, 결정을 요구받는 상황.",
    layoutRecommendation: {
      sizeRatio: 'medium',
      scrollPace: 'normal',
      gutterBefore: 'tight',
      gutterAfter: 'normal',
      verticalAlign: 'centered',
      rationale: "갈등이 구체화되는 중요한 순간. 중간 크기로 긴장감 시작. 3컷과 연속으로 빠르게 읽히도록."
    }
  },
  {
    position: 5,
    beatType: 'escalation',
    emotionalWeight: 0.75,
    description: "ESCALATION - 긴장감 급상승. '이제 피할 수 없다'는 불가피함. 심박수가 올라가는 패널",
    cameraRecommendation: ["dutch angle", "extreme close-up on eyes", "low angle for threat", "rapid zoom effect"],
    dialogueGuideline: "짧고 급박한 대사. '안 돼!' '지금이야!' '이건...' 말 끝 흐림으로 긴장감.",
    layoutRecommendation: {
      sizeRatio: 'small',
      scrollPace: 'rapid',
      gutterBefore: 'tight',
      gutterAfter: 'tight',
      verticalAlign: 'offset',
      rationale: "작은 컷들이 연속으로 터지며 속도감 창출. 비스듬한 배치로 긴장감 강조. 독자의 스크롤 속도 가속."
    }
  },
  {
    position: 6,
    beatType: 'pre_climax',
    emotionalWeight: 0.9,
    description: "PRE-CLIMAX - 폭발 직전의 순간. 시간이 느려지는 듯한 연출. 모든 것이 다음 컷을 향해 수렴",
    cameraRecommendation: ["freeze frame before impact", "extreme close-up", "split second capture", "build-up composition"],
    dialogueGuideline: "한 단어 또는 침묵. 효과음 중심. '...!' 또는 무음으로 긴장 극대화.",
    layoutRecommendation: {
      sizeRatio: 'medium',
      scrollPace: 'pause',
      gutterBefore: 'normal',
      gutterAfter: 'dramatic',
      verticalAlign: 'centered',
      rationale: "시간이 느려지는 순간. 다음 클라이막스 전에 큰 여백으로 숨 고르기. 독자가 잠시 멈추게 만든다."
    }
  },
  {
    position: 7,
    beatType: 'climax',
    emotionalWeight: 1.0,
    description: "CLIMAX - 감정/액션의 최고점. 가장 큰 패널, 가장 강렬한 이미지. 카타르시스 또는 충격",
    cameraRecommendation: ["full panel impact shot", "dramatic lighting", "iconic pose", "maximum visual impact"],
    dialogueGuideline: "절정의 대사. 선언, 외침, 또는 충격적 진실. 독자가 '와...' 할 수 있는 순간.",
    layoutRecommendation: {
      sizeRatio: 'full_bleed',
      scrollPace: 'pause',
      gutterBefore: 'dramatic',
      gutterAfter: 'dramatic',
      verticalAlign: 'centered',
      rationale: "가장 큰 풀블리드 패널. 화면 전체를 채우며 임팩트 극대화. 앞뒤로 큰 여백을 두어 독자가 완전히 멈추게."
    }
  },
  {
    position: 8,
    beatType: 'cliffhanger',
    emotionalWeight: 0.7,
    description: "CLIFFHANGER - 페이지 턴 훅. 독자가 다음 회차를 기다리게 만드는 장치. 새로운 질문, 반전, 또는 긴장 유지",
    cameraRecommendation: ["mysterious new element", "character reaction to unseen thing", "dramatic reveal setup", "question-mark composition"],
    dialogueGuideline: "질문으로 끝나거나 말 끝을 흐리거나 새로운 미스터리 제시. '그건...' '설마...' '누구야, 넌?'",
    layoutRecommendation: {
      sizeRatio: 'large',
      scrollPace: 'normal',
      gutterBefore: 'dramatic',
      gutterAfter: 'normal',
      verticalAlign: 'flush',
      rationale: "클라이막스 여운 후 새로운 미스터리 제시. 크게 보여주되 풀블리드까진 아니게. 다음 회차 기대감 유발."
    }
  }
];

// 장르별 템포 조절
export const GENRE_TEMPO: Record<Genre, {
  buildupPace: string;
  climaxStyle: string;
  transitionStyle: string;
  overallRhythm: string;
}> = {
  [Genre.ACTION]: {
    buildupPace: "빠른 연속 패널로 가속, 작은 컷들이 연달아 터지며 속도감 창출",
    climaxStyle: "풀 패널 임팩트, 시간 정지 순간 포착, 속도선과 잔상 효과",
    transitionStyle: "컷 사이 빠른 전환, 동작선 연결로 시선 유도",
    overallRhythm: "스타카토 - 탁탁탁 빠르게 치고 빠지는 리듬"
  },
  [Genre.ROMANCE]: {
    buildupPace: "천천히 감정을 쌓아가는 여유로운 전개, 시선 교환에 충분한 시간",
    climaxStyle: "감정의 정점에서 시간이 멈춘 듯한 연출, 클로즈업과 여백",
    transitionStyle: "부드러운 전환, 오버랩되는 컷 경계, 감정의 연속성",
    overallRhythm: "레가토 - 부드럽게 연결되는 감정의 흐름"
  },
  [Genre.HORROR]: {
    buildupPace: "서서히 조여오는 압박감, 평범함에서 시작해 점점 불안해지는 전개",
    climaxStyle: "갑작스러운 반전 또는 공포의 실체 드러냄, 충격적 풀 패널",
    transitionStyle: "불규칙한 컷 전환으로 불안감 조성, 예측 불가능한 리듬",
    overallRhythm: "불협화음 - 평온함과 공포의 급격한 대비"
  },
  [Genre.FANTASY]: {
    buildupPace: "세계관 몰입을 위한 풍경 패널, 그러다 액션으로 템포 전환",
    climaxStyle: "웅장한 스케일의 마법 시전이나 전투, 화려한 비주얼",
    transitionStyle: "넓은 숏에서 클로즈업으로 자연스러운 확대",
    overallRhythm: "서사적 - 장엄함과 긴박함의 조화"
  },
  [Genre.SLICE_OF_LIFE]: {
    buildupPace: "일상의 소소함을 보여주는 편안한 속도, 서두르지 않음",
    climaxStyle: "감동적 순간이나 깨달음, 조용하지만 깊은 울림",
    transitionStyle: "자연스러운 시간 흐름, 계절이나 시간대 변화로 연결",
    overallRhythm: "안단테 - 편안하고 따뜻한 일상의 리듬"
  },
  [Genre.NOIR]: {
    buildupPace: "서서히 드러나는 진실, 단서를 하나씩 발견하는 과정",
    climaxStyle: "충격적인 진실 드러남, 어둠 속 빛처럼 강렬한 대비",
    transitionStyle: "장면 전환 시 시공간 점프, 플래시백 활용",
    overallRhythm: "서스펜스 - 긴장감이 서서히 고조되는 스릴러"
  },
  [Genre.POLITICS]: {
    buildupPace: "체스판처럼 한 수씩 두는 계산된 전개, 복선의 배치",
    climaxStyle: "권력 역전이나 음모 폭로의 순간, 카타르시스",
    transitionStyle: "대비되는 상황 병치, 공적 얼굴과 사적 얼굴",
    overallRhythm: "모데라토 - 계산적이고 신중한 움직임"
  }
};

// 대사 황금률
export const DIALOGUE_RULES = {
  maxLength: {
    speech: 40,        // 일반 대사 40자 이내
    shout: 20,         // 외침 20자 이내
    thought: 60,       // 독백/속마음 60자 이내
    narration: 80,     // 나레이션 80자 이내
    sfx: 6             // 효과음 6자 이내
  },

  principles: [
    "한 컷에 한 감정만 담아라",
    "설명하지 말고 보여줘라 (Show, don't tell)",
    "마지막 단어에 임팩트를 실어라",
    "침묵도 대사다 - 말없는 컷의 힘을 활용하라",
    "서브텍스트를 활용하라 - 말하지 않는 것이 더 강력하다"
  ],

  techniques: {
    tension: [
      "말 끝 생략 '...'으로 긴장감 연장",
      "짧은 문장을 연속으로 - '멈춰.' '지금.' '바로.'",
      "질문으로 끝나는 컷으로 다음 컷 유도"
    ],
    emotion: [
      "감탄사로 감정 강조 - '아...' '젠장...' '하...'",
      "말투 변화로 감정 변화 표현",
      "반복으로 강조 - '안 돼, 안 돼, 안 돼!'"
    ],
    rhythm: [
      "긴 문장 다음에 짧은 문장",
      "액션 씬에서는 한두 단어만",
      "감정 씬에서는 여백 있는 대사"
    ]
  }
};

// 스토리보드 생성 시스템 프롬프트 빌더
export function buildStoryboardSystemPrompt(genre: Genre): string {
  const tempo = GENRE_TEMPO[genre];
  const structure = EIGHT_PANEL_STRUCTURE;

  return `당신은 네이버웹툰 완결작 기준 3억 회 이상 누적 조회수를 기록한 베테랑 웹툰 스토리 작가이자 연출가입니다.
${genre} 장르 특화 전문가로서, 독자의 감정을 정확히 조종하는 능력을 가지고 있습니다.

[당신의 핵심 역량]
1. 로그라인의 대가 - 한 줄로 독자를 사로잡는 훅
2. 구조적 스토리텔링 - 8컷 황금 비율의 완벽한 이해
3. 감정 롤러코스터 설계 - 독자의 도파민 분비 타이밍 조절
4. 페이지 턴 훅 - 독자가 다음 회차를 결제하게 만드는 기술

[8컷 황금 구조 - 반드시 따를 것]
${structure.map(beat => `
${beat.position}컷 - ${beat.beatType.toUpperCase()} (감정 강도: ${(beat.emotionalWeight * 100).toFixed(0)}%)
${beat.description}
카메라: ${beat.cameraRecommendation.join(' / ')}
대사: ${beat.dialogueGuideline}
`).join('\n')}

[${genre} 장르 템포 가이드]
- 빌드업 속도: ${tempo.buildupPace}
- 클라이막스 스타일: ${tempo.climaxStyle}
- 전환 스타일: ${tempo.transitionStyle}
- 전체 리듬: ${tempo.overallRhythm}

[대사 황금률]
- 대사: ${DIALOGUE_RULES.maxLength.speech}자 이내
- 외침: ${DIALOGUE_RULES.maxLength.shout}자 이내
- 독백: ${DIALOGUE_RULES.maxLength.thought}자 이내
- 나레이션: ${DIALOGUE_RULES.maxLength.narration}자 이내
원칙: ${DIALOGUE_RULES.principles.join(', ')}

[Character Visuals 작성법 - 필수]
주인공의 외모를 "Character Reference Bible" 수준으로 정밀하게 기술:
- 얼굴: 얼굴형(계란형/각진형/둥근형), 쌍꺼풀 여부, 눈 크기와 색깔, 코(높이/형태), 입술(두께/색감)
- 머리카락: 길이(cm), 스타일(직모/웨이브/곱슬), 색상, 가르마/앞머리 스타일
- 체형: 키(상대적), 어깨너비, 체격(마름/보통/건장)
- 의상: 현재 옷의 상세 묘사 (색상, 재질, 패턴, 레이어링)
- 특징: 점, 흉터, 피어싱, 문신, 안경, 액세서리 등 식별 요소

[Panel Description 작성법 - 영어]
1. 캐릭터 외형 키워드를 매 패널마다 반복 (일관성 핵심)
2. 카메라 앵글 명시 (extreme close-up / close-up / medium shot / full shot / wide shot)
3. 카메라 각도 명시 (eye level / low angle / high angle / dutch angle / bird's eye / worm's eye)
4. 조명 분위기 (dramatic lighting / soft lighting / backlit / silhouette / etc.)
5. 감정 상태와 표정 명시
6. 배경 요소와 분위기 어휘

[엔터테인먼트 연출 필수 요소]
1. 훅(Hook): 1컷에서 독자를 잡아야 함 - 질문, 충격, 미스터리 중 하나
2. 긴장감: 5-6컷에서 심박수가 올라가는 연출 - 줌인, 더치앵글, 클로즈업
3. 카타르시스: 7컷에서 터지는 감정 - 가장 큰 패널, 가장 강렬한 임팩트
4. 클리프행어: 8컷에서 '다음엔 뭐지?' 궁금증 유발 - 새로운 인물, 반전 암시, 질문

[절대 금지]
- 설명충 대사 (상황을 말로 설명하지 말고 그림으로 보여줘라)
- 밋밋한 카메라 앵글 (정면 미디엄샷만 반복하지 마라)
- 감정 곡선 없는 전개 (점점 고조되어야 한다)
- 예측 가능한 결말 (8컷에서 반드시 트위스트나 훅)`;
}
