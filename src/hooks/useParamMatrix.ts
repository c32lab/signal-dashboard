import useSWR from 'swr'
import type { ParamMatrixResult, WalkForwardResult } from '../types/paramMatrix'

// TODO: Remove mock data once backend APIs are ready (issue #87)

const MOCK_PARAM_MATRIX: ParamMatrixResult = {
  sweep_id: 'mock-sweep-001',
  generated_at: '2026-03-07T12:00:00Z',
  dimensions: ['min_confidence', 'technical_weight', 'derivatives_weight'],
  results: [
    { params: { min_confidence: 0.3, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.42, win_rate_pct: 52.1, total_pnl_pct: 8.3, max_drawdown_pct: 12.4, total_trades: 187 } },
    { params: { min_confidence: 0.3, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.65, win_rate_pct: 54.8, total_pnl_pct: 11.2, max_drawdown_pct: 10.1, total_trades: 172 } },
    { params: { min_confidence: 0.3, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.38, win_rate_pct: 51.3, total_pnl_pct: 7.9, max_drawdown_pct: 13.7, total_trades: 165 } },
    { params: { min_confidence: 0.3, technical_weight: 0.20, derivatives_weight: 0.40 }, metrics: { sharpe: 1.51, win_rate_pct: 53.4, total_pnl_pct: 9.8, max_drawdown_pct: 11.2, total_trades: 194 } },
    { params: { min_confidence: 0.5, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.73, win_rate_pct: 56.2, total_pnl_pct: 13.1, max_drawdown_pct: 9.3, total_trades: 143 } },
    { params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.91, win_rate_pct: 58.5, total_pnl_pct: 15.6, max_drawdown_pct: 7.8, total_trades: 131 } },
    { params: { min_confidence: 0.5, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.82, win_rate_pct: 57.1, total_pnl_pct: 14.2, max_drawdown_pct: 8.5, total_trades: 126 } },
    { params: { min_confidence: 0.5, technical_weight: 0.20, derivatives_weight: 0.40 }, metrics: { sharpe: 1.68, win_rate_pct: 55.7, total_pnl_pct: 12.4, max_drawdown_pct: 9.9, total_trades: 149 } },
    { params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.40 }, metrics: { sharpe: 1.85, win_rate_pct: 57.8, total_pnl_pct: 14.8, max_drawdown_pct: 8.1, total_trades: 138 } },
    { params: { min_confidence: 0.7, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.55, win_rate_pct: 59.3, total_pnl_pct: 10.5, max_drawdown_pct: 8.7, total_trades: 89 } },
    { params: { min_confidence: 0.7, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.78, win_rate_pct: 61.2, total_pnl_pct: 12.9, max_drawdown_pct: 7.2, total_trades: 82 } },
    { params: { min_confidence: 0.7, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.61, win_rate_pct: 58.9, total_pnl_pct: 11.1, max_drawdown_pct: 9.0, total_trades: 76 } },
    { params: { min_confidence: 0.7, technical_weight: 0.20, derivatives_weight: 0.40 }, metrics: { sharpe: 1.49, win_rate_pct: 57.6, total_pnl_pct: 9.2, max_drawdown_pct: 10.5, total_trades: 94 } },
    { params: { min_confidence: 0.7, technical_weight: 0.30, derivatives_weight: 0.40 }, metrics: { sharpe: 1.72, win_rate_pct: 60.4, total_pnl_pct: 12.1, max_drawdown_pct: 7.9, total_trades: 85 } },
    { params: { min_confidence: 0.7, technical_weight: 0.40, derivatives_weight: 0.40 }, metrics: { sharpe: 1.58, win_rate_pct: 59.1, total_pnl_pct: 10.8, max_drawdown_pct: 8.8, total_trades: 79 } },
    { params: { min_confidence: 0.5, technical_weight: 0.40, derivatives_weight: 0.40 }, metrics: { sharpe: 1.76, win_rate_pct: 56.9, total_pnl_pct: 13.5, max_drawdown_pct: 8.9, total_trades: 133 } },
  ],
}

const MOCK_WALK_FORWARD: WalkForwardResult = {
  windows: [
    {
      train_start: '2025-09-01', train_end: '2025-11-30',
      test_start: '2025-12-01', test_end: '2025-12-31',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.95, win_rate_pct: 59.2, total_pnl_pct: 16.1 },
      out_of_sample: { sharpe: 1.52, win_rate_pct: 54.8, total_pnl_pct: 11.3 },
    },
    {
      train_start: '2025-10-01', train_end: '2025-12-31',
      test_start: '2026-01-01', test_end: '2026-01-31',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.35 },
      in_sample: { sharpe: 2.01, win_rate_pct: 60.1, total_pnl_pct: 17.4 },
      out_of_sample: { sharpe: 1.38, win_rate_pct: 52.3, total_pnl_pct: 8.9 },
    },
    {
      train_start: '2025-11-01', train_end: '2026-01-31',
      test_start: '2026-02-01', test_end: '2026-02-28',
      best_params: { min_confidence: 0.5, technical_weight: 0.35, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.87, win_rate_pct: 57.8, total_pnl_pct: 14.6 },
      out_of_sample: { sharpe: 1.61, win_rate_pct: 55.9, total_pnl_pct: 12.7 },
    },
    {
      train_start: '2025-12-01', train_end: '2026-02-28',
      test_start: '2026-03-01', test_end: '2026-03-07',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.92, win_rate_pct: 58.5, total_pnl_pct: 15.8 },
      out_of_sample: { sharpe: 1.45, win_rate_pct: 53.7, total_pnl_pct: 9.5 },
    },
    {
      train_start: '2026-01-01', train_end: '2026-03-07',
      test_start: '2026-03-08', test_end: '2026-03-08',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.89, win_rate_pct: 57.9, total_pnl_pct: 15.2 },
      out_of_sample: { sharpe: 1.33, win_rate_pct: 51.2, total_pnl_pct: 7.8 },
    },
  ],
  overall: { sharpe: 1.46, win_rate_pct: 53.6, total_pnl_pct: 50.2 },
}

async function fetchWithMockFallback<T>(url: string, mockData: T): Promise<T> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      // TODO: Replace mock fallback with error throw once APIs are live (issue #87)
      if (res.status === 404) return mockData
      throw new Error(`API error: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<T>
  } catch (err) {
    if (err instanceof TypeError) {
      // Network error (e.g. API not deployed yet) — use mock
      // TODO: Remove this fallback once APIs are live (issue #87)
      return mockData
    }
    throw err
  }
}

export function useParamMatrix() {
  return useSWR<ParamMatrixResult>(
    'backtest/parameter-matrix',
    () => fetchWithMockFallback('/api/backtest/parameter-matrix', MOCK_PARAM_MATRIX),
    { refreshInterval: 60_000 },
  )
}

export function useWalkForward() {
  return useSWR<WalkForwardResult>(
    'backtest/walk-forward',
    () => fetchWithMockFallback('/api/backtest/walk-forward', MOCK_WALK_FORWARD),
    { refreshInterval: 60_000 },
  )
}
