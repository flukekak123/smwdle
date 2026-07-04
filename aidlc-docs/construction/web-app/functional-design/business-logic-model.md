# Business Logic Model — U2 web-app (client orchestration)

U2 holds no game rules of its own — it orchestrates U1 pure functions and browser side effects (localStorage, clipboard). Implemented as React context providers + hooks.

## PersistenceService (`usePersistence`)
- `load(): PersistedState` → `deserialize(localStorage.getItem(KEY))`.
- `save(state): void` → `localStorage.setItem(KEY, serialize(state))`.
- Guards: wrapped in try/catch; SSR-safe (no-ops when `window` undefined). KEY = `smwdle:v1`.

## GameProvider (`useGame`)
- On mount (client): `today = new Date()`; `secret = getDailyMonster(today, catalog.getAnswerPool())`; `puzzleNumber = getPuzzleNumber(today)`.
- Restore: `persisted = load()`. If `persisted.today?.date === localDateString(today)` → restore its `guesses`/`solved`; else start fresh `today` GameResult (and roll: keep stats, reset board).
- State: `{ guesses: GuessResult[]; solved: boolean }`.
- `submitGuess(m)`:
  1. reject if `solved` or `m.id` already in guesses (BR).
  2. `res = evaluate(m, secret)`; append to `guesses`.
  3. if `res.correct` → `solved = true`; notify StatsProvider `applyResult`.
  4. persist updated `today` GameResult.
- Exposes: `guesses`, `submitGuess`, `solved`, `result` (GameResult), `secret` (revealed only when solved), `puzzleNumber`, `nextResetAt` (next local midnight).

## StatsProvider (`useStats`)
- On mount: `stats = load().stats`.
- `recordSolved(result)`: `stats = applyResult(stats, result)`; persist. Idempotent per date (U1 guard) so reloads don't double-count.
- Exposes: `stats`.

## I18nProvider (`useI18n`) — next-intl
- Messages: `src/i18n/en.json`, `src/i18n/th.json`.
- `locale` initial = persisted locale or browser default (`th` if navigator language starts 'th', else 'en').
- `setLocale(l)` → updates context + persists via PersistenceService.
- `t(key)` → translated string.

## ThemeProvider (`useTheme`)
- `theme: 'system'|'light'|'dark'`; applies `class="dark"` on `<html>` for dark; persists choice; respects `prefers-color-scheme` when 'system'.

## ShareService (`useShare`)
- `share(result)`: `text = encodeShare(result)`; `navigator.clipboard.writeText(text)` with a textarea fallback; returns success for toast.

## Countdown
- `nextResetAt` = next local midnight; a `useCountdown(target)` hook ticks each second to render `HH:MM:SS`.

## SSR / Hydration Notes
- Date/localStorage-dependent state resolves on the client (in `useEffect`) to avoid hydration mismatch; the board renders empty/skeleton until hydrated.
