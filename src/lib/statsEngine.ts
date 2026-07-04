import type { GameResult, Stats } from './types.js';

export function emptyStats(): Stats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastSolvedDate: null,
    distribution: {},
  };
}

/** Whole-day index for a 'YYYY-MM-DD' date string. */
function dateToDays(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y!, m! - 1, d!) / 86_400_000);
}

/**
 * Fold a solved game into the stats.
 * - Only solved results count.
 * - Idempotent per date: re-applying the same solved date is a no-op.
 * - currentStreak increments only when the previous solved date is the immediately
 *   preceding calendar day; otherwise it resets to 1.
 */
export function applyResult(prev: Stats, result: GameResult): Stats {
  if (!result.solved) return prev;
  if (prev.lastSolvedDate === result.date) return prev; // idempotency guard

  const consecutive =
    prev.lastSolvedDate !== null &&
    dateToDays(result.date) - dateToDays(prev.lastSolvedDate) === 1;
  const currentStreak = consecutive ? prev.currentStreak + 1 : 1;

  const guessCount = result.guesses.length;
  const distribution = { ...prev.distribution };
  distribution[guessCount] = (distribution[guessCount] ?? 0) + 1;

  return {
    played: prev.played + 1,
    wins: prev.wins + 1,
    currentStreak,
    maxStreak: Math.max(prev.maxStreak, currentStreak),
    lastSolvedDate: result.date,
    distribution,
  };
}
