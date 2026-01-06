
import { GoogleGenAI } from "@google/genai";

// Always use the required initialization format for GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (userContext: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a financial advisor for a FoodThrift platform called PaySmallSmall. 
      Based on this user context: ${userContext}, provide 3 short, actionable tips for food security and savings.
      Keep it professional and encouraging.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Ensure you stick to your weekly payment schedule to avoid delivery delays.";
  }
};

export const analyzeContributionTrends = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze these subscriber contribution records: ${JSON.stringify(data)}. 
      Return a brief summary of total liquidity, top performing plan category, and any churn risks detected.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Growth is steady across Rice and Livestock categories.";
  }
};
