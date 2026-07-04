# Units of Work — Smwdle

A single deployable Next.js application on Vercel. Two **logical units** (modules within one repo), not separate packages.

## U1 — core-data-engine
- **Type**: Module (framework-agnostic TypeScript) + build-time script.
- **Responsibilities**:
  - Monster schema and `monsters.json` catalog (full roster + curated answer-pool flag).
  - Build-time `DataFetcher` script (SWARFARM/fallback → JSON).
  - Pure game logic: `MonsterCatalog`, `DailySelector`, `GuessEvaluator`, `ShareEncoder`, `StatsEngine`, `GameStateCodec`.
- **Characteristics**: Pure/deterministic, no React, no DOM → directly unit- and property-testable (PBT target).
- **Components**: C1–C7.

## U2 — web-app
- **Type**: Module (Next.js + React + Tailwind) — the deployable app.
- **Responsibilities**:
  - UI components (board, guess input, hint cells, result modal, stats, toggle, footer, shell).
  - Client orchestration services (GameProvider, StatsProvider, PersistenceService, i18n, ShareService).
  - EN/Thai i18n; localStorage persistence; portrait rendering with placeholders.
- **Characteristics**: Effectful shell; depends on U1 for all logic and data.
- **Components**: C8–C15 + services S1–S5.

## Code Organization (Greenfield — Option A, confirmed)
```
smwdle/
├─ scripts/
│  └─ fetch-monsters.ts            # U1 build-time DataFetcher (C2)
├─ src/
│  ├─ lib/                         # U1 core (pure)
│  │  ├─ catalog.ts                # MonsterCatalog (C1)
│  │  ├─ dailySelector.ts          # DailySelector (C3)
│  │  ├─ guessEvaluator.ts         # GuessEvaluator (C4)
│  │  ├─ shareEncoder.ts           # ShareEncoder (C5)
│  │  ├─ statsEngine.ts            # StatsEngine (C6)
│  │  ├─ gameStateCodec.ts         # GameStateCodec (C7)
│  │  └─ types.ts                  # shared types
│  ├─ data/
│  │  └─ monsters.json             # committed catalog output
│  ├─ app/                         # U2 Next.js App Router
│  │  ├─ layout.tsx                # AppShell (C15) + providers
│  │  └─ page.tsx                  # main game page
│  ├─ components/                  # U2 UI (C8–C14)
│  ├─ providers/                   # U2 services (S1–S5)
│  └─ i18n/
│     ├─ en.json
│     └─ th.json
├─ tests/                          # unit + property-based (fast-check)
├─ package.json
├─ tailwind.config.ts
├─ tsconfig.json
└─ next.config.ts
```

## Build/Test Tooling
- **Language**: TypeScript. **Framework**: Next.js (App Router). **Styling**: Tailwind.
- **Testing**: Vitest + fast-check (PBT-09) for U1; React Testing Library for U2 smoke tests.
- **Deploy**: Vercel (static/SSG shell).
