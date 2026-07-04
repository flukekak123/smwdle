# Code Generation Plan — U2 web-app

**Workspace root**: `/Users/wichakorn/secret-project/smwdle-project`
**Stories**: US-1, US-3, US-4, US-5, US-6, US-11, US-12(display), US-14, US-15, US-16.
**Depends on**: U1 (`src/lib`) + `src/data/monsters.json`.
**Docs summary** → `aidlc-docs/construction/web-app/code/`.

## Steps

- [x] **Step 1 — Next.js + Tailwind + i18n deps & config**
  Update `package.json` (add next, react, react-dom, next-intl, tailwindcss, postcss, autoprefixer; dev: @testing-library/react, @testing-library/jest-dom, jsdom, @vitejs/plugin-react, @types/react, @types/react-dom). Add `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, update `tsconfig.json` (jsx preserve, next plugin), add `next-env.d.ts`, add Next scripts (dev/build/start). Update `vitest.config.ts` for jsdom + react + setup file.
- [x] **Step 2 — i18n catalogs** → `src/i18n/en.json`, `src/i18n/th.json`, `src/i18n/config.ts`.
- [x] **Step 3 — Helper hooks/utils** → `src/providers/storage.ts` (safeStorage), `useHydrated.ts`, `useCountdown.ts`, `share.ts` (copyToClipboard).
- [x] **Step 4 — Providers** → `I18nProvider`, `ThemeProvider`, `GameProvider` (useGame), `StatsProvider` (useStats). [US-1, US-3, US-5, US-6, US-12]
- [x] **Step 5 — Presentational components** → `Modal`, `HintCell`, `GuessRow`, `GameBoard`, `GuessInput`, `ResultModal`, `StatsPanel`, `LanguageToggle`, `ThemeToggle`, `Header`, `Footer`. [US-4, US-7 render, US-8 render, US-11, US-14, US-15]
- [x] **Step 6 — App Router shell** → `src/app/layout.tsx` (providers + metadata), `src/app/page.tsx` (compose game), `src/app/globals.css` (Tailwind + theme tokens).
- [x] **Step 7 — Static assets** → `public/placeholder-monster.svg`.
- [x] **Step 8 — Tests** → `tests/i18n.test.ts` (EN/Thai key parity, US-16 🧪), `tests/components/GuessInput.test.tsx` + `HintCell.test.tsx` (RTL smoke), `tests/setup.ts`.
- [x] **Step 9 — Docs summary** → `aidlc-docs/construction/web-app/code/implementation-summary.md`.
- [x] **Step 10 — Verify** → `npm install`, `npm run typecheck`, `npm test` (all suites), `npm run build` (Next production build). Report results.

## Notes
- Client components (`'use client'`) for interactive pieces; layout is a server component.
- Portraits: `imageUrl` currently null in starter data → placeholder used everywhere (US-15 path exercised).
- Accessibility: HintCell renders icon + visually-hidden text + aria-label (not color alone).
- `data-testid`s per functional design for automation.
- Verification (Step 10) is part of this stage to catch integration issues early; the formal Build & Test stage follows for the whole system.
