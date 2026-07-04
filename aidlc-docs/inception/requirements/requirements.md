# Requirements — Smwdle (Summoners War Daily Monster Guessing Game)

## 1. Intent Analysis Summary

| Field | Value |
|-------|-------|
| **User Request** | Build a website like https://onepiecedle.net/ — guess one character (monster) per day with attribute-based hints — but using **Summoners War** monsters. |
| **Request Type** | New Project (greenfield) |
| **Scope Estimate** | System-wide (full web application) |
| **Complexity Estimate** | Moderate |
| **Clarity** | Clear concept; details resolved via clarifying questions |

## 2. Product Vision

A free, browser-based daily puzzle game. Every day there is **one secret Summoners War monster**, the same for all players worldwide. Players guess monsters; after each guess the game reveals how the guessed monster's attributes compare to the secret monster (match / partial / no-match, with directional hints for numeric attributes), in the style of Loldle / onepiecedle "Classic" mode. Anyone can play instantly — **no account or login required**.

## 3. Functional Requirements

### FR-1 — Daily Puzzle
- FR-1.1: Exactly **one puzzle per calendar day**; all players on the same calendar date get the same monster.
- FR-1.2: The daily secret monster is deterministically selected from a **curated answer pool** (~150 well-known monsters) based on the (local) date, so players get the same answer for a given date without a backend needed to coordinate.
- FR-1.3: The puzzle **resets at local midnight** (each player's own timezone). A countdown to the next puzzle (next local midnight) is shown after completion.

### FR-2 — Guessing
- FR-2.1: Players may guess **any monster in the full roster** (1000+ monsters) via an autocomplete search input (name-based, typo-tolerant).
- FR-2.2: Each guess is added to a results list showing the compared attributes.
- FR-2.3: No hard limit on number of guesses (endless until solved). *(Open to a capped-guess variant later; not in v1.)*
- FR-2.4: A monster already guessed cannot be guessed again (de-duplicated / disabled in the list).

### FR-3 — Attribute Comparison (Classic hints)
For each guess, compare the following attributes against the secret monster:

| Attribute | Comparison behavior |
|-----------|--------------------|
| **Element** | Fire / Water / Wind / Light / Dark — exact match (green) or no match (grey) |
| **Natural star rating** | 1★–5★ — exact match, or directional hint (▲ answer is higher / ▼ answer is lower) |
| **Type / Role** | Attack / Defense / HP / Support — exact or no match |
| **Family / Archetype** | e.g., Vampire, Werewolf, Fairy — exact or no match |
| **Obtainable source** | e.g., Unknown/Mystical Scroll, Fusion, Crafting, Light&Dark Scroll — exact or no match |
| **Second Awakening available** | Yes / No — exact or no match |
| **Gender** | Male / Female / (Unknown/None) — exact or no match |

- FR-3.1: Exact match → **green**; numeric near/directional → **arrow indicator**; no match → **neutral/grey**. (Yellow "partial" reserved for future multi-value attributes.)
- FR-3.2: On solving, reveal the monster's **name and portrait image** and a short summary.

### FR-4 — Win / End State
- FR-4.1: On a correct guess, show a success screen: monster portrait, number of guesses, current streak.
- FR-4.2: Provide a **Wordle-style shareable result** (emoji grid of hint colors + guess count + puzzle number) that copies to clipboard. Share text must **not** spoil the answer.

### FR-5 — Stats & Streaks (client-side)
- FR-5.1: Track games played, win %, current streak, max streak, and guess distribution.
- FR-5.2: All stats persist in the browser via **localStorage** only. No server-side user data.
- FR-5.3: Prevent replaying the same day's solved puzzle (show the completed state on revisit).

### FR-6 — Practice Mode *(secondary, may be deferred)*
- FR-6.1: Optional "unlimited / practice" mode that serves a random monster not tied to the date, for players who want to keep playing. Does not affect daily stats.

### FR-7 — Data Catalog
- FR-7.1: Monster data sourced from a **public community source (SWARFARM)**, fetched once and **cached locally as static JSON** in the app (not queried live per request).
- FR-7.2: Each monster record includes: id, name, element, natural stars, type/role, family, obtainable source, second-awakening flag, **gender**, and portrait image URL/asset.
- FR-7.5: **Portrait images** are used on the reveal/win screen (and available for future Silhouette mode). Where a source image is missing, a **placeholder image** is used until a real asset is supplied.

### FR-8 — Localization (English + Thai)
- FR-8.1: The UI supports **English and Thai** via i18n; a language toggle lets the player switch.
- FR-8.2: All user-facing strings are externalized into locale resource files (no hard-coded UI text).
- FR-8.3: Monster names are shown in their canonical (source) form; only surrounding UI chrome is translated for v1 (monster-name translation is a future enhancement).
- FR-8.4: Selected language preference persists in localStorage.
- FR-7.3: A build-time or one-off script produces the cached dataset; the curated answer pool is a marked subset.
- FR-7.4: Data licensing/attribution to SWARFARM (and Com2uS as the game owner) to be respected and displayed in a credits/footer section.

## 4. Non-Functional Requirements

- NFR-1 (Performance): Puzzle loads and autocomplete respond fast; dataset is static and client-cached. Target first meaningful paint < 2s on broadband.
- NFR-2 (Availability): Static site on **Vercel**; no runtime backend required for core play → high availability, low ops.
- NFR-3 (Usability / Accessibility): Mobile-first responsive layout; color hints paired with **icons/text** (not color alone) for color-blind accessibility.
- NFR-4 (Privacy): No personal data collected or stored server-side; only anonymous localStorage on the user's device.
- NFR-5 (Maintainability): Clear separation between data (JSON), game logic (pure functions), and UI (React components) to make roster updates trivial.
- NFR-6 (Testability): Core comparison logic implemented as pure, deterministic functions to enable property-based and example-based tests.
- NFR-7 (Localization): **English and Thai** shipped in v1 via i18n; strings externalized so more locales can be added later.
- NFR-8 (Legal/Attribution): Non-commercial fan project; display data-source attribution and a "not affiliated with Com2uS" disclaimer.

## 5. Technical Decisions

| Area | Decision |
|------|----------|
| Framework | **Next.js (React) + TypeScript** |
| Styling | **Tailwind CSS** |
| Hosting/Deploy | **Vercel** |
| Data | Static local **JSON**, generated from SWARFARM, curated answer subset |
| State/Stats | Browser **localStorage** |
| Daily selection | Deterministic **local-date**-seeded index into answer pool (no backend) |
| i18n | English + Thai, externalized locale resources |
| PBT Framework | **fast-check** (per PBT-09) |
| Accounts/Auth | **None** |

## 6. Extension Configuration (from opt-in)

| Extension | Enabled | Mode | Rationale |
|-----------|---------|------|-----------|
| Security Baseline | **No** | — | No login, no server-stored personal data; minimal attack surface. Standard web-security hygiene still followed. |
| Property-Based Testing | **Yes** | **Partial** | Real comparison/serialization logic. Partial = PBT-02, PBT-03, PBT-07, PBT-08, PBT-09 enforced. |
| Resiliency Baseline | **No** | — | Web game, not business-critical; static hosting reliability sufficient. |

## 7. Out of Scope for v1 (Backlog)
- Silhouette/Image, Hint/Quote, and Emoji game modes (design allows adding them later; portrait images are already captured to enable Silhouette later).
- Optional login / cross-device streak sync.
- Capped-guess (limited attempts) variant.
- Additional locales beyond English & Thai; translation of monster names.
- Leaderboards or any social/server features.

## 8. Assumptions
- A1: SWARFARM (or equivalent community data) is accessible and its data may be cached for a non-commercial fan project with attribution. *(To be verified during data-fetch implementation; fallback = manually curated JSON.)*
- A2: Monster attributes listed in FR-3 are available/derivable from the source data.
- A3: "Everyone can play, one monster per day" ⇒ no login; global shared daily answer.

## 9. Key Requirements Summary
- Daily, no-login, shared **Classic-mode** guessing game for Summoners War monsters; resets at **local midnight**.
- Guess full roster; daily answer from a **curated ~150 pool**; **seven** compared attributes (Element, Stars ▲/▼, Role, Family, Source, 2A, **Gender**).
- Shareable emoji result; localStorage streaks/stats; portrait images (placeholders where missing); **English + Thai** i18n.
- **Next.js + TS + Tailwind on Vercel**, static SWARFARM-derived JSON, **fast-check** PBT (Partial).
