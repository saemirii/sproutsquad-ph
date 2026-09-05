import { GoogleGenAI } from "@google/genai";

// Shared AI Coach logic, used by both the local Express server (server.ts)
// and the Netlify Function (netlify/functions/ai-coach.mts).

interface AiCoachRequestBody {
  businessName?: string;
  category?: string;
  university?: string;
  metrics?: {
    revenue?: number;
    expenses?: number;
    profit?: number;
    profitMargin?: number;
    healthScore?: number;
  };
  recentOrders?: unknown[];
  recentExpenses?: unknown[];
  userQuestion?: string;
}

export interface AiCoachResult {
  status: number;
  body: Record<string, unknown>;
}

export async function getAiCoachAdvice(payload: AiCoachRequestBody): Promise<AiCoachResult> {
  const { businessName, category, university, metrics, recentOrders, recentExpenses, userQuestion } = payload;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      status: 200,
      body: {
        fallback: true,
        advice: "🌱 (AI Key offline) Rule-based Tip: Maintain a gross profit margin above 35% and record every supply trip to UP Diliman / Divisoria / Shopee to keep accurate cost-per-item calculations!",
      },
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemPrompt = `You are "Oliver the Sprout Owl" (and Frankie the Business Fox), the friendly, encouraging, and astute business coach for student-led small businesses in the Philippines on SproutSquad.
Your role:
- Speak in an approachable, warm, encouraging tone with occasional relatable Philippine student business context (e.g., campus pickups, GCash/Maya, balancing exams/acads with inventory, sourcing from Divisoria/Taytay/Shopee, packaging costs, stall fees).
- Provide practical, data-driven, step-by-step advice tailored directly to their numbers (Revenue, Expenses, Profit Margin, Stock, Health Score).
- Keep responses concise, scannable, and actionable with bullet points and clear takeaways.
- Always include 1 immediate actionable next step they can do in under 15 minutes.`;

    const prompt = `Student Business Overview:
- Name: ${businessName || "Student Business"}
- Campus / University: ${university || "Philippines Campus"}
- Category: ${category || "General Products"}
- Financial Performance:
  * Total Revenue: ₱${metrics?.revenue?.toLocaleString() || 0}
  * Total Expenses: ₱${metrics?.expenses?.toLocaleString() || 0}
  * Net Profit: ₱${metrics?.profit?.toLocaleString() || 0}
  * Profit Margin: ${metrics?.profitMargin || 0}%
  * Health Score: ${metrics?.healthScore || 0}/100
  * Recent Expense Breakdown: ${JSON.stringify(recentExpenses || [])}
  * Recent Orders Count: ${recentOrders?.length || 0}

User Question / Context:
"${userQuestion || "Analyze our current numbers and recommend 2-3 specific improvements for this week."}"

Provide an empathetic, sharp, and structured breakdown for this young student entrepreneur.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return {
      status: 200,
      body: {
        advice: response.text,
        fallback: false,
      },
    };
  } catch (error: any) {
    console.error("AI Coach error:", error);
    return {
      status: 500,
      body: {
        error: error?.message || "Failed to generate coaching insights",
        fallback: true,
      },
    };
  }
}
