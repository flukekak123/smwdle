# Domain Entities — U1 core-data-engine

## Monster
| Field | Type | Notes |
|-------|------|-------|
| id | number | Unique (SWARFARM id or stable synthetic) |
| name | string | Display/canonical name (awakened) |
| element | 'Fire'\|'Water'\|'Wind'\|'Light'\|'Dark' | |
| naturalStars | 1..5 | Natural rarity |
| role | 'Attack'\|'Defense'\|'HP'\|'Support' | |
| family | string | e.g., 'Vampire', 'Werewolf' |
| source | string | Obtainable source (normalized set, see business-rules) |
| secondAwakening | boolean | 2A available |
| gender | 'Male'\|'Female'\|'Unknown' | |
| imageUrl | string \| null | null → placeholder |
| inAnswerPool | boolean | Member of curated ~150 answer pool |

## AttributeResult
| Field | Type | Notes |
|-------|------|-------|
| key | string | 'element'\|'naturalStars'\|'role'\|'family'\|'source'\|'secondAwakening'\|'gender' |
| status | 'match'\|'no-match'\|'higher'\|'lower' | higher/lower only for naturalStars |
| guessValue | string | Human-readable value from the guess |

## GuessResult
| Field | Type | Notes |
|-------|------|-------|
| monsterId | number | Guessed monster |
| attributes | AttributeResult[] | Fixed order (see business-rules ATTRIBUTE_ORDER) |
| correct | boolean | All attributes match ⇔ same monster |

## GameResult
| Field | Type | Notes |
|-------|------|-------|
| puzzleNumber | number | Day index since epoch + 1 |
| date | string | ISO local date 'YYYY-MM-DD' |
| guesses | GuessResult[] | In submission order |
| solved | boolean | |

## Stats
| Field | Type | Notes |
|-------|------|-------|
| played | number | Days solved (games completed) |
| wins | number | = played (no loss state) |
| currentStreak | number | Consecutive solved calendar days |
| maxStreak | number | |
| lastSolvedDate | string \| null | ISO local date, for streak continuity |
| distribution | Record<number,number> | guessCount → times |

## PersistedState (localStorage payload)
| Field | Type | Notes |
|-------|------|-------|
| version | number | Schema version (currently 1) |
| today | GameResult \| null | In-progress or solved state for current date |
| stats | Stats | |
| locale | 'en'\|'th' | UI language |

## Relationships
- A `GameResult` references monsters by id (resolved via `MonsterCatalog`).
- `Stats` is derived purely from a stream of solved `GameResult`s.
- `PersistedState` composes today's `GameResult` + `Stats` + `locale`.
