# Signal Dashboard

Real-time monitoring dashboard for a cryptocurrency signal system — visualizing decisions, predictions, and quality metrics.

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Recharts 3** — charts & visualizations
- **SWR 2** — data fetching & caching
- **React Router v7** — client-side routing

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Signal Dashboard | Signal overview with confidence, strength, and market indicators |
| `/predict` | Predict Dashboard | Prediction history and accuracy tracking |
| `/backtest` | Backtest A/B Test | Side-by-side backtesting comparison |
| `/trading` | Trading Dashboard | Trading records, balances, and positions |
| `/history` | Trader History | Event log and decision archive |
| `/quality` | Quality Tracker | Signal quality metrics and trends |
| `/advanced/chain` | Industry Chain | Sector correlation graph |
| `/advanced/system` | System Health | Service status and system diagnostics |

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3080
```

## Production Deployment

```bash
docker compose up -d --build
```

The app is served on port **3080** in both development and production.

## API Proxy

The dev server proxies three backend services:

| Prefix | Target | Service |
|--------|--------|---------|
| `/api` | `localhost:18800` | amani-signal (signal engine) |
| `/predict-api` | `localhost:18801` | amani-predict (prediction engine) |
| `/data-api` | `localhost:8081` | data-eng (data engineering) |

`/predict-api` and `/data-api` strip their prefix before forwarding.

## Scripts

```bash
npm run dev      # Start dev server on :3080
npm run build    # Type-check + production build
npm run lint     # ESLint
```

## Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for detailed conventions on commit format, percentage field handling, theming, and architecture decisions.
