
export type SessionMode = 'coaching' | 'sparring' | 'interview' | 'negotiation' | 'podcast';

export type UserRole = 'free' | 'premium' | 'admin';

export interface User {
  username: string;
  role: UserRole;
}

export interface Lesson {
  day: number;
  focus: string;
  task: string;
  description?: string;
  sessionMode?: SessionMode;
  completed: boolean;
  aiContext?: string; // Specific instructions for the AI for this lesson
}

export interface WeekPlan {
  id: number;
  title: string;
  theme: string;
  coreSkills: string[];
  lessons: Lesson[];
  evaluationFocus: string[];
  comingSoon?: boolean;
}

export interface EvaluationMetric {
  parameter: string;
  score: number; // 0-100
  feedback: string;
  actionableAdvice?: string; // Specific advice for this metric
  nextSessionGoal?: string; // Specific goal for next time
}

export interface ResourceRecommendation {
  type: 'Watch' | 'Read' | 'Listen' | 'Practice';
  title: string;
  description: string;
}

export interface TranscriptHighlight {
  quote: string;
  feedback: string;
  suggestion: string;
}

export interface FeedbackAnalysis {
  strengths: string[];
  improvements: string[];
  tip: string;
  tone: string;
  recommendedResources?: ResourceRecommendation[];
  transcriptHighlights?: TranscriptHighlight[];
}

export interface SessionResult {
  date: string;
  weekId: number;
  dayId: number;
  transcriptSummary: string; // Kept for backward compatibility or simple view
  feedbackAnalysis?: FeedbackAnalysis; // New structured feedback
  metrics: EvaluationMetric[];
  overallScore: number;
}

export interface UserState {
  currentWeek: number;
  currentDay: number;
  sessionHistory: SessionResult[];
}

// --- Adaptive Practice Types ---

export interface AdaptiveDrill {
  id: string;
  title: string;
  goal: string;
  estimatedMinutes: number;
  aiPersona: string;
  taskPrompt: string;
  aiContext: string; // The full system instruction for the AI
  primaryMetrics: string[]; // Metrics to evaluate
  completed: boolean;
}

export interface AdaptivePlan {
  date: string;
  focusAreas: string[];
  drills: AdaptiveDrill[];
  estimatedTotalMinutes: number;
  weaknessAnalysis: string;
}
