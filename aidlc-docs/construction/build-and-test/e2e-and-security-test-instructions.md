# E2E & Security Test Instructions

## End-to-End (recommended future addition)
No e2e framework is wired yet. Recommended: **Playwright**.

### Suggested e2e journeys
1. **Daily solve**: load `/` → type + submit wrong guesses → observe hint colors → submit the daily monster → ResultModal shows portrait, guess count, streak, countdown.
2. **Share**: click Share → clipboard contains spoiler-free emoji grid + `Smwdle #N`.
3. **Persistence**: reload mid-game → board restored; reload after solving → completed state, not replayable.
4. **i18n**: toggle EN↔ไทย → chrome switches; reload → persists.
5. **Theme**: toggle system/light/dark → `html.dark` applied; persists.
6. **Accessibility**: keyboard-only play (Tab to input, arrows/Enter to pick), screen-reader labels on hint cells.

### Setup (when added)
```bash
npm i -D @playwright/test && npx playwright install
npx playwright test
```
Use the `data-testid`s already present (`guess-input`, `guess-option-{id}`, `hint-cell-{key}`, `result-modal`, `share-button`, `stats-panel`, `language-toggle`, `theme-toggle`, `stats-button`).

## Security
The Security Baseline extension is **disabled by decision** (no login, no server-stored PII, no runtime network). Baseline hygiene still applies:

### Dependency audit
```bash
npm audit          # review advisories (mostly transitive dev tooling)
npm audit fix      # apply non-breaking fixes
```
- Runtime dependencies are minimal (next, react, next-intl). Keep them patched.

### Client-side checks
- No secrets in the bundle (none exist).
- `localStorage` holds only anonymous game state — no PII.
- Build-time `fetch-monsters.ts` must not embed credentials (it uses a public API).
- If a future backend/analytics is added, re-enable the Security extension and add authz/input-validation tests.
