import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { encodeShare } from '../src/lib/shareEncoder.js';
import { evaluate } from '../src/lib/guessEvaluator.js';
import type { GameResult } from '../src/lib/types.js';
import { SITE_URL } from '../src/lib/types.js';
import { monstersArb, gameResultArb } from './generators.js';

const EMOJI_ROW = /^[\u{1F7E9}\u{2B1B}\u{1F53C}\u{1F53D}\u{1F7E8}]+$/u; // 🟩 ⬛ 🔼 🔽 🟨

describe('encodeShare', () => {
  it('is deterministic for a given result', () => {
    fc.assert(
      fc.property(gameResultArb, (result) => {
        expect(encodeShare(result)).toBe(encodeShare(result));
      }),
    );
  });

  it('is spoiler-free: header + emoji-only rows + url, no monster text', () => {
    fc.assert(
      fc.property(monstersArb(2, 12), (pool) => {
        const answer = pool[0]!;
        const guesses = pool.slice(1).map((g) => evaluate(g, answer));
        guesses.push(evaluate(answer, answer)); // winning guess
        const result: GameResult = {
          puzzleNumber: 42,
          date: '2026-07-03',
          guesses,
          solved: true,
        };
        const lines = encodeShare(result).split('\n');
        expect(lines[0]!.startsWith('Smwdle #')).toBe(true);
        expect(lines[lines.length - 1]).toBe(SITE_URL);
        // Every guess row must be emoji-only → no monster names/values can leak.
        for (let i = 1; i < lines.length - 1; i++) {
          expect(EMOJI_ROW.test(lines[i]!)).toBe(true);
        }
      }),
    );
  });

  it('emits one emoji row per guess, each with the guess’s cell count', () => {
    fc.assert(
      fc.property(monstersArb(2, 8), (pool) => {
        const answer = pool[0]!;
        const guesses = pool.slice(1).map((g) => evaluate(g, answer));
        const result: GameResult = {
          puzzleNumber: 1,
          date: '2026-01-01',
          guesses,
          solved: false,
        };
        const lines = encodeShare(result).split('\n');
        // header + N rows + footer url
        expect(lines.length).toBe(guesses.length + 2);
        for (let i = 0; i < guesses.length; i++) {
          const emojiCount = [...lines[i + 1]!].length; // spread counts code points
          expect(emojiCount).toBe(guesses[i]!.attributes.length);
        }
      }),
    );
  });
});
