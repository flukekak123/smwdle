# Unit of Work Plan — Smwdle

**Context**: Units already approved in execution-plan.md → U1 core-data-engine, U2 web-app. This plan finalizes boundaries, dependency, story mapping, and code organization.

## Plan Steps
- [ ] Generate `unit-of-work.md` (definitions, responsibilities, code organization)
- [ ] Generate `unit-of-work-dependency.md` (dependency matrix + build order)
- [ ] Generate `unit-of-work-story-map.md` (every story → a unit)
- [ ] Validate boundaries; ensure all 16 stories assigned

## Confirmed (from prior stages)
- **U1 core-data-engine**: data schema, build-time fetch script, cached JSON, curated pool, pure game logic (selection, comparison, share encoding, stats, state codec). PBT target.
- **U2 web-app**: Next.js UI, components, i18n (EN/Thai), localStorage wiring, portraits.
- **Deployment**: single static site on Vercel.

## Open Question

### UOW-Q1: Code organization (greenfield)
How should the two units live in the repo?

A) **Single Next.js app**; U1 core lives in `src/lib/` (framework-agnostic, independently testable), U2 in `src/app` + `src/components`; build script in `scripts/`. Simplest; one `package.json`; units are logical modules. *(Recommended)*
B) **Monorepo** (pnpm/turbo workspaces): `packages/core` (U1) + `apps/web` (U2) as separate packages. More ceremony; better if core will be reused/published.
X) Other
[Answer]: A
