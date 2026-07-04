# Business Rules & Edge Cases — U1 core-data-engine

## Data / Catalog Rules
- BR-1: `monsters.json` is the single source of truth at runtime; the browser never calls SWARFARM.
- BR-2: `source` is normalized to a fixed set: `Unknown Scroll`, `Mystical Scroll`, `Light & Dark Scroll`, `Fusion`, `Crafting`, `Special Program`, `Other`. Unmapped raw sources → `Other`.
- BR-3: `family` uses the canonical family/archetype name from source data; trimmed, title-cased.
- BR-4: `gender` defaults to `Unknown` when the source does not specify.
- BR-5: `inAnswerPool` = true only for the curated ~150 well-known monsters; all others are guess-only.
- BR-6: The answer pool must be non-empty; build fails if pool size < 1.

## Daily Selection Rules
- BR-7: Selection uses the **local** calendar date of the player.
- BR-8: EPOCH = 2026-01-01; `puzzleNumber = daysSinceEpoch + 1`, clamped to ≥ 1 for pre-epoch dates.
- BR-9: Deterministic: identical date ⇒ identical monster for every player.
- BR-10: Seeded Fisher–Yates shuffle with a fixed `SEED` constant; changing SEED changes the whole schedule (avoid post-launch).
- BR-11: No repeat within a full pool cycle; after `pool.length` days the cycle repeats in the same order.

## Guess Evaluation Rules
- BR-12: Comparison is by value equality per attribute; `naturalStars` additionally yields directional `higher`/`lower`.
- BR-13: `gender` value `Unknown` compares like any other value (`Unknown`==`Unknown` → match; `Unknown` vs `Male` → no-match).
- BR-14: A guess equals the answer iff `guess.id === answer.id`; then all seven attributes are `match`.
- BR-15: Attribute order is fixed (`ATTRIBUTE_ORDER`) so UI columns and share cells align.

## Guessing Session Rules
- BR-16: Unlimited guesses; no attempt cap (no loss state).
- BR-17: A monster may be guessed at most once per day; duplicates are rejected before evaluation.
- BR-18: Only monsters present in the catalog are valid guesses.

## Stats & Streak Rules
- BR-19: A day is counted (played, win) exactly once, when first solved.
- BR-20: `currentStreak` increments only when the previous solved date is the immediately preceding calendar day; a gap resets it to 1.
- BR-21: Re-applying the same solved date is a no-op (idempotent) — protects against reloads/double calls.
- BR-22: `maxStreak = max(maxStreak, currentStreak)` after each update.
- BR-23: `distribution` is keyed by number of guesses used to solve.

## Persistence Rules
- BR-24: State is versioned (`version: 1`). Unknown/older versions are migrated where possible, else reset to defaults.
- BR-25: `deserialize` must never throw; on any corruption it returns valid defaults (fail-safe).
- BR-26: On a new local date, `today` is reset (previous day's board is not shown as current) while `stats` persist.

## Error / Edge Cases
- EC-1: Empty or malformed `monsters.json` → build/test failure (not a runtime concern).
- EC-2: Query with no matches in `findByName` → returns empty list (UI shows "no results").
- EC-3: Player at a timezone boundary — date resolved from the device clock at load; a reload after local midnight rolls to the new puzzle.
- EC-4: `daysSinceEpoch` for dates before EPOCH → puzzleNumber clamps to 1; selection still valid via safe modulo.
- EC-5: Missing `imageUrl` (null) → consumers use a placeholder (handled in U2).
