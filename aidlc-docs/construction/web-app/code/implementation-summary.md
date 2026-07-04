# Implementation Summary — U2 web-app

## Created / Modified Files (application code — workspace root)

### Config (Step 1)
- Modified `package.json` — added next, react, react-dom, next-intl, tailwindcss/postcss/autoprefixer + dev (RTL, jsdom, @vitejs/plugin-react, eslint-config-next, types); Next scripts.
- `next.config.mjs` — `extensionAlias` so `src/lib` `.js` specifiers resolve to `.ts`.
- `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css`.
- Modified `tsconfig.json` — jsx preserve, next plugin, allowJs, incremental.
- `next-env.d.ts`; modified `vitest.config.ts` (jsdom + react + setup); modified `.eslintrc.json` (next/core-web-vitals).

### i18n (Step 2)
- `src/i18n/en.json`, `src/i18n/th.json`, `src/i18n/config.ts`.

### Helpers/Providers (Steps 3–4)
- `src/providers/`: `storage.ts` (safe fallback), `persistence.ts` (load/save/patch via U1 codec), `useHydrated.ts`, `useCountdown.ts`, `share.ts` (clipboard + fallback), `I18nProvider.tsx`, `ThemeProvider.tsx`, `GameProvider.tsx` (useGame + useStats).

### Components (Step 5–6)
- `src/components/`: `HintCell.tsx`, `GameBoard.tsx`, `GuessInput.tsx`, `Modal.tsx`, `ResultModal.tsx`, `StatsPanel.tsx`, `LanguageToggle.tsx`, `ThemeToggle.tsx`, `Header.tsx`, `Footer.tsx`, `GameScreen.tsx`.
- `src/app/layout.tsx` (providers + metadata), `src/app/page.tsx`.

### Assets (Step 7)
- `public/placeholder-monster.svg`.

### Tests (Step 8)
- `tests/setup.ts`, `tests/testUtils.tsx`, `tests/i18n.test.ts` (EN/Thai key parity + no-empty — US-16 🧪), `tests/components/HintCell.test.tsx`, `tests/components/GuessInput.test.tsx`.

### U1 addition
- Added pure `localDateString` to `src/lib/dailySelector.ts` (shared date-string contract).

## Story Coverage
US-1 (no-signup play), US-3 (countdown/reset), US-4 (autocomplete + keyboard), US-5 (dedupe), US-6 (unlimited), US-11 (win + share), US-12 (stats display), US-14 (attribution footer), US-15 (portrait + placeholder), US-16 (EN/Thai toggle).

## Verification (ran in this stage)
- `npm install` → 577 packages.
- `npm run typecheck` → **exit 0**.
- `npm test` → **10 files, 40 tests passing** (U1 logic + PBT, i18n parity, RTL component smoke).
- `npm run build` → **exit 0**, `/` prerendered as **static** (3.88 kB, 113 kB First Load JS), lint clean.
- Runtime smoke: `next start` → GET `/` **200**, correct `<title>`, SWARFARM attribution present in SSR HTML.

## Notes / Follow-ups
- next-intl used purely client-side (NextIntlClientProvider) — no locale routing/middleware.
- Portraits use `<img>` with placeholder fallback; when the real dataset (with imageUrl) is fetched, no code change needed.
- Data still the 40-monster starter set; run `npm run fetch:monsters` online for the full roster.
