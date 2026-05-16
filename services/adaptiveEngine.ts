import { GoogleGenAI, Type } from '@google/genai';
import { SessionResult, AdaptivePlan } from '../types';
import { SCORING_RUBRICS } from '../constants';

// Analyze user history to find weak and strong metrics
export const analyzeUserPerformance = (history: SessionResult[]) => {
  if (!history || history.length === 0) return { weak: [], strong: [], recent: [] };

  // 1. Flatten all metrics from last 10 sessions
  const recentSessions = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  
  const metricMap: Record<string, { total: number, count: number }> = {};

  recentSessions.forEach(session => {
    session.metrics.forEach(m => {
      // Normalize parameter names if needed
      const key = m.parameter; 
      if (!metricMap[key]) metricMap[key] = { total: 0, count: 0 };
      metricMap[key].total += m.score;
      metricMap[key].count += 1;
    });
  });

  // 2. Calculate averages
  const averages = Object.keys(metricMap).map(key => ({
    metric: key,
    avg: metricMap[key].total / metricMap[key].count
  }));

  // 3. Sort (Ascending = Weakest first)
  averages.sort((a, b) => a.avg - b.avg);

  return {
    weak: averages.slice(0, 3).map(a => a.metric), // Bottom 3
    strong: averages.slice(-3).map(a => a.metric).reverse(), // Top 3
    recentLessons: recentSessions.map(s => `Week ${s.weekId} Day ${s.dayId}`).join(', ')
  };
};

export const generateDailyPlan = async (history: SessionResult[]): Promise<AdaptivePlan> => {
  const profile = analyzeUserPerformance(history);
  
  // If no history, return a generic onboarding plan
  if (profile.weak.length === 0) {
    return {
      date: new Date().toISOString(),
      focusAreas: ["Baseline Assessment"],
      weaknessAnalysis: "Welcome! Since you're new, we'll start with a general assessment.",
      estimatedTotalMinutes: 5,
      drills: [{
        id: "onboarding_01",
        title: "Baseline Chat",
        goal: "Establish your vocal baseline",
        estimatedMinutes: 3,
        aiPersona: "Friendly Guide",
        taskPrompt: "Introduce yourself and tell me why you want to improve your communication.",
        aiContext: "ROLE: Friendly Guide. BEHAVIOR: Ask open-ended questions about the user's background. Keep it light.",
        primaryMetrics: ["Clarity of Thought", "Voice Control"],
        completed: false
      }]
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const availableMetrics = Object.keys(SCORING_RUBRICS).join(', ');

  const prompt = `
    You are an expert communication curriculum designer for an app called "Nuance AI".
    
    USER PROFILE:
    - Weakest Metrics (Needs Improvement): ${profile.weak.join(', ')}
    - Strongest Metrics: ${profile.strong.join(', ')}
    - Recent Activity: ${profile.recentLessons}
    
    TASK:
    Generate a personalized "Daily Practice Mix" containing 2 distinct micro-drills (2-5 mins each) to address the user's weaknesses.
    
    REQUIREMENTS:
    1. Drills must be actionable roleplays or exercises, not just "talk to me".
    2. Create a specific "AI Context" string for each drill that instructs the AI how to behave (e.g., "Interrupt frequently", "Be a stubborn negotiator").
    3. The "weaknessAnalysis" should be a 1-sentence supportive insight about why these drills were chosen.
    4. Select 2-3 "primaryMetrics" from the available list that fit the drill.
    
    Available Metrics: ${availableMetrics}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedTotalMinutes: { type: Type.NUMBER },
            weaknessAnalysis: { type: Type.STRING },
            drills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  goal: { type: Type.STRING },
                  estimatedMinutes: { type: Type.NUMBER },
                  aiPersona: { type: Type.STRING },
                  taskPrompt: { type: Type.STRING },
                  aiContext: { type: Type.STRING },
                  primaryMetrics: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    const planData = JSON.parse(response.text ?? '');

    return {
      date: new Date().toISOString(),
      focusAreas: planData.focusAreas || profile.weak,
      drills: planData.drills.map((d: any) => ({ ...d, completed: false })),
      estimatedTotalMinutes: planData.estimatedTotalMinutes || 10,
      weaknessAnalysis: planData.weaknessAnalysis || "Here is a personalized plan based on your recent performance."
    };

  } catch (error) {
    console.error("Failed to generate adaptive plan", error);
    // Fallback plan if AI fails
    return {
      date: new Date().toISOString(),
      focusAreas: profile.weak,
      estimatedTotalMinutes: 5,
      weaknessAnalysis: "We encountered an issue generating a custom plan, so here is a standard reinforcement drill.",
      drills: [{
        id: "fallback_01",
        title: "Freestyle Practice",
        goal: "Practice your core skills",
        estimatedMinutes: 5,
        aiPersona: "Supportive Coach",
        taskPrompt: "Discuss a recent challenge you faced.",
        aiContext: "ROLE: Supportive Coach. BEHAVIOR: Listen and ask clarifying questions.",
        primaryMetrics: profile.weak.length > 0 ? profile.weak : ["Clarity of Thought"],
        completed: false
      }]
    };
  }
};
