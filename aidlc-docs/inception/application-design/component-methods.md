# Component Methods — Smwdle

Interface-level signatures only. Detailed business rules are defined per-unit in Functional Design.
Types are indicative TypeScript.

## Shared Types (indicative)
```ts
type Element = 'Fire' | 'Water' | 'Wind' | 'Light' | 'Dark';
type Role = 'Attack' | 'Defense' | 'HP' | 'Support';
type Gender = 'Male' | 'Female' | 'Unknown';

interface Monster {
  id: number;
  name: string;
  element: Element;
  naturalStars: 1 | 2 | 3 | 4 | 5;
  role: Role;
  family: string;
  source: string;          // e.g., 'Unknown Scroll', 'Fusion', 'Crafting'
  secondAwakening: boolean;
  gender: Gender;
  imageUrl: string | null; // null → placeholder
  inAnswerPool: boolean;   // curated pool flag
}

type CellStatus = 'match' | 'no-match' | 'higher' | 'lower'; // higher/lower for stars
interface AttributeResult { key: string; status: CellStatus; guessValue: string; }
interface GuessResult { monsterId: number; attributes: AttributeResult[]; correct: boolean; }
interface GameResult { puzzleNumber: number; date: string; guesses: GuessResult[]; solved: boolean; }
interface Stats { played: number; wins: number; currentStreak: number; maxStreak: number; distribution: Record<number, number>; }
```

## U1 — core-data-engine

### C1 MonsterCatalog
```ts
getAllMonsters(): Monster[]
getAnswerPool(): Monster[]                 // monsters where inAnswerPool === true
findByName(query: string, limit?: number): Monster[]   // typo-tolerant
getById(id: number): Monster | undefined
```

### C2 DataFetcher (build-time)
```ts
fetchRawMonsters(): Promise<RawMonster[]>
transform(raw: RawMonster[]): Monster[]
writeCatalog(monsters: Monster[], path: string): void
```

### C3 DailySelector
```ts
getDailyMonster(date: Date, pool: Monster[]): Monster    // deterministic
getPuzzleNumber(date: Date, epoch?: Date): number        // day index since epoch
```

### C4 GuessEvaluator
```ts
evaluate(guess: Monster, answer: Monster): GuessResult
isCorrect(guess: Monster, answer: Monster): boolean
```

### C5 ShareEncoder
```ts
encodeShare(result: GameResult): string   // emoji grid + puzzle #; no name/portrait
```

### C6 StatsEngine
```ts
emptyStats(): Stats
applyResult(prev: Stats, result: GameResult): Stats
```

### C7 GameStateCodec
```ts
serialize(state: PersistedState): string
deserialize(raw: string): PersistedState   // round-trip safe, version-tolerant
// PersistedState = { version, today: GameResult | null, stats: Stats, locale: 'en'|'th' }
```

## U2 — web-app (component props/handlers, indicative)

### C8 GameBoard
```ts
props: { guesses: GuessResult[]; columns: string[]; solved: boolean }
```
### C9 GuessInput
```ts
props: { candidates: Monster[]; guessedIds: number[]; onGuess: (m: Monster) => void; disabled: boolean }
```
### C10 HintCell
```ts
props: { attribute: AttributeResult }
```
### C11 ResultModal
```ts
props: { monster: Monster; result: GameResult; onShare: () => void; nextResetAt: Date }
```
### C12 StatsPanel
```ts
props: { stats: Stats }
```
### C13 LanguageToggle
```ts
props: { locale: 'en'|'th'; onChange: (l: 'en'|'th') => void }
```
### C15 AppShell
```ts
props: { children: ReactNode }  // wraps i18n + GameProvider contexts
```

## Hooks / Services (see services.md)
```ts
useGame(): { guesses; submitGuess(m); solved; result; secret? }
useStats(): { stats }
usePersistence(): { load(); save(state) }
```
