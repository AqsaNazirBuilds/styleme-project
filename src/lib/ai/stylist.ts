import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_CONTEXT = `You are StyleMe's AI Stylist, a warm and knowledgeable fashion advisor. Give concise, practical styling advice. Keep responses to 2-4 sentences unless the user asks for detail. Do not mention you are an AI model or which company made you.`;

export async function generateStylistReply(
  conversationHistory: { role: string; content: string }[]
): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const contents = conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_CONTEXT,
      },
    });

    return response.text?.trim() ?? null;
  } catch (error) {
    console.error("AI Stylist error:", error);
    return null;
  }
}