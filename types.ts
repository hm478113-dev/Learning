
export enum GenerationMode {
  STANDARD = 'Standard',
  ULTRA_EXPERT = 'Ultra Expert'
}

export type AppStage = 'initial' | 'analyzing' | 'questions' | 'generating' | 'story_review' | 'results';
export type ContentType = 'image' | 'story' | 'video' | 'song';

export interface Question {
  id: number;
  question_ar: string;
  context_key: string; 
  options: string[]; 
}

export interface VoiceProfile {
  gender: string;
  age_group: string;
  tone_description_ar: string;
  tone_description_en: string;
  pitch: string;
  speaking_style: string;
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
  voice_profile: VoiceProfile;
}

export interface CharacterBible {
  characters: CharacterProfile[];
}

export interface LocationAsset {
  name_ar: string;
  name_en: string;
  description: string;
  location_prompt: string;
}

export interface Scene {
  scene_number: number;
  description_ar: string;
  description_en: string;
  visual_prompt_ar: string;
  visual_prompt_en: string;
  animation_prompt_ar: string;
  animation_prompt_en: string;
  narration_ar: string;
  narration_en: string;
  transition_ar: string;
  transition_en: string;
  technical_specs: {
    camera: string;
    lens: string;
    lighting: string;
    aspect_ratio: string;
  };
}

export interface StorybookOutput {
  story_title: string;
  voiceover_tone_ar: string;
  voiceover_tone_en: string;
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
  sound_style: string;
  tracks: VideoTrack;
}

export interface VideoOutput {
  video_title: string;
  voiceover_tone_ar: string;
  voiceover_tone_en: string;
  full_video_prompt_ar: string;
  full_video_prompt_en: string;
  scenes: VideoScene[];
}

export interface SongSegment {
  section_type: string;
  lyrics_ar: string;
  lyrics_en_transliteration: string;
  musical_cues: string;
  visual_description_ar: string;
  visual_description_en: string;
  visual_prompt_ar: string;
  visual_prompt_en: string;
  animation_prompt_ar: string;
  animation_prompt_en: string;
  transition_ar: string;
  transition_en: string;
  technical_specs: {
    camera: string;
    lens: string;
    lighting: string;
    aspect_ratio: string;
  };
}

export interface SongOutput {
  song_title: string;
  genre_description: string;
  music_generation_prompt: string;
  consistent_audio_vibe_ar: string;
  consistent_audio_vibe_en: string;
  lyrics_structure: SongSegment[];
  bpm: string;
  instruments: string;
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
  song: SongOutput;
}

export interface SavedProject {
  id: string;
  timestamp: number;
  title: string;
  concept: string;
  contentType: ContentType;
  response: CombinedResponse;
  style: string;
  ownerIp?: string;
  browserId?: string; 
}
