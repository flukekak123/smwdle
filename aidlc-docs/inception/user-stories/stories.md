# User Stories — Smwdle

**Breakdown**: Feature-based · **AC format**: Given/When/Then · **Scope**: v1
**Legend**: 🧪 = story whose acceptance criteria drive property-based tests (PBT Partial mode).

---

## Epic A — Daily Puzzle

### US-1: Play today's puzzle without signing up
**As a** Casual Daily Player, **I want** to open the site and immediately start guessing, **so that** I can play without creating an account.
**Acceptance Criteria**
- Given I visit the site, When the page loads, Then the daily puzzle is ready and I can guess with no login or sign-up prompt.
- Given I have never visited before, When I load the page, Then I see brief instructions on how to play.

### US-2: One shared secret monster per day 🧪
**As a** player, **I want** everyone on the same date to get the same monster, **so that** results are comparable and fair.
**Acceptance Criteria**
- Given a calendar date, When the daily monster is selected, Then the selection is deterministic (same date ⇒ same monster) from the curated answer pool.
- Given two players on the same calendar date, When each loads the puzzle, Then they receive the same secret monster.
- Given the same date is used repeatedly, When selection runs, Then it always returns the same monster (idempotent/deterministic). 🧪

### US-3: Daily reset with countdown
**As a** Casual Daily Player, **I want** a new puzzle at local midnight and a countdown to the next one, **so that** I know when to come back.
**Acceptance Criteria**
- Given local midnight passes, When I load or revisit, Then a new daily monster (for the new local date) is presented.
- Given I finished today's puzzle, When I view the end screen, Then a countdown timer to the next puzzle (next local midnight) is displayed.

---

## Epic B — Guessing

### US-4: Search and guess any monster with autocomplete
**As a** SW Veteran, **I want** to type a monster name and pick from suggestions across the full roster, **so that** I can guess accurately and quickly.
**Acceptance Criteria**
- Given I type in the guess box, When at least one character matches, Then an autocomplete list of matching monsters (from the full roster) appears.
- Given a minor typo, When I type, Then reasonably close matches still appear (typo-tolerant).
- Given the autocomplete is open, When I use arrow keys and Enter, Then I can select a monster via keyboard (accessibility).
- Given I select a monster, When I submit, Then it is recorded as a guess.

### US-5: Prevent duplicate guesses
**As a** player, **I want** monsters I already guessed to be unavailable, **so that** I don't waste a guess.
**Acceptance Criteria**
- Given I already guessed monster X, When I search again, Then X is disabled/hidden or rejected with a message.

### US-6: Unlimited guesses until solved
**As a** Casual Player, **I want** to keep guessing until I find the monster, **so that** the game stays approachable.
**Acceptance Criteria**
- Given I have not solved the puzzle, When I submit a wrong guess, Then I may keep guessing with no attempt cap.
- Given I submit the correct monster, When it is evaluated, Then the puzzle is marked solved.

---

## Epic C — Attribute Hints

### US-7: See attribute comparison per guess 🧪
**As a** player, **I want** each guess to show how its attributes compare to the secret monster, **so that** I can deduce the answer.
**Acceptance Criteria**
- Given I submit a guess, When it is evaluated, Then a row shows Element, Natural Stars, Type/Role, Family, Obtainable Source, Second-Awakening, and Gender comparisons.
- Given an attribute exactly matches, When rendered, Then it is shown as a match (green + confirming icon/text). 🧪
- Given an attribute does not match, When rendered, Then it is shown as no-match (neutral/grey + icon/text). 🧪
- Given the comparison runs, When rendered, Then no attribute is ever mislabeled relative to the secret monster (comparison is correct for all inputs). 🧪

### US-8: Directional hint for natural stars 🧪
**As a** player, **I want** an up/down arrow when my guess's star rating differs, **so that** I can narrow the rarity.
**Acceptance Criteria**
- Given my guess's natural stars are lower than the answer, When rendered, Then an "answer is higher" (▲) indicator shows.
- Given my guess's natural stars are higher, When rendered, Then an "answer is lower" (▼) indicator shows.
- Given they are equal, When rendered, Then a match indicator shows and no arrow. 🧪

