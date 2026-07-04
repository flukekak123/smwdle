# Implementation Summary — U1 core-data-engine

## Created Files (application code — workspace root)
### Tooling / config
- `package.json` — scripts (test, typecheck, lint, format, fetch:monsters); devDeps: TypeScript, Vitest, fast-check, tsx, ESLint, Prettier.
- `tsconfig.json` — strict, bundler resolution, `noUncheckedIndexedAccess`.
- `vitest.config.ts`, `.eslintrc.json`, `.prettierrc`, `.gitignore`.

### Core library (`src/lib/`)
- `types.ts` — domain types + constants `ATTRIBUTE_ORDER`, `EPOCH` (2026-01-01), `SEED`, `CURRENT_STATE_VERSION`, `SITE_URL`.
- `rng.ts` — `mulberry32`, `seededShuffle`, `safeModulo`.
- `search.ts` — `normalize`, bounded `levenshtein`.
- `catalog.ts` — `createCatalog(monsters)` → `getAllMonsters/getAnswerPool/getById/findByName` (indexed, typo-tolerant).
- `dailySelector.ts` — `daysSinceEpoch`, `getPuzzleNumber`, memoized `getDailyMonster` (seeded shuffle + day index).
- `guessEvaluator.ts` — `evaluate`, `isCorrect` (7-attribute compare, ▲/▼ stars).
- `shareEncoder.ts` — `encodeShare` (🟩/⬛/🔼/🔽, spoiler-free).
- `statsEngine.ts` — `emptyStats`, `applyResult` (no-loss streaks, idempotent).
- `gameStateCodec.ts` — `serialize`, `deserialize`, `defaults` (versioned, fail-safe).
- `index.ts` — public barrel + default `catalog` from committed data.

### Data
- `src/data/monsters.json` — committed **starter dataset** (40 monsters, 24 in answer pool). Illustrative attributes; regenerate with the fetch script for accuracy/full roster.
- `scripts/fetch-monsters.ts` — build-time SWARFARM fetch → normalize → write `monsters.json` (offline; keeps existing file on failure).

### Tests (`tests/`)
- `generators.ts` — fast-check arbitraries (Monster, Stats, GameResult, PersistedState, dates).
- `rng.test.ts`, `catalog.test.ts`, `dailySelector.test.ts`, `guessEvaluator.test.ts`, `shareEncoder.test.ts`, `statsEngine.test.ts`, `gameStateCodec.test.ts`.

## Story Coverage
US-2 (deterministic daily), US-7 (7-attribute compare), US-8 (directional stars), US-9 (accurate data schema), US-10 (curated pool), US-12 (stats compute), US-13 (state codec round-trip).

## PBT Coverage (Partial mode)
- PBT-02 round-trip: `gameStateCodec` round-trip property.
- PBT-03 invariants: daily determinism, no-repeat cycle, pool membership, evaluate(m,m)=match, star direction, stats idempotence, currentStreak ≤ maxStreak, shuffle permutation.
- PBT-07 generators: domain-valid custom arbitraries.
- PBT-08 shrinking/seed: fast-check defaults (enabled).

## Notes / Follow-ups
- Data accuracy: starter values are illustrative; run `npm run fetch:monsters` (online) to pull the real roster. Second-awakening & gender need a supplementary data merge in the script (currently defaulted).
- Tests are written here; execution happens in the Build and Test stage.
