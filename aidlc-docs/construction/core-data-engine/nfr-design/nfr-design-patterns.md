# NFR Design Patterns — U1 core-data-engine

Patterns chosen to satisfy the U1 NFRs (performance, reliability, testability). No open questions — U1 has no runtime service, so scalability/availability/security patterns are N/A.

## Performance Patterns
- **Pure functions + memoization**: `getDailyMonster` memoizes the seeded-shuffle result per (pool identity, SEED) so the O(n) shuffle runs once per session; subsequent daily lookups are O(1) index reads.
- **Precomputed index maps**: `MonsterCatalog` builds `Map<id, Monster>` and a lowercased/normalized name index once at load for O(1) id lookup and fast search.
- **Bounded search**: `findByName` short-circuits substring matching first; Levenshtein fallback only runs when substring yields nothing and query length is small — keeps per-keystroke cost low.

## Reliability / Fault-Tolerance Patterns
- **Fail-safe decode (Null Object / safe default)**: `GameStateCodec.deserialize` wraps parse+validate in a try/catch; any failure returns a well-formed default `PersistedState` (never throws).
- **Total functions + guard clauses**: safe modulo `((n % len)+len)%len`; empty-pool guarded at build (BR-6). Inputs validated at boundaries; internal functions assume valid domain types.
- **Idempotency guard**: `StatsEngine.applyResult` no-ops when `lastSolvedDate === result.date` — protects against reloads / double dispatch.
- **Schema versioning + migration**: `version` field enables forward migration; unknown → defaults.

## Determinism / Reproducibility Patterns
- **Seeded PRNG (mulberry32)**: all "randomness" is a pure function of a fixed `SEED`; no `Math.random`, no `Date.now()` inside logic (date is always an explicit parameter).
- **Injected clock**: functions take `date: Date` as a parameter rather than reading the system clock, enabling deterministic tests and PBT.

## Testability Patterns (PBT)
- **Custom fast-check generators** for `Monster`, `Stats`, `PersistedState` (respecting domain constraints — valid element/role/stars) → PBT-07.
- **Property tests**: round-trip (codec, PBT-02), invariants (selection uniqueness, evaluate(m,m)=match, streak ≤ maxStreak; PBT-03), idempotence (stats).
- **Seed logging + shrinking** enabled (fast-check defaults) → PBT-08.

## Maintainability Patterns
- **Single source of truth types** (`types.ts`) shared U1↔U2.
- **Ports at the edge**: only DataFetcher (build-time) touches the network; runtime core is side-effect free.
