import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key is not configured");
}

export const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});
