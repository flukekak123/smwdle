import fc from 'fast-check';
import { ATTRIBUTE_ORDER } from '../src/lib/types.js';
import type {
  AttributeResult,
  GameResult,
  GuessResult,
  Monster,
  PersistedState,
  Stats,
} from '../src/lib/types.js';

export const elementArb = fc.constantFrom('Fire', 'Water', 'Wind', 'Light', 'Dark') as fc.Arbitrary<
  Monster['element']
>;
export const roleArb = fc.constantFrom('Attack', 'Defense', 'HP', 'Support') as fc.Arbitrary<
  Monster['role']
>;
export const genderArb = fc.constantFrom('Male', 'Female', 'Unknown') as fc.Arbitrary<
  Monster['gender']
>;
export const starsArb = fc.constantFrom(1, 2, 3, 4, 5) as fc.Arbitrary<Monster['naturalStars']>;

const EFFECTS = [
  'Increase ATK',
  'Increase DEF',
  'Immunity',
  'Heal',
  'Decrease DEF',
  'Stun',
  'Slow',
  'Silence',
] as const;

/** Deduped, sorted effect-name list (matches catalog data shape). */
const effectListArb = fc
  .uniqueArray(fc.constantFrom(...EFFECTS), { maxLength: 4 })
  .map((a) => [...a].sort());

/** Monster fields without id. */
const monsterCoreArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 16 }),
  element: elementArb,
  naturalStars: starsArb,
  role: roleArb,
  family: fc.constantFrom('Vampire', 'Dragon', 'Ifrit', 'Joker', 'Phoenix', 'Oracle', 'Fairy'),
  source: fc.constantFrom('Unknown Scroll', 'Mystical Scroll', 'Light & Dark Scroll', 'Fusion'),
  secondAwakening: fc.boolean(),
  gender: genderArb,
  buffs: effectListArb,
  debuffs: effectListArb,
  imageUrl: fc.constant(null),
  inAnswerPool: fc.boolean(),
});

export const monsterArb: fc.Arbitrary<Monster> = monsterCoreArb.map((m) => ({ ...m, id: 1 }));

/** Array of monsters with unique ids (id = index + 1). */
export function monstersArb(min = 1, max = 30): fc.Arbitrary<Monster[]> {
  return fc
    .array(monsterCoreArb, { minLength: min, maxLength: max })
    .map((arr) => arr.map((m, i) => ({ ...m, id: i + 1 })));
}

/** Local date built from an offset (in days) relative to 2026-01-01. */
export const dateArb: fc.Arbitrary<Date> = fc
  .integer({ min: -400, max: 2000 })
  .map((offset) => new Date(2026, 0, 1 + offset));

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
export const dateStringArb: fc.Arbitrary<string> = dateArb.map(
  (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
);

const attributeResultArb: fc.Arbitrary<AttributeResult> = fc.record({
  key: fc.constantFrom(...ATTRIBUTE_ORDER),
  status: fc.constantFrom('match', 'no-match', 'higher', 'lower', 'partial') as fc.Arbitrary<
    AttributeResult['status']
  >,
  guessValue: fc.string({ maxLength: 8 }),
});

const guessResultArb: fc.Arbitrary<GuessResult> = fc.record({
  monsterId: fc.nat(),
  attributes: fc.array(attributeResultArb, { maxLength: 7 }),
  correct: fc.boolean(),
});

export const gameResultArb: fc.Arbitrary<GameResult> = fc.record({
  puzzleNumber: fc.integer({ min: 1, max: 5000 }),
  date: dateStringArb,
  guesses: fc.array(guessResultArb, { maxLength: 8 }),
  solved: fc.boolean(),
});

export const statsArb: fc.Arbitrary<Stats> = fc.record({
  played: fc.nat({ max: 1000 }),
  wins: fc.nat({ max: 1000 }),
  currentStreak: fc.nat({ max: 1000 }),
  maxStreak: fc.nat({ max: 1000 }),
  lastSolvedDate: fc.option(dateStringArb, { nil: null }),
  distribution: fc.dictionary(
    fc.integer({ min: 1, max: 12 }).map(String),
    fc.nat({ max: 500 }),
  ) as fc.Arbitrary<Record<number, number>>,
});

export const persistedStateArb: fc.Arbitrary<PersistedState> = fc.record({
  version: fc.constant(1),
  today: fc.option(gameResultArb, { nil: null }),
  stats: statsArb,
  locale: fc.constantFrom('en', 'th') as fc.Arbitrary<PersistedState['locale']>,
});
