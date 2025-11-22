import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to get the AI client, ensuring we use the selected key if available
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeScript = async (scriptText: string): Promise<AnalysisResult> => {
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      protagonist: { type: Type.STRING, description: "The main character visually described" },
      threat: { type: Type.STRING, description: "The antagonist or threat visually described" },
      mood: { type: Type.STRING, description: "The emotional atmosphere (suspense, joy, terror)" },
      setting: { type: Type.STRING, description: "The environment/background" },
      suggestedTitle: { type: Type.STRING, description: "A short, punchy, click-bait style title (max 5 words)" },
      visualComposition: { type: Type.STRING, description: "Brief description of how the image should look" },
      imagePrompt: { type: Type.STRING, description: "A highly detailed prompt for an image generator. It MUST specify a close-up of the protagonist and the threat/conflict. It should mention lighting, style (photorealistic or cinematic), and facial expressions matching the mood." },
    },
    required: ["protagonist", "threat", "mood", "setting", "suggestedTitle", "visualComposition", "imagePrompt"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the following text to create a YouTube Thumbnail plan. 
    Text: "${scriptText}"
    
    Rules:
    1. Identify the visual centerpieces (Protagonist & Threat).
    2. The imagePrompt must be extremely descriptive for an AI image generator. 
    3. Ensure the prompt specifies 16:9 aspect ratio, high contrast, and 4k quality.
    4. Do not invent elements not implied by the text.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as AnalysisResult;
  }
  throw new Error("Failed to parse analysis result");
};

export const generateThumbnailImage = async (prompt: string): Promise<string> => {
  const ai = getAiClient();

  // Using Imagen 3 via the generateImages API as per prompt instructions for professional results
  // Fallback to 2.5-flash-image handled if this model isn't available to the key, 
  // but aiming for quality first.
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt + " , youtube thumbnail style, 8k resolution, highly detailed, cinematic lighting, masterpiece",
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      },
    });

    const base64String = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64String) throw new Error("No image generated");
    return `data:image/jpeg;base64,${base64String}`;

  } catch (error) {
    console.warn("Imagen model failed or not available, falling back to Gemini Flash Image", error);
    
    // Fallback to gemini-2.5-flash-image
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt + " , youtube thumbnail style, 8k resolution, highly detailed, cinematic lighting, masterpiece. Aspect Ratio 16:9." }]
      },
    });

    // Extract image from multimodal response
    for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate image with fallback model");
  }
};
