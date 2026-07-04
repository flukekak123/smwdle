# Application Design Plan — Smwdle

**Source**: requirements.md, stories.md, execution-plan.md (units U1 core-data-engine, U2 web-app)

## Plan Steps
- [ ] Identify components across U1 and U2 with responsibilities → `components.md`
- [ ] Define component method signatures (interfaces only; business rules later in Functional Design) → `component-methods.md`
- [ ] Define services / orchestration (app-level coordinators, hooks) → `services.md`
- [ ] Map dependencies & data flow (U1 → U2, data build → runtime) → `component-dependency.md`
- [ ] Consolidate into `application-design.md`
- [ ] Validate completeness & consistency vs stories

## Design Decisions (recommended defaults — confirm in follow-up)

### D1: Data-fetch strategy
A) **Standalone build-time script** (`scripts/fetch-monsters.ts`) run manually/occasionally; output committed as static `monsters.json`. App has **no runtime dependency** on SWARFARM. *(Recommended)*
B) Fetch at Next.js build time (SSG data step).
C) Fetch at runtime via API route.
[Answer]: A

### D2: Client state management
A) **React Context + hooks** (lightweight, no extra dep). *(Recommended for this scope)*
B) Zustand (small external store).
C) Redux Toolkit.
[Answer]: A

### D3: i18n approach (EN/Thai)
A) **`next-intl`** — App-Router-friendly, message catalogs, locale routing. *(Recommended)*
B) `react-i18next`.
C) Minimal custom dictionary + context.
[Answer]: A

### D4: Next.js structure
A) **App Router**, mostly client components for the interactive game, static generation for shell; data imported from local JSON. *(Recommended)*
B) Pages Router.
[Answer]: A

### D5: Where does daily-answer selection run?
A) **Client-side pure function** seeded by local date (no backend); same date ⇒ same monster. *(Recommended, matches no-backend design)*
B) Server component computes it.
[Answer]: A
