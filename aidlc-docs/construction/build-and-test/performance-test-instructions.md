# Performance Test Instructions

## Context
Smwdle is a **static client-side site** (SSG on a CDN) with no backend. Traditional load/stress testing of a server is **N/A**; performance is about bundle size, load speed, and client interaction latency.

## Targets (from NFR-U2)
- First Contentful Paint < 2s; interactive < 3s on broadband.
- First Load JS reasonable for a game (current: **~113 kB** for `/`).
- Autocomplete/response < 50 ms per keystroke.
- CLS ~0 (reserved image space).

## How to Measure

### 1. Bundle / build size
```bash
npm run build   # inspect the "First Load JS" column (currently 113 kB for /)
```

### 2. Lighthouse (load + a11y + best practices)
```bash
npm run build && npm run start
# In Chrome DevTools → Lighthouse → run on http://localhost:3000
# Targets: Performance ≥ 90, Accessibility ≥ 95
```

### 3. Interaction latency
- U1 micro-benchmarks already bounded (search < 10 ms over roster; see NFR-U1).
- Manually verify autocomplete feels instant while typing.

## If Targets Missed
- Reduce First Load JS (code-split modals, defer non-critical providers).
- Ensure images lazy-load with fixed dimensions (no CLS).
- Confirm `monsters.json` size stays reasonable as the roster grows (consider trimming fields or lazy-loading the full roster while keeping the answer pool inline).
