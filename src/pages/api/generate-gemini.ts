import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
let client: GoogleGenAI | null = null;

if (API_KEY) {
  client = new GoogleGenAI({ apiKey: API_KEY });
}

export const config = {
  api: {
    responseLimit: false,
  },
  maxDuration: 60, // Set timeout to 60 seconds
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!client) {
    return res.status(500).json({ error: "Gemini API Key not configured" });
  }

  try {
    const { text, customStructure } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Menggunakan model Gemma 3 27B sesuai permintaan contoh implementasi
    const modelId = "gemma-3-27b-it";

    const prompt = `
      You are a professional CV parser. 
      Extract information from the following CV text and format it into JSON.
      
      TARGET JSON STRUCTURE:
      ${customStructure}

      RULES:
      1. Use the EXACT keys and structure provided above.
      2. If a piece of information is missing, use "-" for strings or an empty array/object where appropriate.
      3. Return ONLY the raw JSON string.
      4. Do NOT include markdown formatting like \`\`\`json.
      
      CV TEXT:
      ${text}
    `;

    const response = await client.models.generateContent({
      model: modelId,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
      },
    });

    let outputText = response.text || "";

    // Clean markdown if AI includes it
    outputText = outputText.replaceAll("```json", "").replaceAll("```", "").trim();

    try {
      const parsed = JSON.parse(outputText);
      return res.status(200).json(parsed);
    } catch (parseError: any) {
      console.error("AI Parse Error:", outputText);
      return res
        .status(500)
        .json({ error: "AI returned invalid JSON structure: " + parseError.message });
    }
  } catch (error: any) {
    console.error("AI API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate JSON with AI" });
  }
}
