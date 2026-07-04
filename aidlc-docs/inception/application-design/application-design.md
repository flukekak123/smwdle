# Application Design (Consolidated) — Smwdle

## Overview
A static, client-only Next.js web game. The design cleanly separates a **pure TypeScript core** (U1 — data + game logic) from a **React/Tailwind UI** (U2). No backend: SWARFARM data is fetched at build time into a committed `monsters.json`; all gameplay, stats, and persistence run in the browser.

**Confirmed decisions**: standalone build-time data-fetch script → committed JSON · React Context + hooks · `next-intl` (EN/Thai) · Next.js App Router · client-side local-date-seeded daily selection.

## Architecture Layers
1. **Data (build-time)** — DataFetcher (C2) → `monsters.json`.
2. **Core engine (pure, U1)** — MonsterCatalog (C1), DailySelector (C3), GuessEvaluator (C4), ShareEncoder (C5), StatsEngine (C6), GameStateCodec (C7).
3. **Orchestration (client services, U2)** — GameProvider/useGame (S1), StatsProvider/useStats (S2), PersistenceService (S3), i18n (S4), ShareService (S5).
4. **Presentation (U2)** — AppShell (C15), GameBoard (C8), GuessInput (C9), HintCell (C10), ResultModal (C11), StatsPanel (C12), LanguageToggle (C13), Footer (C14).

## Detail Documents
- Components & responsibilities → `components.md`
- Method signatures / interfaces → `component-methods.md`
- Services & orchestration → `services.md`
- Dependencies & data flow → `component-dependency.md`

## Traceability (stories → components)
| Story | Primary components |
|-------|--------------------|
| US-1 no-signup play | AppShell, GameProvider |
| US-2 deterministic daily 🧪 | DailySelector |
| US-3 local reset + countdown | GameProvider, ResultModal |
| US-4 autocomplete/keyboard | GuessInput, MonsterCatalog |
| US-5 no duplicates | GuessInput, GameProvider |
| US-6 unlimited guesses | GameProvider |
| US-7 7-attribute compare 🧪 | GuessEvaluator, GameBoard, HintCell |
| US-8 directional star 🧪 | GuessEvaluator, HintCell |
| US-9 accurate data | MonsterCatalog, DataFetcher |
| US-10 curated pool | DailySelector, MonsterCatalog |
| US-11 win + share 🧪 | ResultModal, ShareEncoder, ShareService |
| US-12 local stats | StatsEngine, PersistenceService, StatsPanel |
| US-13 completed-day persist 🧪 | GameStateCodec, PersistenceService |
| US-14 attribution | Footer |
| US-15 portraits + placeholder | ResultModal, MonsterCatalog |
| US-16 EN/Thai i18n 🧪 | i18n Service, LanguageToggle, all components |

## Design Validation
- Every v1 user story maps to at least one component (table above) — **complete**.
- Pure core is fully decoupled from React → satisfies NFR-6 testability and PBT plan.
- No runtime external dependency → satisfies NFR-2 availability / NFR-1 performance.
- Accessibility (icon+text hint redundancy, keyboard nav) localized in HintCell/GuessInput → NFR-3.
- 🧪 components (DailySelector, GuessEvaluator, ShareEncoder, GameStateCodec, i18n completeness) are the PBT targets for Functional Design.
