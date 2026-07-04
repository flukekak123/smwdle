# Logical Components — U1 core-data-engine

No infrastructure components (queues, caches, circuit breakers, load balancers) — U1 is a pure library. "Logical components" here are the internal building blocks and helpers that realize the NFR patterns.

| Logical component | Purpose | NFR pattern realized | Location (planned) |
|-------------------|---------|----------------------|--------------------|
| `mulberry32(seed)` | Deterministic seedable PRNG | Determinism/reproducibility | `src/lib/rng.ts` |
| `seededShuffle(arr, seed)` | Pure Fisher–Yates using mulberry32 | Determinism; performance (once/session) | `src/lib/rng.ts` |
| `memoizeShuffle` | Cache shuffled pool per session | Performance | inside `dailySelector.ts` |
| Catalog index (`Map<id>`, name index) | O(1) lookup, fast search | Performance | inside `catalog.ts` |
| `levenshtein(a,b,max)` | Bounded edit-distance for typo tolerance | Performance (bounded) | `src/lib/search.ts` |
| `safeModulo(n, len)` | Non-negative modulo | Reliability (total fn) | `src/lib/rng.ts` or util |
| `validatePersistedState(obj)` | Shape/version check | Reliability (fail-safe decode) | inside `gameStateCodec.ts` |
| `defaults()` factory | Well-formed default state | Reliability (Null Object) | inside `gameStateCodec.ts` |
| fast-check generators | Domain-valid random inputs | Testability (PBT-07) | `tests/generators.ts` |

## Integration Notes
- All components are synchronous, in-process, dependency-free (except fast-check/Vitest in tests).
- `DataFetcher` (build-time) is the only component that performs I/O (network + file write); it is excluded from the runtime bundle and is not subject to runtime NFRs.
- No cross-process communication, no persistence within U1 (persistence is a U2 service that *uses* `GameStateCodec`).
