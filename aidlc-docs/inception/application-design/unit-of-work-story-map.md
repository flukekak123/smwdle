# Story → Unit Map — Smwdle

Every v1 story is assigned. Stories spanning both units list the primary owner first.

| Story | Unit(s) | Notes |
|-------|---------|-------|
| US-1 no-signup play | U2 | App loads playable immediately |
| US-2 deterministic daily 🧪 | **U1** | DailySelector (pure, PBT) |
| US-3 local reset + countdown | U2 (uses U1 date logic) | GameProvider + ResultModal |
| US-4 autocomplete/keyboard | U2 (uses U1 catalog search) | GuessInput + MonsterCatalog |
| US-5 no duplicates | U2 | Guard in GameProvider/GuessInput |
| US-6 unlimited guesses | U2 | GameProvider |
| US-7 7-attribute compare 🧪 | **U1** (render U2) | GuessEvaluator (PBT) + GameBoard/HintCell |
| US-8 directional star 🧪 | **U1** (render U2) | GuessEvaluator (PBT) + HintCell |
| US-9 accurate data | **U1** | Catalog + DataFetcher schema |
| US-10 curated pool | **U1** | Answer-pool flag + DailySelector |
| US-11 win + share 🧪 | U2 (share via U1) | ResultModal + ShareEncoder (PBT) |
| US-12 local stats | U1 (compute) + U2 (display) | StatsEngine + StatsPanel |
| US-13 completed-day persist 🧪 | **U1** (codec) + U2 (storage) | GameStateCodec (PBT round-trip) |
| US-14 attribution | U2 | Footer |
| US-15 portraits + placeholder | U2 (data from U1) | ResultModal + Catalog imageUrl |
| US-16 EN/Thai i18n 🧪 | U2 | i18n service; key-completeness PBT |

## Coverage Check
- **U1 owns**: US-2, US-7, US-8, US-9, US-10, US-12(compute), US-13(codec) — the logic + data core.
- **U2 owns**: US-1, US-3, US-4, US-5, US-6, US-11, US-12(display), US-14, US-15, US-16.
- All 16 stories assigned; 🧪 (PBT) stories concentrate in U1 (+ US-16 i18n completeness in U2). ✅
