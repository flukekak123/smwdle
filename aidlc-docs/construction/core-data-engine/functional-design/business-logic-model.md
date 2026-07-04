# Business Logic Model — U1 core-data-engine

Decisions locked: seeded-shuffle daily pick · epoch 2026-01-01 · no-loss streaks · standard emoji share.

## MonsterCatalog (C1)
- **Load**: import `monsters.json` (array of Monster). Provide accessors.
- **getAllMonsters()**: full roster (guessable dictionary).
- **getAnswerPool()**: `filter(inAnswerPool === true)`, deterministic order by id (stable input to the shuffle).
- **findByName(query, limit=8)**: case-insensitive, diacritic-insensitive substring match ranked by (startsWith > includes) then by name length; typo tolerance via a bounded Levenshtein (distance ≤ 1 for short queries) as fallback when no substring hits.
- **getById(id)**: map lookup.

## DailySelector (C3)
- **EPOCH** = 2026-01-01 (local). **daysSinceEpoch(date)** = floor difference in whole local days.
- **getPuzzleNumber(date)** = daysSinceEpoch(date) + 1 (≥ 1; dates before epoch clamp to 1).
- **getDailyMonster(date, pool)**:
  1. `shuffled = seededShuffle(pool, SEED)` — Fisher–Yates driven by a deterministic PRNG (e.g., mulberry32) seeded by a fixed constant `SEED`. Pure: same pool + seed ⇒ same order.
  2. `index = ((daysSinceEpoch(date) % pool.length) + pool.length) % pool.length` (safe modulo).
  3. return `shuffled[index]`.
- **Guarantee**: deterministic (same date ⇒ same monster); no repeat within one full pool cycle (~150 days).

## GuessEvaluator (C4)
- **ATTRIBUTE_ORDER** = ['element','naturalStars','role','family','source','secondAwakening','gender'].
- **evaluate(guess, answer)**: for each key in ATTRIBUTE_ORDER produce AttributeResult:
  - `naturalStars`: match if equal; else 'higher' if answer > guess, 'lower' if answer < guess.
  - all other keys: 'match' if strictly equal, else 'no-match'.
  - `guessValue`: display string of the guess's value.
  - `correct` = guess.id === answer.id (equivalently: all seven statuses are 'match').
- **isCorrect(guess, answer)** = guess.id === answer.id.

## ShareEncoder (C5)
- **EMOJI**: match → 🟩, no-match → ⬛, higher → 🔼, lower → 🔽.
- **encodeShare(result)**:
  - Header: `Smwdle #${puzzleNumber}  ${guesses.length}/∞`
  - One line per guess: map its 7 AttributeResults (in ATTRIBUTE_ORDER) to EMOJI.
  - Footer: site URL (constant), no monster name/portrait.
- **Guarantee**: output contains no monster name/id/portrait; deterministic for a given GameResult.

## StatsEngine (C6)
- **emptyStats()**: played 0, wins 0, currentStreak 0, maxStreak 0, lastSolvedDate null, distribution {}.
- **applyResult(prev, result)** (only when result.solved, applied once per date):
  - `played+1`, `wins+1`.
  - Streak: if `lastSolvedDate` is the immediately preceding calendar day → `currentStreak+1`; else if same date → unchanged (idempotent guard); else → reset to 1.
  - `maxStreak = max(maxStreak, currentStreak)`.
  - `distribution[guessCount] += 1`.
  - `lastSolvedDate = result.date`.
- **Idempotency**: applying the same solved date twice does not double-count (guarded by lastSolvedDate === result.date).

## GameStateCodec (C7)
- **serialize(state)**: `JSON.stringify` of PersistedState (with `version`).
- **deserialize(raw)**: parse; if invalid JSON, wrong/absent version, or failed shape validation → return safe defaults (`{version:1, today:null, stats: emptyStats(), locale:'en'}`); migrate older versions field-by-field where possible.
- **Guarantee**: `deserialize(serialize(x)) deep-equals x` for all valid states (round-trip).

## Testable Properties (PBT-01 → fast-check; enforced under Partial: PBT-02/03)
| Component | Property | Category |
|-----------|----------|----------|
| DailySelector | same date ⇒ same monster (determinism) | Invariant |
| DailySelector | over one full cycle of consecutive days, every pool monster appears exactly once (no repeat) | Invariant |
| DailySelector | result is always a member of the pool | Invariant |
| GuessEvaluator | evaluate(m, m) ⇒ all 'match' & correct=true | Invariant |
| GuessEvaluator | star status: 'higher' ⇔ answer.stars>guess.stars (and symmetric) | Invariant |
| GuessEvaluator | attributes length always = 7 in ATTRIBUTE_ORDER | Invariant |
| ShareEncoder | output never contains answer name/id | Invariant (safety) |
| ShareEncoder | emoji-cell count per row = 7; rows = guesses | Invariant |
| StatsEngine | applyResult twice with same date == once (idempotent) | Idempotence |
| StatsEngine | currentStreak ≤ maxStreak always | Invariant |
| GameStateCodec | deserialize(serialize(state)) == state | Round-trip (PBT-02) |
| GameStateCodec | deserialize(garbage) never throws; returns valid defaults | Invariant |
