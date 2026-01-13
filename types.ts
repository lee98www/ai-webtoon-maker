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
