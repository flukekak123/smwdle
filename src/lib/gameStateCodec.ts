import type { GameResult, Locale, PersistedState, Stats } from './types.js';
import { CURRENT_STATE_VERSION } from './types.js';
import { emptyStats } from './statsEngine.js';

const LOCALES: Locale[] = ['en', 'th'];

export function defaults(): PersistedState {
  return {
    version: CURRENT_STATE_VERSION,
    today: null,
    stats: emptyStats(),
    locale: 'en',
  };
}

function isStats(v: unknown): v is Stats {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.played === 'number' &&
    typeof s.wins === 'number' &&
    typeof s.currentStreak === 'number' &&
    typeof s.maxStreak === 'number' &&
    (s.lastSolvedDate === null || typeof s.lastSolvedDate === 'string') &&
    typeof s.distribution === 'object' &&
    s.distribution !== null
  );
}

function isGameResult(v: unknown): v is GameResult {
  if (typeof v !== 'object' || v === null) return false;
  const g = v as Record<string, unknown>;
  return (
    typeof g.puzzleNumber === 'number' &&
    typeof g.date === 'string' &&
    Array.isArray(g.guesses) &&
    typeof g.solved === 'boolean'
  );
}

function validate(v: unknown): PersistedState | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (o.version !== CURRENT_STATE_VERSION) return null; // future: migrate older versions
  if (!isStats(o.stats)) return null;
  if (!(o.today === null || isGameResult(o.today))) return null;
  if (typeof o.locale !== 'string' || !LOCALES.includes(o.locale as Locale)) return null;
  return {
    version: CURRENT_STATE_VERSION,
    today: (o.today as GameResult | null) ?? null,
    stats: o.stats as Stats,
    locale: o.locale as Locale,
  };
}

export function serialize(state: PersistedState): string {
  return JSON.stringify(state);
}

/** Fail-safe: never throws. Corrupt/invalid/legacy input returns valid defaults. */
export function deserialize(raw: string | null | undefined): PersistedState {
  if (!raw) return defaults();
  try {
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ?? defaults();
  } catch {
    return defaults();
  }
}
