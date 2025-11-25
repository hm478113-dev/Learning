import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CombinedResponse, GenerationMode, Question, ContentType } from "../types";

const ANALYSIS_SYSTEM_PROMPT = `
You are the "Ultra Enterprise System - Analysis Module".
Your goal is to analyze a user's initial creative concept (and any provided images) and generate 3-5 CRITICAL clarifying questions in ARABIC.

Based on the User's selected Content Type (Image vs Story vs Video) AND the chosen Art Style, your questions must focus on specific technical aspects:

IF IMAGE INPUT IS PROVIDED:
- Analyze the style, characters, and mood of the uploaded images.
- Ask questions to confirm if the user wants to maintain specific elements from these images (e.g., "Should the character keep the same clothing?", "Do you want to mimic this exact lighting?").

IF IMAGE:
- Ask about Camera Lens (Wide, Telephoto, Macro).
- Ask about Lighting Style (Rembrandt, Neon, Natural).
- Ask about Composition (Rule of thirds, Center).

IF STORY:
- Ask about the Narrative Arc (Ending, Conflict).
- Ask about Character Development throughout the story.
- Ask about the Setting changes.
- **Check if it is a Dialogue Story**: If the concept implies conversation, ask about the interaction style between characters.

IF VIDEO:
- Ask about Camera Movement (Dolly zoom, Handheld, Drone).
- Ask about Pacing (Slow motion, Fast cut).
- Ask about Sound Design/Atmosphere.

Output must be a JSON object containing an array of questions.
Each question should be short, professional, and direct in Arabic.
`;

const FINAL_SYSTEM_PROMPT = `
You are the "Ultra Enterprise System Prompt" - Final Output Module.
You operate in DUAL LANGUAGE: ARABIC (AR) and ENGLISH (EN).

MANDATORY RULES:
1. Character Consistency: Create a "Character Bible" with a MASTER PROMPT for the main character. 
   - **IF IMAGES ARE PROVIDED**: Use the images as the SOURCE OF TRUTH for the character's appearance (hair, eyes, clothing, style). Describe them EXACTLY as seen in the images.
2. Location Consistency: Identify FIXED LOCATIONS (recurring places) and provide a MASTER PROMPT for each.
   - **IF IMAGES ARE PROVIDED**: If the images depict a setting, use that as the base for the location prompts.
3. Storybook Structure: 
   - Divide story into SCENES.
   - For EACH scene, provide an "Image Prompt" AND an "Animation Prompt".
   - **TRANSITIONS**: For EACH scene, specify the "Transition" to the next scene (e.g., Fast Cut, Slow Fade, Dissolve, Wipe, Whip Pan). State this in both Arabic and English.
   - **LIP-SYNC / DIALOGUE INTEGRATION**: 
     - In the "animation_prompt_en", you MUST explicitly include the character's dialogue/narration: "Format: [Describe Motion]... Character [Name] speaking: '[English Text]'".
     - In the "animation_prompt_ar", you MUST explicitly include the character's dialogue/narration: "Format: [Describe Motion]... الشخصية [الاسم] تتحدث: '[النص العربي]'".
     - This is crucial for video generation tools to sync lip movement.
   - **NARRATION OR DIALOGUE**: 
     - **DEFAULT**: Provide a concise, emotional Voiceover Script (Narration). It should be SIMPLE and SHORT (one powerful sentence).
     - **IF DIALOGUE STORY (قصة حوارية)**: If the user explicitly asks for a dialogue story or the concept implies it, format the 'narration' field STRICTLY as a dialogue script (e.g., "Character A: [Line]... Character B: [Line]...").
     - The text must be sequential and tell a coherent story (AR & EN).
4. Technical Depth: Define Camera, Lens, Lighting, ISO, Composition for every scene.
5. Voiceover Tone: Define the specific tone/mood for the narrator/actors at the start.
6. **Video Constraints**: 
   - Ensure every scene action is designed to be **MAX 5 SECONDS** in duration.
   - **CRITICAL FOR VIDEO**: The Narration/Voiceover text for each scene MUST be extremely short to fit within the 5-second limit (Maximum 10-12 words).
7. **Style Adherence**: The generated prompts MUST strictly adhere to the User's selected Art Style.

Input:
- Initial Concept
- Images (Optional visual reference)
- Q&A History
- Target Aspect Ratio
- Target Art Style
- Target Language
- Target Dialect (if Arabic)

Output:
Strict JSON object matching the schema.
`;

