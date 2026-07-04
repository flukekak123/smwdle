# Frontend Components — U2 web-app

Style: clean card-grid, light+dark, violet/indigo accent, instant accessible hint reveal. Data/logic from U1 (`src/lib`).

## Component Hierarchy
```
AppShell (layout.tsx)
└─ Providers (I18nProvider, GameProvider, StatsProvider, ThemeProvider)
   └─ HomePage (page.tsx)
      ├─ Header
      │   ├─ Title / logo
      │   ├─ LanguageToggle
      │   ├─ ThemeToggle
      │   └─ StatsButton (opens StatsPanel)
      ├─ GuessInput
      ├─ GameBoard
      │   ├─ HintHeaderRow (attribute column labels)
      │   └─ GuessRow[]  → HintCell[7]
      ├─ ResultModal (when solved)
      ├─ StatsPanel (modal)
      └─ Footer (attribution/disclaimer)
```

## Component Specs (props / state)

### GuessInput  `data-testid="guess-input"`
- Props: `{ candidates: Monster[]; guessedIds: number[]; disabled: boolean; onGuess(m: Monster): void }`
- Local state: `query: string`, `activeIndex: number`, `open: boolean`.
- Behavior: on query change → `catalog.findByName(query)` filtered to exclude `guessedIds`; arrow keys move `activeIndex`; Enter selects; Esc closes. Each option `data-testid="guess-option-{id}"`.

### GameBoard  `data-testid="game-board"`
- Props: `{ guesses: GuessResult[]; solved: boolean }`
- Renders `HintHeaderRow` + one `GuessRow` per guess (most recent on top).

### GuessRow / HintCell  `data-testid="hint-cell-{key}"`
- HintCell props: `{ attribute: AttributeResult }`
- Renders value + status styling: `match` → green bg + ✓; `no-match` → neutral bg; `higher` → ▲ icon; `lower` → ▼ icon. Color is always paired with an icon and `aria-label` (accessibility — not color alone).

### ResultModal  `data-testid="result-modal"`
- Props: `{ monster: Monster; result: GameResult; nextResetAt: Date; onShare(): void; onClose(): void }`
- Shows portrait (`imageUrl` or placeholder), name, guess count, current streak, countdown timer, Share button (`data-testid="share-button"`).

### StatsPanel  `data-testid="stats-panel"`
- Props: `{ stats: Stats }` → played, win%, current/max streak, guess-distribution bars.

### LanguageToggle `data-testid="language-toggle"`  / ThemeToggle `data-testid="theme-toggle"`
- LanguageToggle: `{ locale; onChange(l) }` → 'EN' / 'ไทย'.
- ThemeToggle: cycles system/light/dark; persists to localStorage.

### Footer
- Static attribution: “Data from SWARFARM. Summoners War is a trademark of Com2uS. Non-commercial fan project, not affiliated with Com2uS.”

## User Interaction Flows
1. **Guess**: type → autocomplete → select → `onGuess` → GameProvider evaluates → new GuessRow renders with hints.
2. **Solve**: correct guess → `solved=true` → StatsProvider updates → ResultModal opens.
3. **Share**: ResultModal → Share → `encodeShare` → clipboard → toast “Copied!”.
4. **Language**: toggle → all strings re-render in chosen locale; preference persisted.
5. **Revisit solved day**: on load, persisted `today` restores the finished board + ResultModal available.

## Form / Input Validation
- Guess accepted only if it resolves to a catalog monster and is not already guessed; otherwise input clears with a subtle “already guessed / not found” hint.

## API Integration Points
- None (no backend). All data via U1 imports; persistence via localStorage (PersistenceService).
