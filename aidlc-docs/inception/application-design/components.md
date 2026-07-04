# Components — Smwdle

Design decisions: standalone data-fetch script → committed `monsters.json`; React Context + hooks; `next-intl` (EN/Thai); Next.js App Router; client-side local-date-seeded daily selection.

## Unit U1 — core-data-engine (framework-agnostic TypeScript)

### C1. MonsterCatalog
- **Purpose**: Load and expose the monster dataset and the curated answer pool.
- **Responsibilities**: Provide the full roster (guessable) and the curated answer subset; look up monsters by id/name; provide search/autocomplete candidates.
- **Interface**: `getAllMonsters()`, `getAnswerPool()`, `findByName(query)`, `getById(id)`.

### C2. DataFetcher (build-time only)
- **Purpose**: Fetch from SWARFARM (or fallback source) and transform into the local `monsters.json` schema.
- **Responsibilities**: Retrieve raw monster data; normalize to the Monster schema (element, stars, role, family, source, 2A flag, gender, portrait URL); mark curated-pool members; write `monsters.json`. Runs offline; not shipped to the browser.
- **Interface**: `fetchRawMonsters()`, `transform(raw)`, `writeCatalog(monsters)`.

### C3. DailySelector
- **Purpose**: Deterministically choose the day's secret monster.
- **Responsibilities**: Map a calendar date → an index into the curated answer pool (stable, uniform, non-repeating within a cycle). Pure and deterministic.
- **Interface**: `getDailyMonster(date, answerPool)`, `getPuzzleNumber(date)`.

### C4. GuessEvaluator
- **Purpose**: Compare a guessed monster to the secret across the 7 attributes.
- **Responsibilities**: Produce per-attribute results (match / no-match, and ▲/▼ for stars); determine solved state. Pure.
- **Interface**: `evaluate(guess, answer)`, `isCorrect(guess, answer)`.

### C5. ShareEncoder
- **Purpose**: Build the spoiler-free shareable result.
- **Responsibilities**: Turn a solved game's guess results into an emoji grid + puzzle number + guess count; guarantee no monster name/portrait leaks. Pure & deterministic.
- **Interface**: `encodeShare(gameResult)`.

### C6. StatsEngine
- **Purpose**: Compute and update player stats.
- **Responsibilities**: Update games played, win %, current/max streak, guess distribution given a completed game; pure transformation over prior stats.
- **Interface**: `applyResult(stats, gameResult)`, `emptyStats()`.

### C7. GameStateCodec
- **Purpose**: Serialize/deserialize daily game state and stats for localStorage.
- **Responsibilities**: Round-trip-safe encode/decode; versioned; tolerant of missing/legacy fields. Pure.
- **Interface**: `serialize(state)`, `deserialize(raw)`.

## Unit U2 — web-app (Next.js + React + Tailwind)

### C8. GameBoard (component)
- **Purpose**: Main play surface; renders guesses and hint rows.
- **Responsibilities**: Show submitted guesses with per-attribute hint cells; render column headers; solved banner.

### C9. GuessInput (component)
- **Purpose**: Autocomplete search + submit.
- **Responsibilities**: Typo-tolerant filtering over full roster; keyboard navigation; disable already-guessed; emit a guess.

### C10. HintCell (component)
- **Purpose**: Render one attribute comparison.
- **Responsibilities**: Color + icon/text redundancy (accessibility); ▲/▼ for stars.

### C11. ResultModal (component)
- **Purpose**: Win screen + share.
- **Responsibilities**: Show portrait (placeholder fallback), guess count, streak; copy share text to clipboard; countdown to next local midnight.

### C12. StatsPanel (component)
- **Purpose**: Display stats & distribution from StatsEngine data.

### C13. LanguageToggle (component)
- **Purpose**: Switch EN/Thai; persist choice.

### C14. Footer (component)
- **Purpose**: SWARFARM attribution + non-affiliation disclaimer.

### C15. AppShell / Layout (component)
- **Purpose**: Page scaffold, theme, providers (i18n, game context).
