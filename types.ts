export enum AppStep {
  CONCEPT = 'CONCEPT',
  STORYBOARD = 'STORYBOARD',
  PRODUCTION = 'PRODUCTION',
  VIEWER = 'VIEWER'
}

export enum Genre {
  ACTION = 'Action',
  ROMANCE = 'Romance',
  SLICE_OF_LIFE = 'Slice of Life',
  POLITICS = 'Politics',
  NOIR = 'Noir',
  HORROR = 'Horror',
  FANTASY = 'Fantasy'
}

export enum ArtStyle {
  REALISTIC = 'Realistic Cinematic',
  ANIME = 'Japanese Anime',
  CLAY = 'Claymation / Stop Motion',
  MINHWA = 'Korean Folk Painting (Minhwa)',
  WEBTOON_STANDARD = 'Standard Webtoon / Manhwa',
  SKETCH = 'Black and White Sketch'
}

// Character Reference for consistency
export interface CharacterReference {
  id: string;
  name: string;
  role: 'protagonist' | 'supporting' | 'antagonist';
  description: string;
  referenceImages: string[]; // Base64 encoded images
  extractedFeatures?: string; // AI analyzed features
}

// Style Reference for consistent art style
export interface StyleReference {
  id: string;
  name: string;
  images: string[]; // Base64 encoded images
  keywords: string[];
  extractedStyle?: string; // AI analyzed style description
}

// 8-Panel Story Beat Types
export type BeatType =
  | 'hook'           // 1컷: 시선을 사로잡는 오프닝
  | 'setup'          // 2컷: 상황 설정
  | 'development'    // 3-4컷: 전개
  | 'escalation'     // 5컷: 긴장감 고조
  | 'pre_climax'     // 6컷: 절정 직전
  | 'climax'         // 7컷: 감정/액션의 정점
  | 'cliffhanger';   // 8컷: 다음회 예고 (페이지 턴 훅)

// ============================================
// 감정 시스템 (Emotional System)
// ============================================

export type EmotionType =
  | 'anxiety'       // 불안
  | 'excitement'    // 흥분
  | 'sadness'       // 슬픔
  | 'anger'         // 분노
  | 'joy'           // 기쁨
  | 'fear'          // 공포
  | 'relief'        // 안도
  | 'surprise'      // 놀람
  | 'tension'       // 긴장
  | 'calm';         // 평온

export interface EmotionalState {
  primary: EmotionType;
  secondary?: EmotionType;
  intensity: number;  // 0.0-1.0
  trajectory: 'rising' | 'falling' | 'stable' | 'volatile';
}

// ============================================
// 패널 레이아웃 시스템 (Panel Layout System)
// 세로 스크롤 웹툰 최적화
// ============================================

export type PanelSizeRatio = 'small' | 'medium' | 'large' | 'full_bleed';
export type ScrollPace = 'rapid' | 'normal' | 'pause';
export type GutterSize = 'tight' | 'normal' | 'dramatic';

export interface PanelLayoutConfig {
  sizeRatio: PanelSizeRatio;    // 패널 크기 (small: 1/3, medium: 1/2, large: 2/3, full_bleed: 전체)
  scrollPace: ScrollPace;        // 스크롤 템포 (독자 시선 속도)
  verticalPosition: 'flush' | 'centered' | 'offset';  // 세로 배치
  gutterSize: GutterSize;        // 컷 사이 여백
}

// ============================================
// 말풍선 시스템 (Speech Bubble System)
// ============================================

export type BubbleType =
  | 'speech'       // 일반 대사
  | 'shout'        // 외침 (뾰족한 테두리)
  | 'whisper'      // 속삭임 (점선 테두리)
  | 'thought'      // 속마음 (구름 모양)
  | 'narration'    // 나레이션 (직사각형 박스)
  | 'sfx'          // 효과음 (배경에 통합)
  | 'telepathy'    // 텔레파시 (파도 테두리)
  | 'radio'        // 기계음/전화 (각진 테두리)
  | 'flashback';   // 회상 대사 (빈티지 스타일)

export type BubbleShape = 'round' | 'rectangular' | 'cloud' | 'spiky' | 'wavy' | 'jagged';
export type BubbleBorder = 'solid' | 'dashed' | 'double' | 'none' | 'glow' | 'sketch';
export type TailDirection = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none';

export interface BubbleStyle {
  type: BubbleType;
  shape: BubbleShape;
  border: BubbleBorder;
  tailDirection: TailDirection;
  position: { x: number; y: number };  // 패널 내 위치 (0-100%)
  fontSize?: 'small' | 'normal' | 'large' | 'xlarge';
  emphasis?: boolean;  // 강조 효과 (그림자, 테두리 굵기 등)
}

