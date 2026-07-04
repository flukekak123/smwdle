import type { Monster } from './types.js';
import { EPOCH, SEED } from './types.js';
import { seededShuffle, safeModulo } from './rng.js';

/** Local calendar date as 'YYYY-MM-DD' (shared contract for persistence & stats). */
export function localDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** UTC-normalized whole-day count between two local calendar dates (DST-safe). */
export function daysSinceEpoch(date: Date, epoch: Date = EPOCH): number {
  const a = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const b = Date.UTC(epoch.getFullYear(), epoch.getMonth(), epoch.getDate());
  return Math.floor((a - b) / 86_400_000);
}

/** Puzzle number: 1 on the epoch day; clamped to >= 1 for pre-epoch dates. */
export function getPuzzleNumber(date: Date, epoch: Date = EPOCH): number {
  return Math.max(1, daysSinceEpoch(date, epoch) + 1);
}

// Memoize the shuffled pool per (pool reference, seed) so the O(n) shuffle runs once.
const shuffleCache = new WeakMap<readonly Monster[], { seed: number; shuffled: Monster[] }>();

function shuffledPool(pool: readonly Monster[], seed: number): Monster[] {
  const cached = shuffleCache.get(pool);
  if (cached && cached.seed === seed) return cached.shuffled;
  const shuffled = seededShuffle(pool, seed);
  shuffleCache.set(pool, { seed, shuffled });
  return shuffled;
}

/**
 * Deterministically pick the day's secret monster from the answer pool.
 * Same date + pool => same monster. No repeat within a full pool cycle.
 */
export function getDailyMonster(
  date: Date,
  pool: readonly Monster[],
  seed: number = SEED,
  epoch: Date = EPOCH,
): Monster {
  if (pool.length === 0) throw new Error('getDailyMonster: answer pool is empty');
  const shuffled = shuffledPool(pool, seed);
  const index = safeModulo(daysSinceEpoch(date, epoch), shuffled.length);
  return shuffled[index]!;
}
