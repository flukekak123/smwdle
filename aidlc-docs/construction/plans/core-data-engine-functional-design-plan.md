# Functional Design Plan — U1 core-data-engine

**Unit**: U1 (pure TS core). **Stories**: US-2, US-7, US-8, US-9, US-10, US-12(compute), US-13(codec).

## Plan Steps
- [ ] Define domain entities (Monster, GuessResult, GameResult, Stats, PersistedState) → `domain-entities.md`
- [ ] Define business logic model per component (selection, evaluation, share, stats, codec) → `business-logic-model.md`
- [ ] Define business rules & edge cases → `business-rules.md`
- [ ] Identify testable properties (PBT-01) for fast-check → included in `business-logic-model.md`

## Design Questions

### FD-Q1: Daily selection algorithm
How to map a calendar date → the day's secret monster (from the curated pool)?
A) **Seeded shuffle then index by day** — deterministically shuffle the pool once (fixed seed), then pick `shuffledPool[daysSinceEpoch % poolSize]`. No repeats within a full cycle; order isn't trivially guessable. *(Recommended)*
B) Sequential — `pool[daysSinceEpoch % poolSize]` on the raw pool order (simple but order is predictable).
C) Per-day hash pick — `hash(date) % poolSize` (can repeat before the whole pool is used).
[Answer]: A

### FD-Q2: Launch epoch (day 0 / puzzle #1)
A) **2026-01-01** as puzzle #1 epoch. *(Recommended, clean anchor)*
B) The site's first deploy date.
X) Other (specify)
[Answer]: A

### FD-Q3: Loss / streak semantics (guesses are unlimited → players always eventually solve)
A) **No "loss" state.** A day counts as won when solved; **current streak = consecutive calendar days solved**; missing a day (not solving before local midnight) breaks the streak. Win% ≈ played/played (games solved ÷ games started). *(Recommended)*
B) Add a soft cap (e.g., 8 guesses) after which the day is a "loss" that breaks streak.
[Answer]: A

### FD-Q4: Share emoji semantics
A) One emoji per attribute per guess row: 🟩 match, ⬛ no-match, 🔼/🔽 for star direction; header `Smwdle #N  G/∞`. No names/portraits. *(Recommended)*
X) Other
[Answer]: A
