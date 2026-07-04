# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Smwdle — a daily "guess the Summoners War monster" web game (onepiecedle-style). Static Next.js site, no backend, no accounts. Live at https://smwdle.vercel.app; pushing to `main` auto-deploys via Vercel.

## Commands

```bash
npm run dev              # dev server on port 1011 (not 3000)
npm run build            # production build (also runs Next's lint + typecheck)
npm run start            # serve production build on port 1011
npm test                 # run all tests (vitest run)
npx vitest run tests/guessEvaluator.test.ts   # single test file
npm run typecheck        # tsc --noEmit
npm run fetch:monsters   # regenerate src/data/monsters.json from SWARFARM (needs network)
```

## Architecture: pure core / effectful shell

The codebase is split into two units with a hard boundary:

- **`src/lib/`** — pure, framework-agnostic TypeScript ("core-data-engine"). No React, no DOM, no `Date.now()`/`Math.random()` inside logic (dates are parameters; randomness comes only from the fixed `SEED`). All game rules live here: daily selection (`dailySelector.ts`), attribute comparison (`guessEvaluator.ts`), share encoding (`shareEncoder.ts`), stats/streaks (`statsEngine.ts`), localStorage codec (`gameStateCodec.ts`), catalog/search (`catalog.ts`).
- **`src/providers/` + `src/components/` + `src/app/`** — the React shell ("web-app"). Providers orchestrate the core and own all side effects (localStorage, clipboard, clock). Components are prop-driven with stable `data-testid`s.

The contract between the two is `src/lib/types.ts` + `src/data/monsters.json`. Keep new game rules in `src/lib` (testable, PBT-covered), not in components.

## Invariants that must not break

- **`SEED` and `EPOCH` in `src/lib/types.ts` are frozen post-launch** — changing either reshuffles the entire daily puzzle schedule for all players.
- **`ATTRIBUTE_ORDER`** (types.ts) drives everything in lockstep: evaluator output, board columns (`GameBoard` grid-cols count = 2 + order length), share emoji cells, and i18n `columns.*` keys. Adding/removing an attribute means touching all four; old persisted boards will render misaligned until reset.
- **Daily determinism**: same local calendar date ⇒ same monster for everyone (seeded Fisher–Yates over the answer pool, indexed by days-since-epoch). No server coordinates this.
- **`deserialize` never throws** — corrupt/legacy localStorage returns valid defaults. State is versioned (`CURRENT_STATE_VERSION`).
- **Stats are idempotent per date** (`applyResult` no-ops on same `lastSolvedDate`) — reloads and rerolls must not double-count.
- **Share text is spoiler-free**: emoji rows only, never the monster name/id.
- `buffs`/`debuffs` compare as **sets**: equal → `match`, overlap → `partial` (🟨/≈), disjoint → `no-match`. All other attributes are exact-equality except `naturalStars` (directional `higher`/`lower`).

## Data pipeline (build-time only)

`scripts/fetch-monsters.ts` regenerates `src/data/monsters.json` (committed; the browser never calls SWARFARM for data). Quirks encoded there:

- SWARFARM returns **two records per awakened monster** (family name + unique name) sharing one `bestiary_slug` but with different `com2us_id`s — dedupe by slug, keep the unique-name record, derive `family` from the slug middle.
- Buff/debuff lists come from a second pass over the **skills API** (batched `id__in` requests), aggregating `effect.name` by `is_buff`.
- `GUESS_MIN_STARS = 3` (1★/2★ excluded entirely), `ANSWER_POOL_MIN_STARS = 4` (`inAnswerPool` marks daily-answer candidates).
- Portrait `imageUrl`s point at SWARFARM's static host; UI always falls back to `/placeholder-monster.svg` on error.
- `gender` is always `'Unknown'` (the API doesn't provide it); `source` exists in data but is not a compared attribute.

## Testing

Vitest + fast-check property-based tests (project runs PBT in "Partial" mode: round-trip and invariant properties are mandatory). Domain generators live in `tests/generators.ts` — extend them when the `Monster` schema changes, or most suites fail to compile. `tests/i18n.test.ts` enforces **exact key parity** between `src/i18n/en.json` and `th.json`; every UI string needs both. Component tests use RTL with the `renderWithIntl` helper in `tests/testUtils.tsx`.

## Gotchas

- `src/lib` imports use `.js` specifiers (`./types.js`) resolved to `.ts` via `extensionAlias` in `next.config.mjs` — don't remove that config.
- Game state resolves client-side in `useEffect` (see `GameProvider`) to avoid SSR hydration mismatch; the page renders a skeleton until `ready`.
- The "New monster" button writes a per-device daily override to localStorage key `smwdle:override:v1` (outside the codec state) — it takes precedence over the scheduled monster for that date only.
- Guess-reveal animation knobs: flip duration in `globals.css` (`.animate-flip`), stagger in `GameBoard.tsx` (`CELL_STAGGER_MS`). Rows restored from storage intentionally don't animate.
- `aidlc-docs/` is process documentation (requirements, designs, audit log) from the AI-DLC workflow that built this — not application code, but update-worthy when the product's behavior changes materially.
