# UI Business Rules — U2 web-app

## Guessing
- UBR-1: A guess is submitted only when it resolves to a catalog monster (selected from autocomplete).
- UBR-2: Already-guessed monsters are excluded from autocomplete and rejected on submit (mirrors US-5).
- UBR-3: Input is disabled once the puzzle is `solved`.
- UBR-4: Most recent guess row renders at the top of the board.

## Hints & Accessibility
- UBR-5: Every hint conveys meaning via **icon + text/aria-label**, never color alone (✓ match, ▲ higher, ▼ lower, ✕ no-match). (US-7, US-8, NFR-3)
- UBR-6: Board is keyboard navigable; autocomplete supports arrow/Enter/Esc.
- UBR-7: Interactive elements carry stable `data-testid` attributes for automation.

## Daily / Persistence
- UBR-8: On load, if a persisted `today` exists for the current local date, restore board + solved state; otherwise start a fresh board (stats preserved).
- UBR-9: At local midnight rollover (revisit/reload), a new daily puzzle is presented.
- UBR-10: A solved day cannot be replayed; the completed board and result remain visible.
- UBR-11: Stats update exactly once per solved day (idempotent via U1 guard).

## Sharing
- UBR-12: Share copies the spoiler-free `encodeShare` text; a toast confirms “Copied”.
- UBR-13: Share is available from the ResultModal after solving.

## Localization
- UBR-14: All visible chrome uses `t(key)`; no hard-coded UI strings.
- UBR-15: Language preference persists and restores across sessions (localStorage).
- UBR-16: Monster names remain in canonical form (not translated in v1).

## Theme
- UBR-17: Default theme follows system preference; manual toggle persists.

## Attribution
- UBR-18: Footer always shows SWARFARM/Com2uS attribution and non-affiliation disclaimer (US-14).

## Images
- UBR-19: When `monster.imageUrl` is null/broken, a placeholder image renders (US-15); layout reserves space to avoid shift.

## Error / Edge
- UEC-1: localStorage unavailable/full → app still playable; persistence degrades gracefully (in-memory for the session).
- UEC-2: Clipboard API unavailable → fallback copy path; if that fails, show the share text for manual copy.
- UEC-3: Pre-hydration render shows a skeleton to avoid SSR/client date mismatch.
