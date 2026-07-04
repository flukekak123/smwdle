# Build Instructions

## Prerequisites
- **Runtime**: Node.js ≥ 18 (verified on v20.19).
- **Package manager**: npm ≥ 10.
- **Build tool**: Next.js 14 (webpack) via `next build`.
- **Environment variables**: none required for build or runtime (no backend/secrets).
- **System**: any (macOS/Linux/Windows); ~1 GB free disk for `node_modules`/`.next`.

## Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Regenerate the monster catalog from SWARFARM
```bash
npm run fetch:monsters   # requires internet; expands src/data/monsters.json to full roster
```
If skipped, the committed 40-monster starter dataset is used.

### 3. Build the Production Site
```bash
npm run build
```

### 4. Verify Build Success
- **Expected output**: `✓ Compiled successfully`, `✓ Generating static pages (4/4)`, exit code 0.
- **Build artifacts**: `.next/` (static shell + assets). Route `/` marked `○ (Static)`.
- **Acceptable warnings**: npm audit advisories in transitive dev deps; Vite CJS deprecation notice (test tooling only).

### 5. Run Locally
```bash
npm run dev     # http://localhost:3000 (development)
# or
npm run build && npm run start   # production server
```

## Troubleshooting

### `.js` import cannot be resolved during build
- **Cause**: `src/lib` uses `.js` specifiers that map to `.ts` sources.
- **Solution**: ensured via `next.config.mjs` `resolve.extensionAlias` (`.js → .ts/.tsx/.js`). Keep that config.

### ESLint plugin load error during build
- **Cause**: stale `.eslintrc.json` referencing an uninstalled plugin.
- **Solution**: `.eslintrc.json` extends `next/core-web-vitals` (already applied).

### Dependency install errors
- **Solution**: delete `node_modules` + `package-lock.json`, re-run `npm install`.