export interface DialogueEntry {
  text: string;
  bubbleStyle: BubbleStyle;
  speaker?: string;  // 화자 ID
  delay?: number;    // 애니메이션 지연 (순차 등장용)
}

// ============================================
// 시간 연출 시스템 (Temporal Effects)
// ============================================

export type TemporalEffect =
  | 'slow_motion'     // 슬로모션
  | 'freeze_frame'    // 프리즈 프레임
  | 'time_skip'       // 시간 경과
  | 'flashback'       // 과거 회상
  | 'flash_forward'   // 미래 예지
  | 'montage';        // 몽타주

export interface TemporalDirective {
  effect: TemporalEffect;
  intensity: number;  // 0.0-1.0
  visualCues: string[];  // ["motion blur", "particles", "sepia tone"]
}

// ============================================
// 패널 설정 (Panel Config)
// ============================================

export interface PanelConfig {
  id: string;
  panelNumber: number;
  beatType?: BeatType;           // 8컷 구조에서의 스토리 비트
  emotionalWeight?: number;      // 감정 강도 (0.0-1.0)
  emotionalState?: EmotionalState;  // 미시적 감정 상태
  description: string;           // Visual description for AI (English)
  descriptionKo: string;         // Visual description for User (Korean)
  dialogue: string;              // Text for speech bubble (Korean)
  dialogueEntries?: DialogueEntry[];  // 다중 말풍선 (확장)
  caption: string;               // Narration text (Korean)
  characterFocus: string;        // Who is in the shot (English)
  cameraAngle: string;           // Camera angle: low_angle, dutch_angle, etc.
  shotSize?: string;             // Shot size: wide, medium, close_up, etc.
  composition?: string;          // Composition description (rule of thirds, diagonal, etc.)
  directorNote?: string;         // Director's intention for this shot (Korean)
  layout?: PanelLayoutConfig;    // 패널 레이아웃 설정
  temporalEffect?: TemporalDirective;  // 시간 연출 효과
  generatedImageUrl?: string;
  isGenerating?: boolean;
}

export interface WebtoonProject {
  title: string;
  synopsis: string;
  characterVisuals: string; // Text-based character definition
  genre: Genre;
  artStyle: ArtStyle;
  panels: PanelConfig[];
  // New fields for reference system
  characters: CharacterReference[];
  styleRef: StyleReference | null;
}

// Project Export format
export interface ProjectExport {
  version: '1.0';
  exportedAt: string;
  project: WebtoonProject;
  metadata: {
    panelCount: number;
    hasImages: boolean;
    characterCount: number;
  };
}

// Error types
export interface ErrorMessage {
  message: string;
  type: 'error' | 'warning';
}

// Progress tracking
export interface ProgressInfo {
  completed: number;
  total: number;
  currentPanel?: number;
  status?: 'generating' | 'processing' | 'done';
}

// Wizard Step System
export type WizardStepId =
  | 'concept'    // 통합 기획 화면 (idea + genre + style + characters + styleRef)
  | 'idea'       // legacy
  | 'genre'      // legacy
  | 'style'      // legacy
  | 'characters' // legacy
  | 'styleRef'   // legacy
  | 'blueprint'
  | 'render';

export type WizardPhase = 'concept' | 'storyboard' | 'production';

export interface WizardStepConfig {
  id: WizardStepId;
  phase: WizardPhase;
  label: string;
  labelKo: string;
  icon: string;
  required: boolean;
  order: number;
}

export interface WizardState {
  currentStepId: WizardStepId;
  completedSteps: Set<WizardStepId>;
  skippedSteps: Set<WizardStepId>;
  visitedSteps: Set<WizardStepId>;
}

// 간소화된 3단계 wizard (기존 5단계 → 통합 1화면 + 2단계)
export const WIZARD_STEPS: WizardStepConfig[] = [
  { id: 'concept', phase: 'concept', label: 'Concept', labelKo: '웹툰 기획', icon: '01', required: true, order: 1 },
  { id: 'blueprint', phase: 'storyboard', label: 'Panel Blueprint', labelKo: '패널 콘티', icon: '02', required: true, order: 2 },
  { id: 'render', phase: 'production', label: 'Render', labelKo: '이미지 생성', icon: '03', required: true, order: 3 },
];

// 기존 단계 ID도 유지 (하위 호환성)
export const LEGACY_CONCEPT_STEPS: WizardStepId[] = ['idea', 'genre', 'style', 'characters', 'styleRef'];

export const PHASE_LABELS: Record<WizardPhase, { label: string; labelKo: string }> = {
  concept: { label: 'Concept', labelKo: '기획' },
  storyboard: { label: 'Storyboard', labelKo: '콘티' },
  production: { label: 'Production', labelKo: '제작' },
};
