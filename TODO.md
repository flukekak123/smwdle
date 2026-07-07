# Smwdle — TODO / Roadmap

Live: https://smwdle.vercel.app · pushing to `main` auto-deploys.

Modes are considered complete (Classic, Silhouette, Emoji, Zoom, Skill, Higher/Lower). Next work, roughly prioritized:

## 1. Fairer daily answers (highest gameplay impact)
- [ ] Daily answer pool is currently **all 964 monsters ≥4★** — includes many obscure units, so the daily secret can feel unfair.
- [ ] Curate a "well-known" answer set, OR add an **Easy / Hard difficulty toggle** (Easy = famous monsters, Hard = full pool).
- [ ] Applies to every guess mode (they all draw the daily secret from the answer pool).

## 2. Cross-mode stats & sharing (engagement / virality)
- [ ] Only **Classic** tracks a streak (StatsPanel) and has a share button.
- [ ] Add per-mode streaks/stats (Silhouette, Emoji, Zoom, Skill) — likely a small shared hook + storage keys.
- [ ] Add a spoiler-free **share** to each mode (guess count + puzzle number + site link; no monster name).
- [ ] Higher/Lower: share best score.

## 3. Polish & onboarding
- [ ] "How to play" modal (first visit + a ? button).
- [x] Win celebration (confetti / subtle animation) on solve.
- [ ] Social preview: proper **OG image** + meta tags so shared links look good.
- [ ] Mobile pass on the wide Classic board (10 columns → horizontal scroll on phones; consider a condensed layout).
- [ ] Accessibility sweep (focus order, screen-reader labels on the new modes).

## 4. Quality / infra
- [ ] GitHub Actions CI: run `npm test` + `npm run build` on every push **before** Vercel deploys (PBT-08 CI integration).
- [ ] Playwright e2e for the full guess → solve → share → reload flow (data-testids already in place).
- [ ] Optional custom domain (e.g. smwdle.com) via Vercel.

## Known data caveats
- `gender` unused (SWARFARM has no gender) — column removed; field still in data.
- No release-date/year available from SWARFARM (skipped).
- Skill text is English only (SWARFARM provides English descriptions).
- Daily-answer pool = `inAnswerPool` (≥4★). Re-run `npm run fetch:monsters` to refresh data.
