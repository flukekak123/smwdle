# Functional Design Plan — U2 web-app

**Unit**: U2 (Next.js + React + Tailwind). **Stories**: US-1, US-3, US-4, US-5, US-6, US-11, US-12(display), US-14, US-15, US-16.
**Depends on**: U1 core (`src/lib`) + `monsters.json`.

## Plan Steps
- [x] Define component hierarchy, props, and state → `frontend-components.md`
- [x] Define client service/provider logic (orchestration) → `business-logic-model.md`
- [x] Define UI business rules & interaction flows → `business-rules.md`

## Design Questions

### FDU2-Q1: Visual style / theme
A) **Clean card-grid, onepiecedle-inspired**, light + dark mode (auto via system, manual toggle), one accent color. *(Recommended)*
B) Minimal monochrome.
C) Playful/colorful game theme.
[Answer]: A

### FDU2-Q2: i18n routing
A) **Client-side locale** (next-intl with a provider; language via toggle, persisted in localStorage; no locale-prefixed URLs). Simplest for a single-page game. *(Recommended)*
B) URL-prefixed locales (`/en`, `/th`).
[Answer]: A

### FDU2-Q3: Accent color
A) **Summoners-War-ish violet/indigo** accent. *(Recommended)*
B) Teal/green.
C) Amber/orange.
X) Other
[Answer]: A

### FDU2-Q4: Hint cell reveal
A) Simple instant color+icon reveal per guess. *(Recommended, accessible, fast)*
B) Flip/stagger animation per attribute (flashier; more code).
[Answer]: A
