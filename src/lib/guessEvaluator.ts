import type { AttributeKey, AttributeResult, CellStatus, GuessResult, Monster } from './types.js';
import { ATTRIBUTE_ORDER } from './types.js';

/** Human-readable value of an attribute for display in the board/share. */
function displayValue(m: Monster, key: AttributeKey): string {
  switch (key) {
    case 'naturalStars':
      return `${m.naturalStars}★`;
    case 'secondAwakening':
      return m.secondAwakening ? 'Yes' : 'No';
    case 'buffs':
    case 'debuffs':
      return m[key].length > 0 ? m[key].join(', ') : 'None';
    case 'family': {
      const fams = [...new Set([m.family, ...m.twinFamilies])];
      const named = fams.filter((f) => f !== 'Unknown');
      return (named.length ? named : fams).join(' / ');
    }
    default:
      return String(m[key]);
  }
}

/** Set comparison: equal sets => match; overlapping => partial; disjoint => no-match. */
function compareSets(a: readonly string[], b: readonly string[]): CellStatus {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === sb.size && [...sa].every((x) => sb.has(x))) return 'match';
  return [...sa].some((x) => sb.has(x)) ? 'partial' : 'no-match';
}

function statusFor(guess: Monster, answer: Monster, key: AttributeKey): CellStatus {
  if (key === 'naturalStars') {
    if (guess.naturalStars === answer.naturalStars) return 'match';
    return answer.naturalStars > guess.naturalStars ? 'higher' : 'lower';
  }
  if (key === 'buffs' || key === 'debuffs') {
    return compareSets(guess[key], answer[key]);
  }
  if (key === 'family') {
    // Twins carry multiple family labels; match if any of the guess's families
    // lines up with any of the answer's families.
    const guessFams = new Set([guess.family, ...guess.twinFamilies]);
    const answerFams = [answer.family, ...answer.twinFamilies];
    return answerFams.some((f) => guessFams.has(f)) ? 'match' : 'no-match';
  }
  return guess[key] === answer[key] ? 'match' : 'no-match';
}

/** Correct on exact id match, or a collab reskin twin (same monster, different skin). */
export function isCorrect(guess: Monster, answer: Monster): boolean {
  return guess.id === answer.id || answer.twinIds.includes(guess.id);
}

/** Compare a guessed monster against the secret across the fixed 7 attributes. */
export function evaluate(guess: Monster, answer: Monster): GuessResult {
  const attributes: AttributeResult[] = ATTRIBUTE_ORDER.map((key) => ({
    key,
    status: statusFor(guess, answer, key),
    guessValue: displayValue(guess, key),
  }));

  return {
    monsterId: guess.id,
    attributes,
    correct: isCorrect(guess, answer),
  };
}
