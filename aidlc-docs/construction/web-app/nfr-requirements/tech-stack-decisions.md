# Tech Stack Decisions — U2 web-app

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Framework | **Next.js 14 (App Router)** + React 18 + TypeScript | SSG shell, easy Vercel deploy, confirmed in Application Design. |
| Styling | **Tailwind CSS** | Utility-first, fast, theme-able (light/dark via `class`). |
| i18n | **next-intl** | App-Router-friendly message catalogs; client toggle, no URL locales. |
| State | **React Context + hooks** | No extra store dependency; scope is modest. |
| Icons | Inline SVG (self-contained) | No external requests; accessible with titles. |
| Clipboard | `navigator.clipboard` + textarea fallback | Reliability across browsers. |
| Component tests | **Vitest + React Testing Library + jsdom** | Shares runner with U1; smoke tests + i18n key-parity test. |
| Deploy | **Vercel** | Static/SSG hosting; deploy config in Build & Test. |

## Additional Dependencies (to add at Code Generation)
- `next`, `react`, `react-dom`
- `next-intl`
- `tailwindcss`, `postcss`, `autoprefixer`
- dev: `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`

## Notes
- No PBT-specific framework additions for U2 (fast-check already present); the i18n key-completeness check (US-16 🧪) is a data-level property test over the locale JSON files.
- Vitest config gains a `jsdom` environment for component tests while `node` remains for U1 logic tests.
