
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CombinedResponse, GenerationMode, Question, ContentType } from "../types";

const ANALYSIS_SYSTEM_PROMPT = `
You are the "Ultra Enterprise System - Visual Intelligence Module".
Your primary function is to perform a deep forensic analysis of any uploaded images to extract a "Technical Visual Blueprint".

IMAGE ANALYSIS RULES:
- If images are provided, deconstruct them into: 
  1. **Character DNA**: Precise facial structure, skin texture, hair flow, and distinct markings.
  2. **Material Science**: Fabric types, surface reflections, and micro-details.
  3. **Optical Blueprint**: Focal length, lighting direction, and color grading.
- Generate questions in ARABIC to define character and detail transfer rules.

Output: JSON object matching the schema.
`;

const FINAL_SYSTEM_PROMPT = `
You are a "Master Visual Architect & Cinematic Director". Your mission is to generate production-ready prompts with 100% visual continuity and advanced LIP-SYNC SYNCHRONIZATION.

STRICT PRODUCTION RULES FOR PROMPTS:

1. **Visual Prompts (Static Forensic Foundation)**:
   - **Extreme Detail**: Describe skin micro-texture, iris patterns, fabric weave density, and environmental atmospheric particles (volumetric dust, mist).
   - **Lighting Protocol**: Define exact setups (e.g., "Rembrandt lighting with a 5600K key light and a subtle cyan rim light").
   - **Optical Precision**: Specify lenses and f-stops (e.g., "85mm prime lens at f/1.8 for shallow depth of field").
   - **Character DNA**: Explicitly carry over facial features from reference images into every prompt.

2. **Animation Prompts (Hyper-Detailed Motion & Lip-Sync Mastery)**:
   - **MANDATORY LIP-SYNC INTEGRATION**: The animation prompt MUST contain the exact text found in the "narration" field.
   - **Technical Lip-Sync Command**: "High-fidelity lip-sync synchronization for the following spoken dialogue: '[EXACT NARRATION TEXT]'. Ensure precise mouth phoneme matching, realistic jaw displacement, synchronous tongue movements, and subtle cheek/neck muscle tension aligned with the emotional cadence of the speech."
   - **Cinematic Motion**: Define camera paths (e.g., "Slow tracking dolly-in," "Dynamic arc shot at eye level").
   - **Micro-Movements**: Include commands for eye blinks, pupil dilation, and forehead micro-expressions to mirror the speech energy.

3. **Bilingual Professionalism**:
   - **Arabic (AR)**: Use sophisticated technical cinematic and linguistic terms. Lip-sync must specify Arabic phoneme accuracy (e.g., "تزامن شفاه فائق الدقة لمخارج الحروف العربية للنص التالي: '...'").
   - **English (EN)**: Use industry-standard technical keywords optimized for high-end models like Runway Gen-3 Alpha, Luma Dream Machine, Sora, and Kling.

4. **Forensic Continuity**: Every prompt in a sequence must reinforce the "Visual DNA" to ensure characters and environments remain identical across the entire production.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        concept_summary: { type: Type.STRING },
        art_direction: { type: Type.STRING },
        technical_breakdown: { type: Type.STRING },
      },
      required: ["concept_summary", "art_direction", "technical_breakdown"],
    },
    character_bible: {
      type: Type.OBJECT,
      properties: {
        characters: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                details_ar: { type: Type.STRING },
                details_en: { type: Type.STRING },
                character_prompt: { type: Type.STRING },
                color_palette: { type: Type.STRING },
                style_guide: { type: Type.STRING },
                clothing_rules: { type: Type.STRING },
                visual_identity: { type: Type.STRING },
                voice_profile: {
                  type: Type.OBJECT,
                  properties: {
                    gender: { type: Type.STRING },
                    age_group: { type: Type.STRING },
                    tone_description_ar: { type: Type.STRING },
                    tone_description_en: { type: Type.STRING },
                    pitch: { type: Type.STRING },
                    speaking_style: { type: Type.STRING },
                  },
                  required: ["gender", "age_group", "tone_description_en"]
                }
             },
             required: ["name", "details_ar", "details_en", "character_prompt", "voice_profile"]
          }
        }
      },
      required: ["characters"],
    },
    location_assets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name_ar: { type: Type.STRING },
          name_en: { type: Type.STRING },
          description: { type: Type.STRING },
          location_prompt: { type: Type.STRING },
        },
        required: ["name_ar", "name_en", "location_prompt"],
      },
    },
    storybook: {
      type: Type.OBJECT,
      properties: {
        story_title: { type: Type.STRING },
        voiceover_tone_ar: { type: Type.STRING },
        voiceover_tone_en: { type: Type.STRING },
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scene_number: { type: Type.INTEGER },
              description_ar: { type: Type.STRING },
              description_en: { type: Type.STRING },
              visual_prompt_ar: { type: Type.STRING },
              visual_prompt_en: { type: Type.STRING },
              animation_prompt_ar: { type: Type.STRING },
              animation_prompt_en: { type: Type.STRING },
              narration_ar: { type: Type.STRING },
              narration_en: { type: Type.STRING },
              transition_ar: { type: Type.STRING },
              transition_en: { type: Type.STRING },
              technical_specs: {
                type: Type.OBJECT,
                properties: {
                  camera: { type: Type.STRING },
                  lens: { type: Type.STRING },
                  lighting: { type: Type.STRING },
                  aspect_ratio: { type: Type.STRING },
                },
              },
            },
            required: ["scene_number", "visual_prompt_en", "visual_prompt_ar", "animation_prompt_en", "animation_prompt_ar", "narration_ar", "narration_en", "transition_ar"],
          },
        },
      },
      required: ["scenes", "voiceover_tone_ar", "voiceover_tone_en"],
    },
    video: {
      type: Type.OBJECT,
      properties: {
        video_title: { type: Type.STRING },
        voiceover_tone_ar: { type: Type.STRING },
        voiceover_tone_en: { type: Type.STRING },
        full_video_prompt_ar: { type: Type.STRING },
        full_video_prompt_en: { type: Type.STRING },
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scene_number: { type: Type.INTEGER },
              action_description_ar: { type: Type.STRING },
              action_description_en: { type: Type.STRING },
              visual_prompt_ar: { type: Type.STRING },
              visual_prompt_en: { type: Type.STRING },
              animation_prompt_ar: { type: Type.STRING },
              animation_prompt_en: { type: Type.STRING },
              narration_ar: { type: Type.STRING },
              narration_en: { type: Type.STRING },
              transition_ar: { type: Type.STRING },
              transition_en: { type: Type.STRING },
              sound_style: { type: Type.STRING },
              technical_specs: {
                type: Type.OBJECT,
                properties: {
                  camera: { type: Type.STRING },
                  lens: { type: Type.STRING },
                  lighting: { type: Type.STRING },
                  aspect_ratio: { type: Type.STRING },
                },
              },
              tracks: {
                type: Type.OBJECT,
                properties: {
                  vfx: { type: Type.STRING },
                  motion_type: { type: Type.STRING },
                  sound_direction_ar: { type: Type.STRING },
                  sound_direction_en: { type: Type.STRING },
                },
              },
            },
            required: ["scene_number", "narration_ar", "narration_en", "transition_ar", "animation_prompt_ar", "animation_prompt_en", "sound_style"],
          },
        },
      },
      required: ["scenes", "voiceover_tone_ar", "voiceover_tone_en", "full_video_prompt_ar", "full_video_prompt_en"],
    },
    song: {
      type: Type.OBJECT,
      properties: {
        song_title: { type: Type.STRING },
        genre_description: { type: Type.STRING },
        music_generation_prompt: { type: Type.STRING },
        consistent_audio_vibe_ar: { type: Type.STRING },
        consistent_audio_vibe_en: { type: Type.STRING },
        bpm: { type: Type.STRING },
        instruments: { type: Type.STRING },
        lyrics_structure: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                section_type: { type: Type.STRING },
                lyrics_ar: { type: Type.STRING },
                lyrics_en_transliteration: { type: Type.STRING },
                musical_cues: { type: Type.STRING },
                visual_description_ar: { type: Type.STRING },
                visual_description_en: { type: Type.STRING },
                visual_prompt_ar: { type: Type.STRING },
                visual_prompt_en: { type: Type.STRING },
                animation_prompt_ar: { type: Type.STRING },
                animation_prompt_en: { type: Type.STRING },
                transition_ar: { type: Type.STRING },
                transition_en: { type: Type.STRING },
                technical_specs: {
                    type: Type.OBJECT,
                    properties: {
                        camera: { type: Type.STRING },
                        lens: { type: Type.STRING },
                        lighting: { type: Type.STRING },
                        aspect_ratio: { type: Type.STRING },
                    }
                }
             },
             required: ["section_type", "lyrics_ar", "musical_cues", "visual_description_ar", "visual_description_en", "visual_prompt_ar", "visual_prompt_en", "animation_prompt_ar", "animation_prompt_en", "transition_ar", "technical_specs"]
          }
        }
      },
      required: ["song_title", "music_generation_prompt", "lyrics_structure", "consistent_audio_vibe_ar", "consistent_audio_vibe_en"]
    }
  },
  required: ["analysis", "character_bible", "storybook", "video", "song"],
};

const QUESTIONS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question_ar: { type: Type.STRING },
          context_key: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["id", "question_ar", "context_key", "options"],
      },
    },
  },
  required: ["questions"],
};

export interface ImageData {
    mimeType: string;
    data: string;
}

export const generateAnalysisQuestions = async (
  concept: string,
  mode: GenerationMode,
  contentType: ContentType,
  style: string,
  images: ImageData[] = []
): Promise<Question[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Elite Visual Analysis Task:
    Creative Concept: "${concept}"
    Reference Images Provided: ${images.length}
    Objective: Extract specific visual details from images to ensure perfect transfer and continuity.
  `;

  const parts: any[] = [{ text: prompt }];
  images.forEach(img => {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: parts },
    config: {
      systemInstruction: ANALYSIS_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: QUESTIONS_SCHEMA,
    },
  });

  const parsed = JSON.parse(response.text || "{}");
  return parsed.questions || [];
};

