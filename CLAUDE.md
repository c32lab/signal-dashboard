# CLAUDE.md - Signal Dashboard

## Project Overview
React + Vite + Tailwind + Recharts + SWR frontend dashboard for displaying crypto signal system decisions and quality data.

## Tech Stack
- React 19 + TypeScript 5.9 + Vite 7
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- Recharts 3 (charts)
- SWR 2 (data fetching + caching)
- React Router v7 (routing)

## ⛔ Strictly Forbidden
- **Do NOT change ports** — dev :3080, signal API :18810
- Predict code has been moved to the standalone predict-dashboard project; this repo contains no predict-related code

## Development
```bash
npm run dev    # Vite dev server on :3080
npm run build  # tsc + vite build
npm run lint   # ESLint
```

## Config Hierarchy (⚠️ Critical — RCA-007 Lesson)
Currently only one config layer: `vite.config.ts` (proxy + port).
If `.env` files are added in the future, document their priority and scope here.

### Proxy Mapping
| Prefix | Target | Backend Service |
|--------|--------|----------------|
| `/api` | `localhost:18810` | amani-signal (signal engine) |
| `/predict-api` | `localhost:18801` | amani-predict (prediction engine) |
| `/data-api` | `localhost:8081` | data-eng (data engineering) |

`/predict-api` and `/data-api` have path rewrite — prefix is stripped before forwarding.

## Page Structure
| Route | Page | Data Source |
|-------|------|-------------|
| `/` | Dashboard (signal overview) | signal API |
| `/backtest` | Backtest A/B Test (backtest comparison) | signal API |
| `/trading` | Trading Dashboard (trade records) | signal API |
| `/history` | Trader History (event library) | signal API |
| `/quality` | Quality Tracker (signal quality) | signal API |
| `/timeline` | Signal Timeline | signal API |
| `/advanced/system` | System Health | signal API |
| `/code-quality` | Code Quality (internal tool, not in nav) | — |

## Percentage Field Format (⚠️ Critical — RCA-006 Lesson)
**Read `src/utils/fieldConventions.ts` before modifying any percentage display**

### Rules
- Fields with `_pct` suffix → already percentage (0-100), display directly with `%`
- `confidence` / `strength` → 0-1 decimal, frontend ×100
- `funding_rate` → very small decimal, frontend ×100
- `price_change` / `avg_impact` / `expected_impact` → already percentage, **absolutely do NOT ×100**
- `accuracy['1h_pct']` / `accuracy['4h_pct']` → already percentage (0-100), do NOT ×100

### `_meta` Fields from API
Most endpoints return `_meta` fields annotating value formats (e.g. `"confidence": "0-1"`); frontend can safely ignore them.

## Data Validation (Fallback Mechanism)
`src/utils/dataValidation.ts` has `STATIC_PRICE_RANGES` hardcoded fallback values.
Priority: data-eng API (`/data-api/api/price-ranges`) > static fallback.
**Keep both layers consistent when modifying.**

## File Structure
```
src/
├── api/          # API client (index.ts=signal)
├── assets/       # Static assets
├── components/   # Shared components (with backtest/ dashboard/ history/ quality/ subdirs)
├── hooks/        # SWR hooks (useApi.ts, useSymbols.tsx)
├── pages/        # Page components (one file per page)
├── types/        # TypeScript type definitions
├── utils/        # Utility functions (field formatting, data validation, formatting)
├── App.tsx       # Router + navigation layout
├── index.css     # Global styles (Tailwind entry)
└── main.tsx      # Entry point
```

## Theme
Dark theme: `bg-gray-950` (page background), `bg-gray-900` (cards), `border-gray-800`.

## Commit Guidelines
- Prefix: feat / fix / docs / config / chore / refactor / test
- `git add` specific files only, never use `git add -A`
- Run `npx tsc --project tsconfig.app.json --noEmit` before committing to ensure zero TS errors (note: tsconfig.app.json, not tsconfig.json)
- **Pre-commit hook** (`.git/hooks/pre-commit`): automatically prevents port tampering — checks vite.config.ts doesn't contain 18810, dashboard port must be 3080, nginx.conf/docker-compose.yml not changed to wrong ports
- **Deploy immediately after commit:** `cd ~/signal-dashboard && docker compose down && docker compose up -d --build`
- Docker build uses `tsc -b` (stricter than tsconfig.app.json), ensure both have 0 errors

## Recharts Tooltip (⚠️ Repeated Lesson ×3)
Recharts Tooltip `labelFormatter` / `formatter` callback parameter types may be `undefined` or `ReactNode`, not `string`. **Defensive checks required:**
```typescript
// ✅ Correct
labelFormatter={(ts: unknown) => formatDateTime(String(ts ?? ''))}
formatter={(value: unknown, name: unknown) => [`${Number(value ?? 0).toFixed(2)}%`, String(name ?? '')]}

// ❌ Wrong — will cause TS type errors
labelFormatter={(ts) => formatDateTime(String(ts))}
formatter={(value, name) => [`${Number(value).toFixed(2)}%`, String(name)]}
```

## E2E Tests (Playwright)
```bash
npm run test:e2e      # Run all E2E tests (headless chromium)
npm run test:e2e:ui   # Run with Playwright UI mode
```
- Config: `playwright.config.ts` — chromium only, baseURL `http://localhost:3080`
- Test dir: `e2e/` — one spec file per page/feature
- Tests are resilient to backend being unavailable (verify rendering, navigation, no crashes)
- `webServer` config auto-starts `npm run dev` if not already running

## Forbidden
- **Only one CC session per repo at a time** — parallel CC sessions on the same repo cause conflicts, file overwrites, and port changes. Execute serially, not in parallel
- **Absolutely do NOT modify vite.config.ts proxy ports** — `/api` → :18810, `/predict-api` → :18801, `/data-api` → :8081. These ports are fixed
- **Absolutely do NOT modify nginx.conf / docker-compose.yml / Dockerfile ports** — Dashboard port is **3080** (both dev and production). :18810 is the amani-signal API, not the frontend. CC must not touch port config
- **Absolutely do NOT delete or revert existing component files** — especially ConfidenceDistribution.tsx, AccuracyKPI.tsx, etc. These are formally reviewed features, not out-of-scope artifacts
- Do NOT multiply `price_change` / `avg_impact` / `expected_impact` by 100
- Do NOT introduce new CSS frameworks (Tailwind is already in use)
- Do NOT use `sudo npm`
