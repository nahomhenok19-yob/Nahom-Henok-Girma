import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAiComment(postContent: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `You are the AI assistant for melkahayu.nahom, a mood-based anonymous social media app. 
          Write a short, engaging, and positive comment for this post: "${postContent}". 
          Keep it under 15 words. Use emojis.`
        }]
      }]
    });
    return response.text;
  } catch (error) {
    console.error("AI Comment Error:", error);
    return "Amazing post! 🔥";
  }
}

export async function moderateContent(imageData: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        role: "user",
        parts: [
          {
            text: "Analyze this image. Does it contain nudity, explicit sexual content, or significant amounts of blood/violence? Also, estimate if the person in the image looks under 13 years old. Return a JSON object with keys: 'isSafe' (boolean), 'hasNudity' (boolean), 'hasBlood' (boolean), 'isUnder13' (boolean), and 'reason' (string)."
          },
          {
            inlineData: {
              data: imageData.split(',')[1],
              mimeType: "image/jpeg"
            }
          }
        ]
      }]
    });
    const text = response.text;
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { isSafe: true, hasNudity: false, hasBlood: false, isUnder13: false };
  } catch (error) {
    console.error("Moderation Error:", error);
    return { isSafe: true, hasNudity: false, hasBlood: false, isUnder13: false };
  }
}
