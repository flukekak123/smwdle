# Code Generation Plan — U1 core-data-engine

**Workspace root**: `/Users/wichakorn/secret-project/smwdle-project`
**Layout**: single Next.js app (monolith). U1 code → `src/lib/`, `scripts/`, `src/data/`; tests → `tests/`.
**Stories covered**: US-2, US-7, US-8, US-9, US-10, US-12 (compute), US-13 (codec).
**Docs summary** → `aidlc-docs/construction/core-data-engine/code/`.

## Dependencies / Contract
- U1 has no dependency on U2. Exposes `types.ts` + pure functions + `monsters.json` as the contract U2 will consume.

## Steps

- [x] **Step 1 — Base project tooling (greenfield setup)**
  Create `package.json` (TypeScript, Vitest, fast-check, tsx), `tsconfig.json` (strict), `vitest.config.ts`, `.gitignore`, `.eslintrc`/`.prettierrc`. (Next.js + Tailwind added later in U2.)
- [x] **Step 2 — Shared types** → `src/lib/types.ts` (Monster, Element, Role, Gender, AttributeResult, GuessResult, GameResult, Stats, PersistedState, constants ATTRIBUTE_ORDER, EPOCH, SEED).
- [x] **Step 3 — RNG utils** → `src/lib/rng.ts` (`mulberry32`, `seededShuffle`, `safeModulo`).
- [x] **Step 4 — Search utils** → `src/lib/search.ts` (`normalize`, bounded `levenshtein`).
- [x] **Step 5 — MonsterCatalog** → `src/lib/catalog.ts` (load JSON, id/name index, `getAllMonsters/getAnswerPool/findByName/getById`). [US-9, US-10, US-4-support]
- [x] **Step 6 — DailySelector** → `src/lib/dailySelector.ts` (`daysSinceEpoch`, `getPuzzleNumber`, memoized `getDailyMonster`). [US-2, US-10]
- [x] **Step 7 — GuessEvaluator** → `src/lib/guessEvaluator.ts` (`evaluate`, `isCorrect`). [US-7, US-8]
- [x] **Step 8 — ShareEncoder** → `src/lib/shareEncoder.ts` (`encodeShare`). [US-11-support]
- [x] **Step 9 — StatsEngine** → `src/lib/statsEngine.ts` (`emptyStats`, `applyResult`). [US-12]
- [x] **Step 10 — GameStateCodec** → `src/lib/gameStateCodec.ts` (`serialize`, `deserialize`, `defaults`, `validatePersistedState`). [US-13]
- [x] **Step 11 — Data: fetch script + committed dataset**
  `scripts/fetch-monsters.ts` (SWARFARM → normalized schema → writes `src/data/monsters.json`, marks curated pool). Commit a **curated starter `src/data/monsters.json`** (~40–60 well-known monsters, ~24 flagged `inAnswerPool`) as a working fallback so the app/tests run without network; script expands to full roster when run online. [US-9, US-10]
- [x] **Step 12 — Tests (example + property-based)**
  `tests/generators.ts` (fast-check Monster/Stats/PersistedState generators) + `tests/*.test.ts` for rng, catalog, dailySelector, guessEvaluator, shareEncoder, statsEngine, gameStateCodec. Properties: determinism, no-repeat cycle, evaluate(m,m)=match, star direction, share safety, stats idempotence, codec round-trip. [PBT-02/03/07/08]
- [x] **Step 13 — Docs summary** → `aidlc-docs/construction/core-data-engine/code/implementation-summary.md`.

## Notes
- Tests are written now but **executed** in the Build and Test stage.
- Data licensing/attribution (SWARFARM/Com2uS) surfaced in UI later (U2, US-14); the fetch script header will note the source.
- `SEED` and `EPOCH` are fixed constants in `types.ts` (do not change post-launch — would reshuffle the schedule).
