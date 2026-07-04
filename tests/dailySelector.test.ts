import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getDailyMonster, getPuzzleNumber, daysSinceEpoch } from '../src/lib/dailySelector.js';
import { monstersArb, dateArb } from './generators.js';

describe('daysSinceEpoch / getPuzzleNumber', () => {
  it('epoch day is 0 / puzzle #1', () => {
    const epochDay = new Date(2026, 0, 1);
    expect(daysSinceEpoch(epochDay)).toBe(0);
    expect(getPuzzleNumber(epochDay)).toBe(1);
  });

  it('puzzle number is always >= 1 (pre-epoch clamps)', () => {
    fc.assert(
      fc.property(dateArb, (d) => {
        expect(getPuzzleNumber(d)).toBeGreaterThanOrEqual(1);
      }),
    );
  });
});

describe('getDailyMonster', () => {
  it('is deterministic: same date + pool => same monster (PBT-03 invariant)', () => {
    fc.assert(
      fc.property(monstersArb(1, 20), dateArb, (pool, date) => {
        expect(getDailyMonster(date, pool)).toEqual(getDailyMonster(date, pool));
      }),
    );
  });

  it('always returns a member of the pool', () => {
    fc.assert(
      fc.property(monstersArb(1, 20), dateArb, (pool, date) => {
        const picked = getDailyMonster(date, pool);
        expect(pool.some((m) => m.id === picked.id)).toBe(true);
      }),
    );
  });

  it('no repeat within a full pool cycle (every monster appears once)', () => {
    fc.assert(
      fc.property(monstersArb(1, 20), fc.integer({ min: -50, max: 50 }), (pool, start) => {
        const seen = new Set<number>();
        for (let i = 0; i < pool.length; i++) {
          const date = new Date(2026, 0, 1 + start + i);
          seen.add(getDailyMonster(date, pool).id);
        }
        expect(seen.size).toBe(pool.length);
      }),
    );
  });

  it('throws on an empty pool', () => {
    expect(() => getDailyMonster(new Date(2026, 0, 1), [])).toThrow();
  });
});
