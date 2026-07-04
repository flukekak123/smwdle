# NFR Requirements — U2 web-app

## Performance
- NFR-U2-P1: Statically generated shell (SSG); first contentful paint < 2s on broadband, interactive < 3s.
- NFR-U2-P2: `monsters.json` bundled/imported; no runtime network for gameplay.
- NFR-U2-P3: Autocomplete responds < 50 ms per keystroke (U1 search is < 10 ms; rest is render).
- NFR-U2-P4: Portrait images lazy-loaded with reserved space (no layout shift; CLS ~0).

## Accessibility (NFR-3)
- NFR-U2-A1: Hints use icon + text/aria-label, never color alone (WCAG 1.4.1).
- NFR-U2-A2: Color contrast ≥ WCAG AA in both light and dark themes.
- NFR-U2-A3: Full keyboard operability (autocomplete arrow/Enter/Esc, focus states, modal focus trap).
- NFR-U2-A4: Semantic landmarks + aria labels; results readable by screen readers.

## Usability
- NFR-U2-U1: Mobile-first responsive (single column on phones, comfortable tap targets ≥ 44px).
- NFR-U2-U2: First-time instructions; clear feedback for invalid/duplicate guesses.
- NFR-U2-U3: Countdown to next puzzle after solving.

## Reliability
- NFR-U2-R1: Graceful degradation when localStorage or Clipboard API is unavailable (UEC-1/2).
- NFR-U2-R2: No SSR/client hydration mismatch (client-resolved date/state).

## Localization
- NFR-U2-L1: EN + Thai via externalized message catalogs; no hard-coded UI strings; parity across locales.

## Security / Privacy
- NFR-U2-S1: No user accounts, no PII, no server calls at runtime → minimal surface (Security extension off by decision). No secrets in client bundle.

## Maintainability / Testability
- NFR-U2-M1: Presentational components separated from providers; logic delegated to U1.
- NFR-U2-M2: `data-testid` on interactive elements; RTL smoke tests for key components.
- NFR-U2-M3: i18n key-completeness checked (EN vs Thai) — the US-16 completeness property.

## Scalability / Availability
- NFR-U2-AV1: Static hosting on Vercel/CDN → inherently scalable and highly available; no backend to scale.
