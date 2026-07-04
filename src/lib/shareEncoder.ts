import type { CellStatus, GameResult } from './types.js';
import { SITE_URL } from './types.js';

const EMOJI: Record<CellStatus, string> = {
  match: '🟩',
  'no-match': '⬛',
  higher: '🔼',
  lower: '🔽',
  partial: '🟨',
};

/**
 * Build the spoiler-free shareable result.
 * Emits one emoji per attribute per guess row; never includes monster name/id/portrait.
 * Deterministic for a given GameResult.
 */
export function encodeShare(result: GameResult): string {
  const header = `Smwdle #${result.puzzleNumber}  ${result.guesses.length}/∞`;
  const rows = result.guesses.map((g) => g.attributes.map((a) => EMOJI[a.status]).join(''));
  return [header, ...rows, SITE_URL].join('\n');
}
