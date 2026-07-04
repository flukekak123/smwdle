# Unit Test Execution

## Run Unit Tests
```bash
npm test          # vitest run (CI mode)
npm run test:watch  # watch mode during development
```

## Test Inventory
| File | Type | Focus |
|------|------|-------|
| `tests/rng.test.ts` | example + PBT | mulberry32 determinism, shuffle permutation, safeModulo range |
| `tests/catalog.test.ts` | example | lookup, answer pool, typo-tolerant search |
| `tests/dailySelector.test.ts` | PBT | determinism, pool membership, no-repeat cycle, puzzle number |
| `tests/guessEvaluator.test.ts` | example + PBT | 7-attribute compare, evaluate(m,m)=match, star direction |
| `tests/shareEncoder.test.ts` | PBT | determinism, spoiler-free emoji rows, cell counts |
| `tests/statsEngine.test.ts` | example + PBT | idempotence, streak≤maxStreak, streak/gap, distribution |
| `tests/gameStateCodec.test.ts` | PBT | round-trip, fail-safe deserialize, version rejection |
| `tests/i18n.test.ts` | data | EN/Thai key parity + no-empty (US-16) |
| `tests/components/HintCell.test.tsx` | RTL | accessible label (icon+text, not color alone) |
| `tests/components/GuessInput.test.tsx` | RTL | autocomplete, dedupe, disabled-when-solved |

## Expected Result
- **10 test files, 40 tests pass, 0 failures.**
- Property-based tests (fast-check) run with shrinking + seed logging enabled (PBT-08).

## Property-Based Testing (PBT — Partial mode)
- Framework: **fast-check** (PBT-09). Generators in `tests/generators.ts` (PBT-07).
- Enforced rules: PBT-02 (round-trip), PBT-03 (invariants), PBT-07, PBT-08.
- On failure, fast-check prints the seed and a shrunk minimal counterexample — add it as a permanent example test (PBT-10).

## Fixing Failures
1. Read the failing assertion + (for PBT) the shrunk input and seed.
2. Reproduce with the printed seed.
3. Fix the source; re-run `npm test` until green.
