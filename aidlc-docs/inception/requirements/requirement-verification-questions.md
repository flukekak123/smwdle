# Requirement Verification Questions

**Project**: Summoners War monster daily-guessing game (working name: *Smwdle*)
**Style reference**: https://onepiecedle.net/

## Intent Analysis Summary
- **Request Type**: New Project (greenfield)
- **Scope**: System-wide (full web application)
- **Complexity**: Moderate
- **Clarity**: Clear concept, but details needed on gameplay, data, and tech

---

**Instructions**: Please fill in each `[Answer]:` tag. For multiple choice, put the letter (e.g., `A` or `A, C`). Use `X` and describe for anything not listed. Answer only what you have opinions on — for the rest I'll recommend a sensible default.

---

## Section 1 — Gameplay

### Q1: Game mode(s)
Onepiecedle offers several modes. Which do you want for launch?

A) **Classic** — guess a monster; the game reveals which of its attributes (element, role, stars, etc.) match the secret monster (green/yellow/red style)
B) **Silhouette/Image** — guess the monster from a blurred or shadowed portrait
C) **Hint/Quote** — reveal a text hint about the monster's skill or lore, guess who it is
D) **Emoji** — guess from a set of emoji describing the monster
E) All of A–D as separate modes (start with Classic, add the rest later)

[A]: 

### Q2: Which monster attributes should the Classic mode compare?
Pick all that apply (these become the hint columns).

A) Element (Fire / Water / Wind / Light / Dark)
B) Natural star rating (1★–5★)
C) Type / role (Attack / Defense / HP / Support)
D) Monster family (e.g., Vampire, Werewolf, Fairy)
E) Obtainable source (Scroll / Fusion / Crafting / etc.)
F) Second-awakening available (Yes/No)
G) Gender
X) Other

[A,B,C,D,E,F,G]: 

### Q3: Daily cadence & sharing
A) One puzzle per day, same monster for everyone, resets at midnight (local time)
B) One per day but resets at a fixed UTC time
C) Unlimited practice mode in addition to the daily puzzle
D) Include a Wordle-style shareable emoji result to copy/paste
E) A + D (recommended)
X) Other

[A]: 

### Q4: Player progress / accounts
A) No accounts — track streak & stats in browser local storage only (simplest)
B) Optional accounts (login) to sync streaks across devices
C) Accounts required
X) Other

[A]: 

---

## Section 2 — Data

### Q5: Where does the monster data come from?
A) I will provide a dataset (CSV/JSON) of monsters and attributes
B) You (Claude) scaffold a small starter dataset (a few dozen popular monsters) that I expand later
C) Pull from a public source/API (e.g., SWARFARM community data) — subject to availability/licensing
X) Other

[C]: 

### Q6: Roughly how many monsters in the answer pool?
A) Small curated set (~50 most popular)
B) Medium (~200)
C) Full roster (1000+ monsters)
X) Other

[C]: 

### Q7: Do you need monster portrait images?
A) Yes — needed for Silhouette/Image mode (I'll supply them)
B) Yes — but you find/generate placeholders for now
C) No images for the initial version (text/attributes only)
X) Other

[B]: 

---

## Section 3 — Technical

### Q8: Front-end / framework preference
A) Next.js (React) — recommended for a data-driven site that's easy to deploy
B) Plain React (Vite)
C) Static HTML/CSS/JavaScript, no framework
D) No preference — you choose
X) Other

[A]: 

### Q9: Hosting / deployment target
A) Vercel
B) Netlify
C) GitHub Pages / static host
D) No preference — you recommend
X) Other

[D]: 

### Q10: Language / localization
A) English only
B) Thai only
C) Both English and Thai (i18n)
X) Other

[C]: 

---

## Section 4 — Extensions (quality add-ons)

### Q11: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[B]: 

### Q12: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips
C) No — skip all PBT rules (suitable for simple CRUD/UI-only projects)
X) Other (please describe after [Answer]: tag below)

[C]: 

### Q13: Resiliency Extensions
Should the resiliency baseline (AWS Well-Architected Reliability design-time best practices) be applied?

A) Yes — apply the resiliency baseline as directional best practices
B) No — skip it (suitable for PoCs/prototypes where rapid iteration matters more)
X) Other (please describe after [Answer]: tag below)

[N]: 
