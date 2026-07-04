# Integration Test Instructions

## Purpose
Verify the two units work together: **U2 web-app** consuming **U1 core-data-engine** (logic + `monsters.json`), plus browser-side persistence.

## Scenarios

### Scenario 1: U1 logic → U2 rendering (guess → hints)
- **Description**: A guess routed through `GameProvider.submitGuess` → U1 `evaluate` → rendered by `GameBoard`/`HintCell`.
- **Covered by**: `tests/components/GuessInput.test.tsx` (selection emits monster) + `HintCell.test.tsx` (renders status). Full flow exercised manually and by the running app.
- **Manual steps**: `npm run dev` → type a monster → submit → confirm a 7-cell hint row appears with correct colors/icons; guess the daily monster → ResultModal opens.
- **Expected**: hints match U1 `evaluate` output; solving opens the result modal and updates stats.

### Scenario 2: U1 catalog/data → U2 autocomplete
- **Description**: `catalog.findByName` feeds `GuessInput`.
- **Covered by**: `GuessInput.test.tsx` (suggests "Lushen", excludes guessed).
- **Expected**: suggestions come from `monsters.json`; already-guessed excluded.

### Scenario 3: Persistence round-trip (U1 codec ↔ U2 storage)
- **Description**: `GameProvider`/`persistence` serialize state via U1 `GameStateCodec` into localStorage and restore it.
- **Manual steps**: make guesses → reload the page → board and stats persist; solve → reload → completed state restored (not replayable).
- **Expected**: state survives reload; corrupt localStorage falls back to defaults (fail-safe).

### Scenario 4: i18n switch
- **Manual steps**: click language toggle EN ↔ ไทย → all chrome switches; reload → preference restored.
- **Covered by**: `i18n.test.ts` (key parity) + manual.

## Run
```bash
npm test          # component-level integration (RTL) + i18n parity
npm run build && npm run start   # then manually verify Scenarios 1–4 at http://localhost:3000
```

## Notes
- No external services, databases, or containers to start (static client app).
- Recommended future addition: Playwright e2e for the full guess→solve→share→reload journey (see e2e-test-instructions.md).
