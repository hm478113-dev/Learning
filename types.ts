
export enum GenerationMode {
  STANDARD = 'Standard',
  ULTRA_EXPERT = 'Ultra Expert'
}

export type AppStage = 'initial' | 'analyzing' | 'questions' | 'generating' | 'results';
export type ContentType = 'image' | 'story' | 'video';

export interface Question {
  id: number;
  question_ar: string;
  context_key: string; // e.g., 'art_style', 'character_details'
}

export interface CharacterProfile {
  name: string;
  role: string;
  details_ar: string;
  details_en: string;
  character_prompt: string; 
  color_palette: string;
  style_guide: string;
  clothing_rules: string;
  visual_identity: string;
}

export interface CharacterBible {
  characters: CharacterProfile[];
}

export interface LocationAsset {
  name_ar: string;
  name_en: string;
  description: string;
  location_prompt: string; // Master prompt for the fixed location
}

export interface Scene {
  scene_number: number;
  description_ar: string;
  description_en: string;
  visual_prompt_ar: string;
  visual_prompt_en: string;
  animation_prompt_ar: string;
  animation_prompt_en: string;
  narration_ar: string; // New: Script for this scene
  narration_en: string; // New: Script for this scene
  transition_ar: string; // New: Transition to next scene
  transition_en: string; // New: Transition to next scene
  technical_specs: {
    camera: string;
    lens: string;
    lighting: string;
    aspect_ratio: string;
  };
}

export interface StorybookOutput {
  story_title: string;
  voiceover_tone_ar: string; // New: Overall tone
  voiceover_tone_en: string; // New: Overall tone
  scenes: Scene[];
}

export interface VideoTrack {
  vfx: string;
  motion_type: string;
  sound_direction_ar: string;
  sound_direction_en: string;
}

export interface VideoScene extends Scene {
  action_description_ar: string;
  action_description_en: string;
  tracks: VideoTrack;
}

export interface VideoOutput {
  video_title: string;
  voiceover_tone_ar: string; // New
  voiceover_tone_en: string; // New
  scenes: VideoScene[];
}

export interface CombinedResponse {
  analysis: {
    concept_summary: string;
    art_direction: string;
    technical_breakdown: string;
  };
  character_bible: CharacterBible;
  location_assets: LocationAsset[]; 
  storybook: StorybookOutput;
  video: VideoOutput;
}
