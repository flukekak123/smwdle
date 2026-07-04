import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { emptyStats, applyResult } from '../src/lib/statsEngine.js';
import type { GameResult } from '../src/lib/types.js';
import { statsArb, gameResultArb } from './generators.js';

function solved(date: string, guesses = 3): GameResult {
  return {
    puzzleNumber: 1,
    date,
    guesses: Array.from({ length: guesses }, () => ({ monsterId: 1, attributes: [], correct: false })),
    solved: true,
  };
}

describe('applyResult', () => {
  it('is idempotent per date (re-applying the same solved date is a no-op)', () => {
    fc.assert(
      fc.property(statsArb, gameResultArb, (stats, result) => {
        const once = applyResult(stats, result);
        const twice = applyResult(once, result);
        expect(twice).toEqual(once);
      }),
    );
  });

  it('maintains currentStreak <= maxStreak', () => {
    fc.assert(
      fc.property(gameResultArb, (result) => {
        const next = applyResult(emptyStats(), result);
        expect(next.currentStreak).toBeLessThanOrEqual(next.maxStreak);
      }),
    );
  });

  it('does not count unsolved results', () => {
    const s = emptyStats();
    const unsolved: GameResult = { ...solved('2026-01-01'), solved: false };
    expect(applyResult(s, unsolved)).toEqual(s);
  });

  it('increments streak on consecutive days, resets after a gap', () => {
    let s = emptyStats();
    s = applyResult(s, solved('2026-01-01'));
    expect(s.currentStreak).toBe(1);
    s = applyResult(s, solved('2026-01-02'));
    expect(s.currentStreak).toBe(2);
    s = applyResult(s, solved('2026-01-04')); // gap
    expect(s.currentStreak).toBe(1);
    expect(s.maxStreak).toBe(2);
    expect(s.played).toBe(3);
  });

  it('records the guess distribution', () => {
    let s = emptyStats();
    s = applyResult(s, solved('2026-01-01', 4));
    s = applyResult(s, solved('2026-01-02', 4));
    expect(s.distribution[4]).toBe(2);
  });
});
