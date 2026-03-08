import useSWR from 'swr'
import type { ParamMatrixResult, WalkForwardResult } from '../types/paramMatrix'

// TODO: Remove mock data once backend APIs are ready (issue #87)

const MOCK_PARAM_MATRIX: ParamMatrixResult = {
  sweep_id: 'mock-sweep-001',
  generated_at: '2026-03-07T12:00:00Z',
  dimensions: ['min_confidence', 'technical_weight', 'derivatives_weight'],
  // 6 confidence values × 5 weight combinations = 30 cells
  results: [
    // min_confidence = 0.2
    { params: { min_confidence: 0.2, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.12, win_rate_pct: 48.5, total_pnl_pct: 3.2, max_drawdown_pct: 16.8, total_trades: 241 } },
    { params: { min_confidence: 0.2, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.28, win_rate_pct: 50.1, total_pnl_pct: 5.4, max_drawdown_pct: 15.2, total_trades: 228 } },
    { params: { min_confidence: 0.2, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.15, win_rate_pct: 49.0, total_pnl_pct: 3.8, max_drawdown_pct: 16.1, total_trades: 219 } },
    { params: { min_confidence: 0.2, technical_weight: 0.30, derivatives_weight: 0.40 }, metrics: { sharpe: 1.22, win_rate_pct: 49.7, total_pnl_pct: 4.6, max_drawdown_pct: 15.7, total_trades: 234 } },
    { params: { min_confidence: 0.2, technical_weight: 0.40, derivatives_weight: 0.40 }, metrics: { sharpe: 1.18, win_rate_pct: 49.3, total_pnl_pct: 4.1, max_drawdown_pct: 15.9, total_trades: 225 } },
    // min_confidence = 0.3
    { params: { min_confidence: 0.3, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.42, win_rate_pct: 52.1, total_pnl_pct: 8.3, max_drawdown_pct: 12.4, total_trades: 187 } },
    { params: { min_confidence: 0.3, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.65, win_rate_pct: 54.8, total_pnl_pct: 11.2, max_drawdown_pct: 10.1, total_trades: 172 } },
    { params: { min_confidence: 0.3, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.38, win_rate_pct: 51.3, total_pnl_pct: 7.9, max_drawdown_pct: 13.7, total_trades: 165 } },
    { params: { min_confidence: 0.3, technical_weight: 0.30, derivatives_weight: 0.40 }, metrics: { sharpe: 1.51, win_rate_pct: 53.4, total_pnl_pct: 9.8, max_drawdown_pct: 11.2, total_trades: 180 } },
    { params: { min_confidence: 0.3, technical_weight: 0.40, derivatives_weight: 0.40 }, metrics: { sharpe: 1.44, win_rate_pct: 52.5, total_pnl_pct: 8.7, max_drawdown_pct: 12.0, total_trades: 168 } },
    // min_confidence = 0.4
    { params: { min_confidence: 0.4, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.58, win_rate_pct: 54.3, total_pnl_pct: 10.7, max_drawdown_pct: 10.8, total_trades: 158 } },
    { params: { min_confidence: 0.4, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.79, win_rate_pct: 56.9, total_pnl_pct: 13.4, max_drawdown_pct: 8.9, total_trades: 146 } },
    { params: { min_confidence: 0.4, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.62, win_rate_pct: 55.1, total_pnl_pct: 11.3, max_drawdown_pct: 10.2, total_trades: 139 } },
    { params: { min_confidence: 0.4, technical_weight: 0.30, derivatives_weight: 0.40 }, metrics: { sharpe: 1.71, win_rate_pct: 56.0, total_pnl_pct: 12.5, max_drawdown_pct: 9.5, total_trades: 152 } },
    { params: { min_confidence: 0.4, technical_weight: 0.40, derivatives_weight: 0.40 }, metrics: { sharpe: 1.66, win_rate_pct: 55.6, total_pnl_pct: 11.9, max_drawdown_pct: 9.8, total_trades: 142 } },
    // min_confidence = 0.5
    { params: { min_confidence: 0.5, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.73, win_rate_pct: 56.2, total_pnl_pct: 13.1, max_drawdown_pct: 9.3, total_trades: 143 } },
    { params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.91, win_rate_pct: 58.5, total_pnl_pct: 15.6, max_drawdown_pct: 7.8, total_trades: 131 } },
    { params: { min_confidence: 0.5, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.82, win_rate_pct: 57.1, total_pnl_pct: 14.2, max_drawdown_pct: 8.5, total_trades: 126 } },
    { params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.40 }, metrics: { sharpe: 1.85, win_rate_pct: 57.8, total_pnl_pct: 14.8, max_drawdown_pct: 8.1, total_trades: 138 } },
    { params: { min_confidence: 0.5, technical_weight: 0.40, derivatives_weight: 0.40 }, metrics: { sharpe: 1.76, win_rate_pct: 56.9, total_pnl_pct: 13.5, max_drawdown_pct: 8.9, total_trades: 133 } },
    // min_confidence = 0.6
    { params: { min_confidence: 0.6, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.64, win_rate_pct: 58.1, total_pnl_pct: 11.8, max_drawdown_pct: 8.4, total_trades: 107 } },
    { params: { min_confidence: 0.6, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.83, win_rate_pct: 60.3, total_pnl_pct: 14.1, max_drawdown_pct: 7.1, total_trades: 98 } },
    { params: { min_confidence: 0.6, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.69, win_rate_pct: 59.0, total_pnl_pct: 12.4, max_drawdown_pct: 8.0, total_trades: 91 } },
    { params: { min_confidence: 0.6, technical_weight: 0.30, derivatives_weight: 0.40 }, metrics: { sharpe: 1.75, win_rate_pct: 59.5, total_pnl_pct: 13.2, max_drawdown_pct: 7.6, total_trades: 102 } },
    { params: { min_confidence: 0.6, technical_weight: 0.40, derivatives_weight: 0.40 }, metrics: { sharpe: 1.67, win_rate_pct: 58.7, total_pnl_pct: 12.0, max_drawdown_pct: 8.2, total_trades: 95 } },
    // min_confidence = 0.7
    { params: { min_confidence: 0.7, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.55, win_rate_pct: 59.3, total_pnl_pct: 10.5, max_drawdown_pct: 8.7, total_trades: 89 } },
    { params: { min_confidence: 0.7, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.78, win_rate_pct: 61.2, total_pnl_pct: 12.9, max_drawdown_pct: 7.2, total_trades: 82 } },
    { params: { min_confidence: 0.7, technical_weight: 0.40, derivatives_weight: 0.30 }, metrics: { sharpe: 1.61, win_rate_pct: 58.9, total_pnl_pct: 11.1, max_drawdown_pct: 9.0, total_trades: 76 } },
    { params: { min_confidence: 0.7, technical_weight: 0.30, derivatives_weight: 0.40 }, metrics: { sharpe: 1.72, win_rate_pct: 60.4, total_pnl_pct: 12.1, max_drawdown_pct: 7.9, total_trades: 85 } },
    { params: { min_confidence: 0.7, technical_weight: 0.40, derivatives_weight: 0.40 }, metrics: { sharpe: 1.58, win_rate_pct: 59.1, total_pnl_pct: 10.8, max_drawdown_pct: 8.8, total_trades: 79 } },
  ],
}