const REFINE_SYSTEM_PROMPT = `
You are the "Ultra Enterprise System - Refinement Module".
Your task is to EDIT and REFINE an existing "CombinedResponse" JSON object based on specific user instructions.

INPUT:
1. Current JSON Data (Character Bible, Scenes, etc.)
2. User's Modification Request (e.g., "Change the main character to a robot", "Make the ending sadder", "Change lighting to Cyberpunk").

RULES:
1. **Maintain JSON Structure**: You MUST output the exact same JSON schema as the input. Do not add or remove top-level keys.
2. **Apply Changes Intelligently**: 
   - If the user changes a character feature, update the "Character Bible" AND ALL relevant Scene Prompts.
   - If the user changes the setting, update "Location Assets" AND relevant Scene Prompts.
   - If the user changes the style, update "Art Direction" and Technical Specs.
   - If the user changes narration, rewrite the narration fields.
3. **Preserve Unchanged Parts**: Do not randomly rewrite parts that are unrelated to the user's request.
4. **Consistency**: Ensure the new changes are propagated consistently across English and Arabic fields.
5. **Language**: Keep the output bilingual (AR/EN) as per the schema.

Output:
Strict JSON object matching the existing schema.
`;

const REWRITE_SYSTEM_PROMPT = `
You are the "Ultra Enterprise System - Prompt Rewriter".
Your task is to rewrite a specific prompt based on user instructions.
Input: A single text prompt (Image Prompt, Animation Prompt, or Script).
User Instruction: Specific change request (e.g., "Add rain", "Remove the cat", "Make it cinematic").
Output: ONLY the rewritten prompt text. No JSON. No explanations.
`;

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
        },
        required: ["id", "question_ar", "context_key"],
      },
    },
  },
  required: ["questions"],
};

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
             },
             required: ["name", "details_ar", "details_en", "character_prompt"]
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
          location_prompt: { type: Type.STRING, description: "The master prompt to generate this location consistently" },
        },
        required: ["name_ar", "name_en", "location_prompt"],
      },
    },
    storybook: {
      type: Type.OBJECT,
      properties: {
        story_title: { type: Type.STRING },
        voiceover_tone_ar: { type: Type.STRING, description: "The required tone for the narrator (Arabic)" },
        voiceover_tone_en: { type: Type.STRING, description: "The required tone for the narrator (English)" },
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
              animation_prompt_ar: { type: Type.STRING, description: "Must include 'الشخصية تتحدث: [Arabic Dialogue]' for lip-sync" },
              animation_prompt_en: { type: Type.STRING, description: "Must include 'Character speaking: [English Dialogue]' for lip-sync" },
              narration_ar: { type: Type.STRING, description: "The story script text (Narration OR Dialogue) for this scene (Arabic)" },
              narration_en: { type: Type.STRING, description: "The story script text (Narration OR Dialogue) for this scene (English)" },
              transition_ar: { type: Type.STRING, description: "The transition to the next scene (e.g. Fast Cut, Slow Fade)" },
              transition_en: { type: Type.STRING, description: "The transition to the next scene in English" },
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
              animation_prompt_ar: { type: Type.STRING, description: "Must include 'الشخصية تتحدث: [Arabic Dialogue]' for lip-sync" },
              animation_prompt_en: { type: Type.STRING, description: "Must include 'Character speaking: [English Dialogue]' for lip-sync" },
              narration_ar: { type: Type.STRING },
              narration_en: { type: Type.STRING },
              transition_ar: { type: Type.STRING, description: "The transition to the next scene (e.g. Fast Cut, Slow Fade)" },
              transition_en: { type: Type.STRING, description: "The transition to the next scene in English" },
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
            required: ["scene_number", "narration_ar", "narration_en", "transition_ar", "animation_prompt_ar", "animation_prompt_en"],
          },
        },
      },
      required: ["scenes", "voiceover_tone_ar", "voiceover_tone_en"],
    },
  },
  required: ["analysis", "character_bible", "storybook", "video"],
};

export interface ImageData {
    mimeType: string;
    data: string;
}

