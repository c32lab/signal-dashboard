# Signal Dashboard

Real-time monitoring dashboard for the Amani trading signal system. Displays signal health, decision history, accuracy tracking, backtest results, trading activity, and system diagnostics.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Data Fetching | SWR 2 (30s auto-refresh) |
| Routing | React Router v7 (lazy-loaded) |
| Unit Tests | Vitest 4 + Testing Library |
| E2E Tests | Playwright (Chromium) |

## Architecture

```
src/
├── api/index.ts              # API client — all fetch calls
├── hooks/
│   ├── useApi.ts             # SWR hooks for every endpoint
│   ├── useParamMatrix.ts     # Parameter matrix + walk-forward hooks
│   ├── useSymbols.tsx        # SymbolsProvider context
│   └── useTimelineData.ts    # Timeline with time-window filtering
├── pages/                    # Route-level components (lazy-loaded)
├── components/
│   ├── ErrorBoundary.tsx     # App-level error boundary
│   ├── SectionErrorBoundary.tsx  # Per-section error isolation
│   ├── layout/               # NavBar, DesktopDropdown, MobileMenu
│   ├── backtest/             # Backtest visualizations (18 components)
│   ├── dashboard/            # Main dashboard sections (15 components)
│   ├── decision/             # Decision table components
│   ├── history/              # Trade history components
│   ├── quality/              # Signal quality components
│   ├── timeline/             # Signal timeline components
│   └── trading/              # Trading dashboard components
├── types/
│   ├── index.ts              # Core signal API types
│   ├── backtest.ts           # Backtest result types
│   ├── trading.ts            # Trading types
│   ├── paramMatrix.ts        # Parameter matrix types
│   └── codeQuality.ts        # Code quality types
├── utils/
│   ├── format.ts             # UTC+8 time formatting, price formatting
│   ├── dataValidation.ts     # Price range validation (dynamic + static fallback)
│   ├── errorTracker.ts       # Global window error tracker
│   ├── performanceMonitor.ts # API response time monitor
│   ├── fieldConventions.ts   # Field format documentation
│   ├── backtestNormalizer.ts # Backtest response normalization
│   └── backtestFormatB.ts    # Alternate backtest format handling
├── __tests__/                # Unit tests (mirrors src/)
├── App.tsx                   # Root: SWRConfig + Routes + ErrorBoundary
└── main.tsx                  # Entry point
e2e/                          # Playwright E2E tests
```

## Pages & Routes

| Path | Page | Description |
|---|---|---|
| `/` | Dashboard | Main overview — health, KPIs, live signal feed, combiner weights, accuracy summary |
| `/quality` | QualityTracker | Signal quality metrics, accuracy leaderboard, confidence distribution, accuracy trends |
| `/history` | TraderHistory | Decision history with filters, pagination, symbol summary, KPI cards |
| `/backtest` | BacktestDashboard | Backtest results, PnL curves, parameter matrix heatmap, walk-forward analysis |
| `/trading` | TradingDashboard | Live trading status — balances, positions, PnL curve, trade table |
| `/timeline` | SignalTimeline | Chronological signal feed with time-window filtering |
| `/advanced/system` | SystemHealthPage | System diagnostics — collector health, frontend health, bias monitoring |
| `/code-quality` | CodeQuality | Internal code quality report (not in nav) |

## API Endpoints

The dashboard proxies requests to three backend services:

### Signal API (`/api` → `localhost:18810`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | System health status, uptime, active symbols |
| `/api/overview` | GET | Decision counts, action/symbol/type distributions |
| `/api/decisions` | GET | Decision list with filtering (symbol, type, action, direction, date range) |
| `/api/decisions/:id` | GET | Single decision detail |
| `/api/signals/latest` | GET | Latest signals array |
| `/api/performance` | GET | Performance by symbol + overall accuracy |
| `/api/confidence` | GET | Confidence bucket distribution |
| `/api/signal_quality` | GET | Signal quality metrics (configurable hours window) |
| `/api/accuracy/trend` | GET | Hourly accuracy trend (24h or 336h weekly) |
| `/api/accuracy` | GET | Accuracy by time window (6h/12h/24h) with symbol breakdown |
| `/api/accuracy/summary` | GET | Accuracy summary across windows |
| `/api/backtest` | GET | Backtest results (normalized) |
| `/api/combiner_weights` | GET | Signal combiner weight map |
| `/api/bias` | GET | Collector bias analysis |
| `/api/collector-health` | GET | Individual collector health status |
| `/api/trading/summary` | GET | Trading balances, positions, recent trades |
| `/api/backtest/parameter-matrix` | GET | Parameter sweep heatmap data |
| `/api/backtest/walk-forward` | GET | Walk-forward optimization results |

### Data-Eng API (`/data-api` → `localhost:8081`, prefix stripped)

| Endpoint | Method | Description |
|---|---|---|
| `/data-api/api/price-ranges` | GET | Dynamic price bounds per symbol |
| `/data-api/api/price-ranges/validate` | GET | Price validation (symbol + price params) |

### Predict API (`/predict-api` → `localhost:18801`, prefix stripped)

Proxied but not actively used in this project (predict was split to its own repo).

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 3080)
npm run dev

# Build for production
npm run build
```

### Vite Proxy Config

| Path Prefix | Target | Rewrite |
|---|---|---|
| `/api` | `http://localhost:18810` | None |
| `/predict-api` | `http://localhost:18801` | Strip prefix |
| `/data-api` | `http://localhost:8081` | Strip prefix |

## Testing

```bash
# Unit tests
npx vitest run

# Unit tests with coverage
npx vitest run --coverage

# E2E tests (requires dev server running)
npx playwright test

# E2E tests with UI
npx playwright test --ui
```

E2E specs: `dashboard`, `navigation`, `quality`, `backtest`, `trading`, `timeline`, `system-health`, `responsive`.

## Docker

```bash
# Build and run
docker compose build && docker compose up -d
```

- Two-stage build: `node:20-alpine` → `nginx:alpine`
- Serves on port **3080**
- Nginx proxies `/api/` → `host.docker.internal:18810`, `/predict-api/` → `:18801`, `/data-api/` → `:8081`
- SPA fallback via `try_files $uri /index.html`
- Static assets cached 1 year with `immutable`
- Health check: `wget -qO- http://127.0.0.1:3080/`

## Key Components

### ErrorBoundary
App-level error boundary wrapping the entire application. Shows a full-page error overlay with retry button and collapsible stack trace.

### SectionErrorBoundary
Per-section error isolation used extensively across all pages. Each dashboard section is independently wrapped — a single section failure doesn't bring down the page. Shows inline error card with retry.

### useApi Hooks
SWR-based data hooks with 30-second auto-refresh (10s for trading). Global SWR config: 3 retries at 5s intervals. See [docs/api-integration.md](docs/api-integration.md) for the complete hook-to-endpoint mapping.

### Field Format Conventions
- `*_pct` fields: already 0–100, display directly with `%`
- `confidence`, `strength`: decimal 0–1, multiply by 100 for display
- All timestamps displayed in **UTC+8** (Asia/Shanghai)

## Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for detailed conventions on commit format, percentage field handling, theming, and architecture decisions.
