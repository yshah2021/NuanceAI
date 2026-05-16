import { describe, it, expect } from 'vitest';
import { analyzeUserPerformance } from '../services/adaptiveEngine';
import { SessionResult } from '../types';

const makeSession = (metrics: { parameter: string; score: number }[]): SessionResult => ({
  date: new Date().toISOString(),
  weekId: 1,
  dayId: 1,
  overallScore: metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length,
  transcriptSummary: '',
  metrics: metrics.map(m => ({ parameter: m.parameter, score: m.score, feedback: '' })),
});

describe('analyzeUserPerformance', () => {
  it('returns empty arrays for no history', () => {
    const result = analyzeUserPerformance([]);
    expect(result.weak).toHaveLength(0);
    expect(result.strong).toHaveLength(0);
  });

  it('identifies the weakest metrics correctly', () => {
    const history = [
      makeSession([
        { parameter: 'Clarity of Thought', score: 90 },
        { parameter: 'Filler Word Usage', score: 30 },
        { parameter: 'Voice Control', score: 50 },
      ]),
    ];
    const result = analyzeUserPerformance(history);
    expect(result.weak[0]).toBe('Filler Word Usage');
    expect(result.strong[0]).toBe('Clarity of Thought');
  });

  it('averages scores across multiple sessions', () => {
    const history = [
      makeSession([
        { parameter: 'Clarity of Thought', score: 60 },
        { parameter: 'Voice Control', score: 40 },
      ]),
      makeSession([
        { parameter: 'Clarity of Thought', score: 80 },
        { parameter: 'Voice Control', score: 60 },
      ]),
    ];
    const result = analyzeUserPerformance(history);
    // Clarity avg = 70, Voice avg = 50 — Clarity should rank stronger
    expect(result.strong[0]).toBe('Clarity of Thought');
    expect(result.weak[0]).toBe('Voice Control');
  });

  it('limits analysis to the 10 most recent sessions', () => {
    const history = Array.from({ length: 15 }, (_, i) =>
      makeSession([{ parameter: 'Voice Control', score: i < 10 ? 80 : 10 }])
    );
    // The 5 old sessions with score 10 should be excluded; only last 10 (score 80) are used
    const result = analyzeUserPerformance(history);
    expect(result.strong[0]).toBe('Voice Control');
  });
});
