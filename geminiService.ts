import { GoogleGenAI } from "@google/genai";
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const imageToBase64Part = (base64: string, mimeType: string = 'image/jpeg'): Part => {
  return {
    inlineData: {
      mimeType,
      data: base64,
    },
  };
};

export const generateAuditReport = async (
  myChannelScreenshot: string,
  competitorScreenshots: string[],
  template: string,
  language: string
): Promise<string> => {
  const allScreenshots = [myChannelScreenshot, ...competitorScreenshots];

  if (allScreenshots.length < 3) {
    throw new Error("Invalid number of screenshots provided. Expected your channel screenshot and at least 2 from competitors.");
  }
  
  if (!template || template.trim().length === 0) {
    throw new Error("An audit report template must be provided.");
  }
  
  const finalTemplate = template.replace('{{language}}', language);
  const promptPart: Part = { text: finalTemplate };
  const imageParts: Part[] = allScreenshots.map(img => imageToBase64Part(img));

  const contents = [promptPart, ...imageParts];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: contents },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate audit report from the AI model.");
  }
};