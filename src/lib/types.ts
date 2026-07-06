// Shared domain types and constants — the U1 <-> U2 contract.
// See aidlc-docs/construction/core-data-engine/functional-design/domain-entities.md

export type Element = 'Fire' | 'Water' | 'Wind' | 'Light' | 'Dark';
export type Role = 'Attack' | 'Defense' | 'HP' | 'Support';
export type Gender = 'Male' | 'Female' | 'Unknown';
export type NaturalStars = 1 | 2 | 3 | 4 | 5;
export type Locale = 'en' | 'th';

export interface Monster {
  id: number;
  name: string;
  element: Element;
  naturalStars: NaturalStars;
  role: Role;
  family: string;
  source: string;
  secondAwakening: boolean;
  gender: Gender;
  /** Buff effects granted by the monster's skills (deduped, sorted). */
  buffs: string[];
  /** Debuff effects inflicted by the monster's skills (deduped, sorted). */
  debuffs: string[];
  imageUrl: string | null;
  inAnswerPool: boolean;
}

/**
 * Comparison outcome for a single attribute.
 * `higher`/`lower` only apply to naturalStars; `partial` only to set-valued
 * attributes (buffs/debuffs) when the sets overlap without being equal.
 */
export type CellStatus = 'match' | 'no-match' | 'higher' | 'lower' | 'partial';

export type AttributeKey =
  | 'element'
  | 'naturalStars'
  | 'role'
  | 'family'
  | 'secondAwakening'
  | 'gender'
  | 'buffs'
  | 'debuffs';

export interface AttributeResult {
  key: AttributeKey;
  status: CellStatus;
  guessValue: string;
}

export interface GuessResult {
  monsterId: number;
  attributes: AttributeResult[];
  correct: boolean;
}

export interface GameResult {
  puzzleNumber: number;
  /** Local calendar date, 'YYYY-MM-DD'. */
  date: string;
  guesses: GuessResult[];
  solved: boolean;
}

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** Local date of the last solved puzzle, 'YYYY-MM-DD', or null. */
  lastSolvedDate: string | null;
  /** guessCount -> number of games solved in that many guesses. */
  distribution: Record<number, number>;
}

export interface PersistedState {
  version: number;
  today: GameResult | null;
  stats: Stats;
  locale: Locale;
}

// --- Fixed constants (do NOT change post-launch; they define the puzzle schedule) ---

/** Order of attributes for evaluation, UI columns, and share cells. */
export const ATTRIBUTE_ORDER: AttributeKey[] = [
  'element',
  'naturalStars',
  'role',
  'family',
  'secondAwakening',
  'gender',
  'buffs',
  'debuffs',
];

/** Puzzle #1 anchor (local date). daysSinceEpoch(EPOCH) === 0. */
export const EPOCH = new Date(2026, 0, 1);

/** Seed for the deterministic answer-pool shuffle. Changing this reshuffles the whole schedule. */
export const SEED = 0x53_4d_57_44; // "SMWD" bytes; arbitrary fixed constant

/** Separate seed for Silhouette mode so its daily monster differs from Classic. */
export const SILHOUETTE_SEED = 0x53_49_4c_48; // "SILH"

/** Separate seed for Emoji mode. */
export const EMOJI_SEED = 0x45_4d_4a_49; // "EMJI"

export const CURRENT_STATE_VERSION = 1;

export const SITE_URL = 'https://smwdle.vercel.app';
