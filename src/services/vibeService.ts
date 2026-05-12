import { GoogleGenAI, Type } from "@google/genai";
import { VibeType } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function parseVibeFromMood(mood: string): Promise<VibeType> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Determine which of the following music vibes best matches this mood description: "${mood}". 
      Available vibes: "Rock", "Chill", "Cyberpunk", "Noir".
      Return ONLY the name of the vibe in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibe: {
              type: Type.STRING,
              enum: ["Rock", "Chill", "Cyberpunk", "Noir"],
            },
          },
          required: ["vibe"],
        },
      },
    });

    const result = JSON.parse(response.text || '{"vibe": "Default"}');
    return (result.vibe as VibeType) || 'Default';
  } catch (error) {
    console.error("Error parsing vibe:", error);
    return 'Default';
  }
}
