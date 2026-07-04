# Services & Orchestration — Smwdle

No server backend. "Services" here are client-side orchestration layers (React context providers + hooks) that coordinate the pure U1 engine with the U2 UI and browser storage.

## S1. GameProvider / useGame
- **Responsibility**: Own the current day's game state. On mount, resolve today's date → `DailySelector.getDailyMonster` → secret monster; restore any saved in-progress/solved state via `usePersistence`.
- **Orchestrates**: DailySelector (C3), GuessEvaluator (C4), MonsterCatalog (C1), GameStateCodec (C7).
- **Exposes**: `guesses`, `submitGuess(monster)`, `solved`, `result`. On each guess: evaluate → append → check solved → persist.

## S2. StatsProvider / useStats
- **Responsibility**: Load stats from storage; apply `StatsEngine.applyResult` when a game is solved; persist.
- **Orchestrates**: StatsEngine (C6), GameStateCodec (C7).
- **Exposes**: `stats`.

## S3. PersistenceService / usePersistence
- **Responsibility**: Read/write `PersistedState` in localStorage using GameStateCodec; guard against corrupt/legacy data (fallback to defaults). No network, no server.
- **Exposes**: `load()`, `save(state)`.

## S4. i18n Service (next-intl)
- **Responsibility**: Provide translated strings for EN/Thai; expose current locale + setter; persist locale via PersistenceService.
- **Exposes**: `t(key)`, `locale`, `setLocale(l)`.

## S5. ShareService
- **Responsibility**: Build share text via `ShareEncoder.encodeShare` and copy to clipboard (Clipboard API with fallback).
- **Exposes**: `share(result)`.

## Orchestration Flow (happy path)
1. AppShell mounts → i18n + GameProvider + StatsProvider initialize.
2. GameProvider computes today's secret (DailySelector) and restores saved state (Persistence).
3. Player types in GuessInput → selects monster → `submitGuess`.
4. useGame calls GuessEvaluator → updates board → persists → if correct, marks solved.
5. On solved → StatsProvider applies result → ResultModal shows portrait, stats, countdown, and Share.
6. Share → ShareService → clipboard (spoiler-free).
