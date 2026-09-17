import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStyleExplanation(params: {
  items: { name: string; category: string; color: string }[];
  occasion: string;
  style: string;
  score: number;
}): Promise<{ explanation: string; tips: string } | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null; // signals caller to use dev fallback
  }

  const itemList = params.items.map((i) => `${i.color} ${i.name} (${i.category})`).join(", ");

  const prompt = `You are a fashion stylist. A user is going to a "${params.occasion}" occasion and wants a "${params.style}" look. Their outfit is: ${itemList}. This outfit has a compatibility score of ${params.score}%.

Respond ONLY with valid JSON, no markdown formatting, in this exact shape:
{"explanation": "1-2 sentences on why this combination works", "tips": "1 short styling tip"}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text?.trim() ?? "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.explanation !== "string" || typeof parsed.tips !== "string") {
      return null;
    }

    return { explanation: parsed.explanation, tips: parsed.tips };
  } catch (error) {
    console.error("Gemini error:", error);
    return null;
  }
}