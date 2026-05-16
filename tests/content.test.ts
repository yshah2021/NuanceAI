import { describe, it, expect } from 'vitest';
import { isContentLocked } from '../utils/content';

describe('isContentLocked', () => {
  it('always unlocks for admin', () => {
    expect(isContentLocked({ username: 'a', role: 'admin' }, 3, 5)).toBe(false);
    expect(isContentLocked({ username: 'a', role: 'admin' }, 6, 7)).toBe(false);
  });

  it('always unlocks for premium', () => {
    expect(isContentLocked({ username: 'a', role: 'premium' }, 3, 5)).toBe(false);
    expect(isContentLocked({ username: 'a', role: 'premium' }, 6, 7)).toBe(false);
  });

  it('unlocks Week 1 Days 1–3 for free users', () => {
    expect(isContentLocked({ username: 'a', role: 'free' }, 1, 1)).toBe(false);
    expect(isContentLocked({ username: 'a', role: 'free' }, 1, 2)).toBe(false);
    expect(isContentLocked({ username: 'a', role: 'free' }, 1, 3)).toBe(false);
  });

  it('locks Week 1 Day 4+ for free users', () => {
    expect(isContentLocked({ username: 'a', role: 'free' }, 1, 4)).toBe(true);
    expect(isContentLocked({ username: 'a', role: 'free' }, 1, 7)).toBe(true);
  });

  it('locks all of Week 2+ for free users', () => {
    expect(isContentLocked({ username: 'a', role: 'free' }, 2, 1)).toBe(true);
    expect(isContentLocked({ username: 'a', role: 'free' }, 6, 7)).toBe(true);
  });
});
