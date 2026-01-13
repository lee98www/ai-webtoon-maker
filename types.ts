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

export interface PanelConfig {
  id: string;
  panelNumber: number;
  description: string;   // Visual description for AI (English)
  descriptionKo: string; // Visual description for User (Korean)
  dialogue: string;      // Text for speech bubble (Korean)
  caption: string;       // Narration text (Korean)
  characterFocus: string; // Who is in the shot (English)
  cameraAngle: string;   // Close-up, wide, etc. (English)
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
  | 'idea'
  | 'genre'
  | 'style'
  | 'characters'
  | 'styleRef'
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

export const WIZARD_STEPS: WizardStepConfig[] = [
  { id: 'idea', phase: 'concept', label: 'Story Idea', labelKo: '스토리 아이디어', icon: '01', required: true, order: 1 },
  { id: 'genre', phase: 'concept', label: 'Genre', labelKo: '장르 선택', icon: '02', required: true, order: 2 },
  { id: 'style', phase: 'concept', label: 'Art Style', labelKo: '아트 스타일', icon: '03', required: true, order: 3 },
  { id: 'characters', phase: 'concept', label: 'Characters', labelKo: '캐릭터 설정', icon: '04', required: false, order: 4 },
  { id: 'styleRef', phase: 'concept', label: 'Style Reference', labelKo: '스타일 레퍼런스', icon: '05', required: false, order: 5 },
  { id: 'blueprint', phase: 'storyboard', label: 'Panel Blueprint', labelKo: '패널 콘티', icon: '06', required: true, order: 6 },
  { id: 'render', phase: 'production', label: 'Render', labelKo: '이미지 생성', icon: '07', required: true, order: 7 },
];

export const PHASE_LABELS: Record<WizardPhase, { label: string; labelKo: string }> = {
  concept: { label: 'Concept', labelKo: '기획' },
  storyboard: { label: 'Storyboard', labelKo: '콘티' },
  production: { label: 'Production', labelKo: '제작' },
};
