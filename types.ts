export interface AnalysisResult {
  protagonist: string;
  threat: string;
  mood: string;
  setting: string;
  suggestedTitle: string;
  visualComposition: string;
  imagePrompt: string;
}

export enum FontStyle {
  IMPACT = 'Anton', // Close alternative to Impact
  CARTOON = 'Bangers',
  MODERN = 'Montserrat',
  BOLD = 'Roboto',
  CLEAN = 'Lato'
}

export interface TextConfig {
  text: string;
  font: FontStyle;
  color: string;
  hasShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowDistance: number;
  opacity: number;
  stroke: boolean;
  strokeColor: string;
  positionX: number; // Percentage 0-100
  positionY: number; // Percentage 0-100
  scale: number;
  rotation: number;
}

export type AppStatus = 'idle' | 'analyzing' | 'generating_image' | 'complete' | 'error';

export interface GeneratedImage {
  url: string; // Base64 or URL
  width: number;
  height: number;
}