export const generateUltraPrompt = async (
  concept: string,
  answers: Record<string, string>,
  mode: GenerationMode,
  aspectRatio: string,
  style: string,
  targetLanguage: string,
  targetDialect: string,
  targetTransition: string,
  storyType: string,
  images: ImageData[] = [],
  videoFormat: string = 'standard',
  videoResolution: string = '4K',
  musicGenre: string = 'Automatic'
): Promise<CombinedResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey });

  const qaString = Object.entries(answers).map(([q, a]) => `Detail Mapping: ${q} -> Source Value: ${a}`).join("\n");

  const userPrompt = `
    COMMAND: INITIATE PRODUCTION PHASE.
    CORE CONCEPT: ${concept}
    OBJECTIVE: Perform professional "Style & Detail Transfer" from provided images with advanced forensic LIP-SYNC and hyper-detailed CINEMATIC logic.
    ${qaString}
  `;

  const parts: any[] = [{ text: userPrompt }];
  images.forEach(img => {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: parts },
    config: {
      systemInstruction: FINAL_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.8,
      thinkingConfig: { thinkingBudget: 4096 },
    },
  });

  return JSON.parse(response.text || "{}") as CombinedResponse;
};

export const refineUltraPrompt = async (
  currentResponse: CombinedResponse,
  refinementInstruction: string,
  images: ImageData[] = [] 
): Promise<CombinedResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey });

  const promptText = `
    REFINEMENT COMMAND:
    INSTRUCTION: "${refinementInstruction}"
    Action: Perform surgery on existing prompts. Enforce forensic-level detail, strict Lip-Sync synchronization, and cinematic polishing in both AR and EN.
    CURRENT DATA: ${JSON.stringify(currentResponse)}
  `;

  const parts: any[] = [{ text: promptText }];
  images.forEach(img => {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: parts },
    config: {
      systemInstruction: FINAL_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 2048 },
    },
  });

  return JSON.parse(response.text || "{}") as CombinedResponse;
};

export const rewriteSinglePrompt = async (
  currentText: string,
  instruction: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `PROMPT: "${currentText}"\nINSTRUCTION: "${instruction}"`,
    config: {
      systemInstruction: "Upgrade this prompt to forensic professional standards. Preserve visual DNA and strictly optimize for technical detail and lip-sync synchronization by embedding narration where applicable.",
    },
  });

  return response.text || currentText;
};
