import { SessionResult } from '../types';

export const MOCK_RECENT_SESSIONS = [
  { date: '2023-10-25', score: 65, label: 'W1D1' },
  { date: '2023-10-26', score: 72, label: 'W1D2' },
  { date: '2023-10-27', score: 68, label: 'W1D3' },
  { date: '2023-10-28', score: 78, label: 'W1D4' },
  { date: '2023-10-30', score: 82, label: 'W1D6' },
];

const generateMockSession = (week: number, day: number, score: number, dateStr: string): SessionResult => ({
  date: dateStr,
  weekId: week,
  dayId: day,
  overallScore: score,
  transcriptSummary: "Mock session summary",
  metrics: [],
  feedbackAnalysis: {
    strengths: ["Clear tone"],
    improvements: ["Pacing"],
    tip: "Keep practicing",
    tone: "Good"
  }
});

export const MOCK_LONG_TERM_HISTORY: SessionResult[] = [
  generateMockSession(1, 1, 55, '2023-09-01'),
  generateMockSession(1, 2, 58, '2023-09-02'),
  generateMockSession(1, 3, 62, '2023-09-04'),
  generateMockSession(1, 4, 60, '2023-09-05'),
  generateMockSession(1, 5, 65, '2023-09-06'),
  generateMockSession(1, 6, 64, '2023-09-08'),
  generateMockSession(1, 7, 70, '2023-09-09'),

  generateMockSession(2, 1, 68, '2023-09-11'),
  generateMockSession(2, 2, 72, '2023-09-12'),
  generateMockSession(2, 3, 71, '2023-09-14'),
  generateMockSession(2, 4, 75, '2023-09-15'),
  generateMockSession(2, 5, 74, '2023-09-16'),
  generateMockSession(2, 6, 78, '2023-09-18'),
  generateMockSession(2, 7, 76, '2023-09-19'),

  generateMockSession(3, 1, 75, '2023-09-21'),
  generateMockSession(3, 2, 79, '2023-09-22'),
  generateMockSession(3, 3, 82, '2023-09-24'),
  generateMockSession(3, 4, 80, '2023-09-25'),
  generateMockSession(3, 5, 84, '2023-09-26'),
  generateMockSession(3, 6, 85, '2023-09-28'),
];