### US-9: Accurate, up-to-date monster data
**As a** SW Veteran, **I want** correct attributes for every monster, **so that** hints are trustworthy.
**Acceptance Criteria**
- Given the local dataset, When a monster is displayed, Then its element, stars, role, family, source, 2A flag, and gender match the source-of-truth data.
- Given missing/unknown attribute data, When rendered, Then it is handled gracefully (e.g., "Unknown") without breaking comparison.

### US-10: Fair curated answer pool
**As a** SW Veteran, **I want** daily answers drawn from well-known monsters, **so that** the puzzle is challenging but fair.
**Acceptance Criteria**
- Given the answer pool, When a daily monster is chosen, Then it comes only from the curated (~150) pool, never the full obscure roster.
- Given the full roster, When I guess, Then any roster monster is still an allowed guess.

---

## Epic D — Win & Share

### US-11: Win screen and shareable result 🧪
**As a** Casual Player, **I want** a success screen and a copyable emoji result, **so that** I can share without spoiling the answer.
**Acceptance Criteria**
- Given I solve the puzzle, When the win screen shows, Then it displays the monster name, portrait, guess count, and current streak.
- Given I tap "Share", When the result is generated, Then an emoji grid + puzzle number + guess count is copied to the clipboard.
- Given the share text, When inspected, Then it does NOT contain the monster's name or portrait (no spoilers).
- Given the same solved game state, When I generate the share text twice, Then the output is identical (deterministic). 🧪

---

## Epic E — Stats & Persistence

### US-12: Track streak and stats locally
**As a** Casual Player, **I want** my streak and stats saved on my device, **so that** progress persists without an account.
**Acceptance Criteria**
- Given I complete puzzles, When I revisit, Then games played, win %, current streak, max streak, and guess distribution are shown from localStorage.
- Given no server account exists, When I play, Then no personal data is sent to or stored on a server.

### US-13: Preserve completed daily state 🧪
**As a** player, **I want** revisiting a solved day to show my completed result, **so that** I can't re-play or lose my record.
**Acceptance Criteria**
- Given I solved today's puzzle, When I reload, Then the completed state (my guesses + result) is restored, not reset.
- Given I persist and reload game state, When it is serialized then deserialized, Then the restored state equals the saved state (round-trip). 🧪

---

## Epic F — Trust & Compliance

### US-14: Attribution and disclaimer
**As a** product owner, **I want** clear data attribution and a non-affiliation disclaimer, **so that** the fan project respects the source and IP owner.
**Acceptance Criteria**
- Given any page, When I view the footer, Then it credits the data source (SWARFARM) and states the project is a non-commercial fan project not affiliated with Com2uS.

---

## Epic G — Presentation & Localization

### US-15: Monster portraits with graceful placeholders
**As a** player, **I want** to see the monster's portrait when revealed, **so that** the result feels rich and recognizable.
**Acceptance Criteria**
- Given I solve the puzzle, When the reveal screen shows, Then the secret monster's portrait image is displayed.
- Given a monster has no available portrait asset, When it would be shown, Then a placeholder image is displayed instead of a broken image.
- Given portraits load, When on a slow connection, Then layout does not break while images load (reserved space / graceful loading).

### US-16: Switch UI language (English / Thai) 🧪
**As a** player, **I want** to switch the interface between English and Thai, **so that** I can play in my preferred language.
**Acceptance Criteria**
- Given the app, When I use the language toggle, Then all UI chrome switches between English and Thai.
- Given no UI string is hard-coded, When any locale is active, Then there are no untranslated/missing-key strings visible.
- Given I selected a language, When I return later, Then my language preference is restored from localStorage.
- Given a translation key, When looked up in a locale then rendered, Then every key present in the base (English) locale exists in the Thai locale (no missing keys). 🧪

---

## Future (Backlog — not in v1)
- Additional modes: Silhouette/Image, Hint/Quote, Emoji.
- Optional login for cross-device streak sync.
- Capped-guess (limited attempts) variant.
- Additional locales beyond EN/Thai; translation of monster names.
- Practice/unlimited mode (secondary; may land in v1 if time permits — see requirements FR-6).

---

## INVEST & PBT Notes
- Each story is Independent, Valuable, Estimable, Small, and Testable; acceptance criteria are written as testable Given/When/Then.
- 🧪 stories (US-2, US-7, US-8, US-11, US-13, US-16) carry determinism / correctness / round-trip / completeness criteria that map to property-based tests under PBT Partial mode (PBT-02 round-trip, PBT-03 invariants).
