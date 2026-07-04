# NFR Requirements — U1 core-data-engine

U1 is a pure, in-process TypeScript module (no server, network, auth, or DOM). NFRs are scoped accordingly.

## Performance
- NFR-U1-P1: All logic functions operate in-memory over a ≤ ~1,500-item roster; per-call work is O(n) or better. Target: any single call (evaluate, daily selection, search) completes < 5 ms on a typical device.
- NFR-U1-P2: `findByName` autocomplete filtering target < 10 ms per keystroke over the full roster.
- NFR-U1-P3: The seeded shuffle is computed once per session (memoizable), not per call.

## Reliability / Error Handling
- NFR-U1-R1: `GameStateCodec.deserialize` must never throw; corrupt/legacy input → valid defaults (BR-25).
- NFR-U1-R2: All selection/evaluation functions are total (defined for every valid Monster input); safe modulo prevents negative/zero-length faults.
- NFR-U1-R3: Determinism: identical inputs always produce identical outputs (no time/random except via the fixed SEED and the passed-in date).

## Maintainability / Testability
- NFR-U1-M1: Pure functions with no hidden state → unit- and property-testable in isolation.
- NFR-U1-M2: Property-based tests via **fast-check** for round-trip (codec) and invariants (selection, evaluation, stats) per the PBT plan (PBT-02, PBT-03).
- NFR-U1-M3: Shared types centralized in `types.ts`; the `monsters.json` schema is the U1↔U2 contract and must remain backward compatible.
- NFR-U1-M4: Deterministic seed + logged seed on PBT failure for reproducibility (PBT-08).

## Security / Privacy
- NFR-U1-S1: No user data, no network at runtime, no secrets → negligible attack surface (Security extension disabled by decision). Build-time fetch script must not embed credentials.

## Scalability / Availability
- N/A — no runtime service; the module ships as static code. (Availability handled by static hosting at the U2/deploy level.)

## Accessibility / Usability
- N/A for U1 (no UI); handled in U2.