// Step 1: Analyze and Ask Questions
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
    Analyze this concept: "${concept}"
    Mode: ${mode}
    Target Content Type: ${contentType}
    Preferred Art Style: ${style}
    
    ${images.length > 0 ? `I have uploaded ${images.length} reference images. Please assume these images depict key characters, settings, or styles I want to use in my story.` : ''}

    The user wants to generate high-end visual content.
    What information is missing to achieve a perfect "${style}" look for a ${contentType}?
    Generate 3 to 5 questions in Arabic to clarify the details suited for this specific style and content type.
  `;

  // Construct parts with text and images
  const parts: any[] = [{ text: prompt }];
  images.forEach(img => {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: 'user', parts: parts }],
    config: {
      systemInstruction: ANALYSIS_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: QUESTIONS_SCHEMA,
    },
  });

  const parsed = JSON.parse(response.text || "{}");
  return parsed.questions || [];
};

// Step 2: Generate Final Output
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
  images: ImageData[] = []
): Promise<CombinedResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey });

  // Format Q&A for the prompt
  const qaString = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join("\n\n");

  const userPrompt = `
    EXECUTE PHASE 2 OUTPUT GENERATION.
    
    MODE: ${mode}
    REQUIRED ASPECT RATIO: ${aspectRatio}
    REQUIRED ART STYLE: ${style}
    PREFERRED TRANSITION STYLE: ${targetTransition}
    TARGET NARRATION LANGUAGE: ${targetLanguage}
    TARGET DIALECT (If Arabic): ${targetDialect}
    REQUIRED STORY TYPE: ${storyType}
    
    INITIAL CONCEPT:
    ${concept}
    
    ${images.length > 0 ? `VISUAL REFERENCES: I have attached ${images.length} images. Use these as the primary reference for Character appearance and Environment visual style.` : ''}

    CLARIFICATION Q&A HISTORY:
    ${qaString}

    Task:
    1. Create a definitive Character Bible with a Master Prompt.
    2. Identify Fixed Locations and write Master Prompts for them.
    3. Generate Storybook & Video prompts (Arabic & English) with Animation Prompts for every scene.
    4. Write the Voiceover/Narration Script (Ar & En) for each scene. 
       - **CRITICAL**: The 'narration_ar' MUST be written in the **${targetDialect}** dialect if the target language is Arabic. (e.g., if Egyptian, use words like "يا صاحبي", "ده", "كده").
       - **STORY TYPE ENFORCEMENT**:
         - IF "dialogue": Format the text STRICTLY as a dialogue script (e.g., "Character A: [Line]... Character B: [Line]"). The scene MUST focus on interaction.
         - IF "narrative": Use concise, emotional narration (short sentences) describing the scene/feelings.
       - **FOR VIDEO**: Keep narration VERY SHORT (max 10-12 words) to fit the 5-second scene duration.
    5. Define the Voiceover Tone.
    6. ENSURE the Aspect Ratio "${aspectRatio}" is correctly labelled in the technical specs for ALL scenes.
    7. **FOR VIDEO CONTENT**: Ensure every scene action is designed to be **MAX 5 SECONDS** in duration.
    8. **TRANSITIONS**: Use "${targetTransition}" as the primary transition style between scenes, unless the narrative demands a specific effect (e.g. Fade Out at the end).
    9. **STYLE ENFORCEMENT**: Ensure all visual descriptions strictly match the "${style}" aesthetic.
    10. **LIP-SYNC IN ANIMATION PROMPT**: 
        - Ensure the English Animation Prompt includes "Character speaking: '[English Dialogue]'"
        - Ensure the Arabic Animation Prompt includes "الشخصية تتحدث: '[Arabic Dialogue]'"
        so the lips move in sync with the narration in either language.
  `;

  // Construct parts with text and images
  const parts: any[] = [{ text: userPrompt }];
  images.forEach(img => {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: 'user', parts: parts }],
    config: {
      systemInstruction: FINAL_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.7,
      thinkingConfig: mode === GenerationMode.ULTRA_EXPERT ? { thinkingBudget: 1024 } : undefined,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text) as CombinedResponse;
};

// Step 3: Refine Existing Output
export const refineUltraPrompt = async (
  currentResponse: CombinedResponse,
  refinementInstruction: string
): Promise<CombinedResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    CURRENT DATA (JSON):
    ${JSON.stringify(currentResponse)}

    USER INSTRUCTION (Change Request):
    "${refinementInstruction}"

    TASK:
    Update the JSON data to satisfy the User Instruction.
    Ensure all prompts (Image, Animation, Character) are updated to reflect the change.
    Maintain strict consistency.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: REFINE_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text) as CombinedResponse;
};

// Step 4: Rewrite Single Prompt
export const rewriteSinglePrompt = async (
  currentText: string,
  instruction: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    CURRENT PROMPT:
    "${currentText}"

    USER INSTRUCTION:
    "${instruction}"

    REWRITE THE PROMPT:
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: REWRITE_SYSTEM_PROMPT,
    },
  });

  return response.text || currentText;
};