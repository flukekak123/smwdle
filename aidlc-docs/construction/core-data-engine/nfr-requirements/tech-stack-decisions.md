# Tech Stack Decisions — U1 core-data-engine

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Language | **TypeScript** (strict) | Type-safe contract with U2; shared `types.ts`. |
| Runtime | Framework-agnostic ES modules under `src/lib/` | Importable by Next.js (U2) and by tests without React. |
| Unit test runner | **Vitest** | Fast, TS-native, integrates with Next.js/Vite tooling; shared with U2. |
| Property-based testing | **fast-check** | PBT-09 framework selection; supports custom generators, shrinking, seed reproducibility (PBT-07/08). Added to `devDependencies`. |
| PRNG for shuffle | **mulberry32** (tiny, seedable, deterministic) | Deterministic seeded Fisher–Yates; no external dep. |
| Data format | **JSON** (`src/data/monsters.json`) | Static, committed, zero runtime fetch. |
| Build-time fetch | Node script (`scripts/fetch-monsters.ts`) via `tsx`/`ts-node` | Runs offline to (re)generate the catalog; not shipped to browser. |
| Lint/format | ESLint + Prettier (shared repo config) | Maintainability. |

## PBT-09 Compliance
- Framework **fast-check** selected and will be added to `package.json` devDependencies at Code Generation.
- Supports custom generators (Monster/Stats/PersistedState), automatic shrinking, and seed-based reproducibility.
- Single-language project (TypeScript) → one framework covers all PBT-applicable code.