const MOCK_WALK_FORWARD: WalkForwardResult = {
  windows: [
    {
      train_start: '2023-06-01', train_end: '2023-11-30',
      test_start: '2023-12-01', test_end: '2024-02-28',
      best_params: { min_confidence: 0.4, technical_weight: 0.30, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.78, win_rate_pct: 56.4, total_pnl_pct: 13.2 },
      out_of_sample: { sharpe: 1.35, win_rate_pct: 52.1, total_pnl_pct: 8.4 },
    },
    {
      train_start: '2023-09-01', train_end: '2024-02-28',
      test_start: '2024-03-01', test_end: '2024-05-31',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.88, win_rate_pct: 57.9, total_pnl_pct: 14.7 },
      out_of_sample: { sharpe: 1.42, win_rate_pct: 53.5, total_pnl_pct: 9.8 },
    },
    {
      train_start: '2024-01-01', train_end: '2024-05-31',
      test_start: '2024-06-01', test_end: '2024-08-31',
      best_params: { min_confidence: 0.5, technical_weight: 0.35, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.95, win_rate_pct: 59.2, total_pnl_pct: 16.1 },
      out_of_sample: { sharpe: 1.28, win_rate_pct: 51.8, total_pnl_pct: 7.6 },
    },
    {
      train_start: '2024-04-01', train_end: '2024-08-31',
      test_start: '2024-09-01', test_end: '2024-11-30',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.35 },
      in_sample: { sharpe: 2.05, win_rate_pct: 60.3, total_pnl_pct: 17.8 },
      out_of_sample: { sharpe: 1.51, win_rate_pct: 54.7, total_pnl_pct: 11.2 },
    },
    {
      train_start: '2024-07-01', train_end: '2024-11-30',
      test_start: '2024-12-01', test_end: '2025-02-28',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.92, win_rate_pct: 58.8, total_pnl_pct: 15.5 },
      out_of_sample: { sharpe: 1.47, win_rate_pct: 54.1, total_pnl_pct: 10.3 },
    },
    {
      train_start: '2024-10-01', train_end: '2025-02-28',
      test_start: '2025-03-01', test_end: '2025-05-31',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.85, win_rate_pct: 57.5, total_pnl_pct: 14.2 },
      out_of_sample: { sharpe: 1.39, win_rate_pct: 52.9, total_pnl_pct: 9.1 },
    },
    {
      train_start: '2025-01-01', train_end: '2025-05-31',
      test_start: '2025-06-01', test_end: '2025-08-31',
      best_params: { min_confidence: 0.5, technical_weight: 0.35, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.98, win_rate_pct: 59.6, total_pnl_pct: 16.4 },
      out_of_sample: { sharpe: 1.55, win_rate_pct: 55.3, total_pnl_pct: 11.8 },
    },
    {
      train_start: '2025-06-01', train_end: '2025-11-30',
      test_start: '2025-12-01', test_end: '2026-02-28',
      best_params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 },
      in_sample: { sharpe: 1.91, win_rate_pct: 58.3, total_pnl_pct: 15.7 },
      out_of_sample: { sharpe: 1.44, win_rate_pct: 53.8, total_pnl_pct: 9.7 },
    },
  ],
  overall: { sharpe: 1.43, win_rate_pct: 53.5, total_pnl_pct: 77.9 },
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
