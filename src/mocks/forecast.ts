import type { ForecastPanelData } from '../types'

export const mockForecastData: ForecastPanelData = {
  signals: [
    {
      symbol: 'BTC/USDT',
      direction: 'LONG',
      confidence: 0.78,
      prediction_count: 2,
      predictions: [
        {
          id: 1,
          symbol: 'BTC/USDT',
          direction: 'LONG',
          confidence: 0.78,
          trigger_pattern: 'institutional_inflow',
          trigger_event: 'Large BTC inflows detected across major exchanges',
          expected_impact: 2.3,
          expected_horizon: '1d',
          timestamp: '2026-03-10T08:30:00Z',
        },
        {
          id: 2,
          symbol: 'BTC/USDT',
          direction: 'LONG',
          confidence: 0.65,
          trigger_pattern: 'macro_positive',
          trigger_event: 'Fed signals potential rate pause in upcoming meeting',
          expected_impact: 1.8,
          expected_horizon: '3d',
          timestamp: '2026-03-10T07:15:00Z',
        },
      ],
    },
    {
      symbol: 'SOL/USDT',
      direction: 'SHORT',
      confidence: 0.62,
      prediction_count: 1,
      predictions: [
        {
          id: 3,
          symbol: 'SOL/USDT',
          direction: 'SHORT',
          confidence: 0.62,
          trigger_pattern: 'whale_movement',
          trigger_event: 'Large SOL transfer to exchange wallets detected',
          expected_impact: -1.5,
          expected_horizon: '1d',
          timestamp: '2026-03-10T06:45:00Z',
        },
      ],
    },
    {
      symbol: 'ETH/USDT',
      direction: 'NEUTRAL',
      confidence: 0.45,
      prediction_count: 1,
      predictions: [
        {
          id: 4,
          symbol: 'ETH/USDT',
          direction: 'NEUTRAL',
          confidence: 0.45,
          trigger_pattern: 'mixed_signals',
          trigger_event: 'Conflicting on-chain metrics for ETH',
          expected_impact: 0.2,
          expected_horizon: '1d',
          timestamp: '2026-03-10T05:00:00Z',
        },
      ],
    },
  ],
  accuracy: {
    '1d': 68.8,
    '3d': 37.9,
    '7d': 52.1,
  },
  bridge_status: 'connected',
  last_sync: '2026-03-10T09:00:00Z',
}
