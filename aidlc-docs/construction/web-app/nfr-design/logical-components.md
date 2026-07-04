# Logical Components — U2 web-app

Client-side building blocks realizing the U2 NFR patterns (no server infrastructure).

| Logical component | Purpose | NFR pattern | Location (planned) |
|-------------------|---------|-------------|--------------------|
| `safeStorage` | try/catch localStorage wrapper + in-memory fallback | Reliability (UEC-1) | `src/lib/... ` → `src/providers/storage.ts` |
| `copyToClipboard` | clipboard + textarea fallback | Reliability (UEC-2) | `src/providers/share.ts` |
| `useCountdown(target)` | ticking countdown to next local midnight | Usability | `src/providers/useCountdown.ts` |
| `useHydrated()` | boolean flips true after mount | Hydration safety | `src/providers/useHydrated.ts` |
| `HintCell` a11y wrapper | icon + visually-hidden text + aria-label | Accessibility (NFR-U2-A1) | `src/components/HintCell.tsx` |
| `Modal` (focus trap) | trap focus, Esc close, restore focus | Accessibility (A3) | `src/components/Modal.tsx` |
| Theme `class` toggler | dark mode via html class + system pref | Theme | `src/providers/ThemeProvider.tsx` |
| Locale message loader | en/th catalogs via next-intl | Localization | `src/i18n/*` + `src/providers/I18nProvider.tsx` |
| Placeholder image | fallback for null/broken portraits | Reliability (UEC/US-15) | `public/placeholder-monster.svg` |

## Integration Notes
- All components run in the browser; the only "infra" is the static host/CDN (Vercel), addressed in Build & Test (deploy config).
- Providers compose at `AppShell`; components consume via hooks. No backend, queues, caches, or circuit breakers.
