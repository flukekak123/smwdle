# NFR Design Patterns — U2 web-app

## Performance
- **Static generation + client hydration**: page shell prerendered (SSG); interactive game state resolves client-side in `useEffect`.
- **Bundled data import**: `monsters.json` imported at build; no runtime fetch.
- **Lazy images with intrinsic sizing**: `next/image` (or `<img loading="lazy">`) with fixed aspect ratio wrappers → no CLS.
- **Debounce-free fast search**: U1 search is cheap; render list capped at `limit` (8).

## Accessibility
- **Redundant encoding**: each `HintCell` renders an SVG icon + visually-hidden text + `aria-label` describing status and value. Color is decorative reinforcement only.
- **Focus management**: modal (Result/Stats) uses a focus trap + `Esc` to close + return focus to trigger.
- **Keyboard-first autocomplete**: roving `activeIndex`, `aria-activedescendant`, `role="listbox"/"option"`.
- **Theming for contrast**: Tailwind tokens chosen to meet AA in both themes.

## Reliability / Resilience (client)
- **Safe storage wrapper**: try/catch around localStorage; in-memory fallback map when unavailable (UEC-1).
- **Clipboard fallback chain**: `navigator.clipboard` → hidden textarea + `execCommand` → show text for manual copy (UEC-2).
- **Hydration-safe rendering**: skeleton until client state ready; guards on `typeof window`.

## Localization
- **Message catalogs**: `en.json` / `th.json`; `t(key)` everywhere; a build/test-time **key-parity check** ensures both locales share the same keys (US-16 🧪).

## Theme
- **`class`-based dark mode**: `<html class="dark">` toggled by ThemeProvider; `prefers-color-scheme` honored for `system`.

## Maintainability / Testability
- **Container/presentational split**: providers/hooks own logic; components are prop-driven and easy to test.
- **Stable `data-testid`s** on interactive elements.
