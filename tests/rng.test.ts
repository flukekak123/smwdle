import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { mulberry32, seededShuffle, safeModulo } from '../src/lib/rng.js';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const a = mulberry32(seed);
        const b = mulberry32(seed);
        for (let i = 0; i < 5; i++) expect(a()).toBe(b());
      }),
    );
  });

  it('yields values in [0, 1)', () => {
    const rand = mulberry32(123);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('seededShuffle', () => {
  it('is deterministic (same input + seed => same output)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), fc.integer(), (arr, seed) => {
        expect(seededShuffle(arr, seed)).toEqual(seededShuffle(arr, seed));
      }),
    );
  });

  it('is a permutation (preserves the multiset of elements)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), fc.integer(), (arr, seed) => {
        const shuffled = seededShuffle(arr, seed);
        expect(shuffled.length).toBe(arr.length);
        expect([...shuffled].sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b));
      }),
    );
  });
});

describe('safeModulo', () => {
  it('returns a value in [0, base)', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer({ min: 1, max: 1000 }), (n, base) => {
        const r = safeModulo(n, base);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(base);
      }),
    );
  });

  it('throws for non-positive base', () => {
    expect(() => safeModulo(5, 0)).toThrow();
    expect(() => safeModulo(5, -3)).toThrow();
  });
});
