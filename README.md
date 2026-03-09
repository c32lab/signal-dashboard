# Signal Dashboard

Real-time monitoring dashboard for a cryptocurrency signal system -- visualizing decisions, predictions, and quality metrics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | [Vite 7](https://vite.dev/) |
| UI | [React 19](https://react.dev/) + TypeScript 5.9 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`) |
| Charts | [Recharts 3](https://recharts.org/) |
| Data fetching | [SWR 2](https://swr.vercel.app/) |
| Routing | [React Router v7](https://reactrouter.com/) |
| Unit tests | [Vitest 4](https://vitest.dev/) + Testing Library |
| E2E tests | [Playwright](https://playwright.dev/) |
| Production | Nginx (Alpine) via multi-stage Docker build |

## Directory Structure

```
signal-dashboard/
├── src/
│   ├── api/             # API client (fetcher functions)
│   ├── components/      # Shared & domain-specific UI components
│   │   ├── layout/      #   NavBar, page shell
│   │   ├── backtest/    #   Backtest-related components
│   │   ├── dashboard/   #   Main dashboard widgets
│   │   ├── decision/    #   Decision table & detail views
│   │   ├── history/     #   Trader history components
│   │   ├── quality/     #   Quality tracker charts
│   │   ├── timeline/    #   Signal timeline components
│   │   └── trading/     #   Trading dashboard components
│   ├── hooks/           # Custom hooks (useApi, useParamMatrix, useSymbols, useTimelineData)
│   ├── pages/           # Route-level page components (8 pages)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Formatting, validation, normalization helpers
│   ├── App.tsx          # Router & provider setup
│   └── main.tsx         # Entry point
├── e2e/                 # Playwright E2E test specs
├── grafana/             # Grafana dashboard JSON (api-monitoring.json)
├── public/              # Static assets
├── Dockerfile           # Multi-stage build (Node 20 -> Nginx Alpine)
├── docker-compose.yml   # Single-service compose file
├── nginx.conf           # Production reverse-proxy config
├── vite.config.ts       # Dev server, proxy, build & test config
└── playwright.config.ts # E2E test configuration
```

## Routes

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `Dashboard` | Signal overview -- confidence, strength, market indicators |
| `/quality` | `QualityTracker` | Signal quality metrics and accuracy trends |
| `/history` | `TraderHistory` | Decision event log and archive |
| `/backtest` | `BacktestDashboard` | Backtest results, parameter matrix, walk-forward analysis |
| `/trading` | `TradingDashboard` | Trading records, balances, and positions |
| `/timeline` | `SignalTimeline` | Chronological signal & decision timeline |
| `/advanced/system` | `SystemHealthPage` | Service status and system diagnostics |
| `/code-quality` | `CodeQuality` | Code quality metrics dashboard |

All pages are lazy-loaded via `React.lazy()` with a `Suspense` fallback.

## API Endpoints

The dashboard consumes three backend services through a reverse proxy.

### Signal Engine (`amani-signal` -- port 18810)

Proxied at `/api` (no prefix rewrite).

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Service health check |
| `GET /api/overview` | Signal overview summary |
| `GET /api/accuracy` | Accuracy metrics |
| `GET /api/accuracy/summary` | Aggregated accuracy summary |
| `GET /api/accuracy/trend?hours=N` | Accuracy trend over time |
| `GET /api/bias` | Signal bias analysis |
| `GET /api/performance` | Performance metrics |
| `GET /api/confidence` | Confidence distribution data |
| `GET /api/signal_quality?hours=N` | Signal quality scores |
| `GET /api/signals/latest` | Latest signals |
| `GET /api/decisions?limit=&offset=&symbol=&type=&action=&direction=&from=&to=` | Filtered decision history |
| `GET /api/decisions/:id` | Single decision detail |
| `GET /api/combiner_weights` | Combiner weight breakdown |
| `GET /api/collector-health` | Data collector health |
| `GET /api/backtest` | Backtest results |
| `GET /api/backtest/parameter-matrix` | Parameter sensitivity matrix |
| `GET /api/backtest/walk-forward` | Walk-forward analysis |
| `GET /api/trading/summary` | Trading summary (balances, positions) |

### Prediction Engine (`amani-predict` -- port 18801)

Proxied at `/predict-api` (prefix stripped before forwarding).

### Data Engineering (`data-eng` -- port 8081)

Proxied at `/data-api` (prefix stripped before forwarding). Used for dynamic price range validation on app mount.

## Quick Start

### Prerequisites

- Node.js >= 20
- Backend services running (signal on :18810, predict on :18801, data-eng on :8081)

### Development

```bash
npm install
npm run dev
# -> http://localhost:3080
```

### Production (Docker)

```bash
docker compose build
docker compose up -d
# -> http://localhost:3080
```

The Docker image uses a multi-stage build: Node 20 Alpine for building, Nginx Alpine for serving. Nginx handles SPA fallback routing and proxies API requests to `host.docker.internal`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 3080 |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:coverage` | Run unit tests with V8 coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run Playwright E2E tests with UI mode |

### Running tests directly

```bash
# Unit tests
npx vitest run

# E2E tests (requires dev server or built app running)
npx playwright test
```

## Architecture Notes

- **SWR** handles all data fetching with automatic retry (3 retries, 5s interval) and error logging.
- **Code splitting** via `React.lazy()` for all route pages and Rollup `manualChunks` for vendor bundles (`react`, `react-router-dom`, `recharts`, `swr`).
- **Error boundaries** wrap the entire app and individual sections for graceful degradation.
- **`SymbolsProvider`** provides a shared context for available trading symbols across all pages.
- **Nginx** in production serves static assets with 1-year immutable cache headers and gzip compression.

## Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for detailed conventions on commit format, percentage field handling, theming, and architecture decisions.
