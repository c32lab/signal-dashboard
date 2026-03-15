/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ForwardEvent } from '../../../components/events/types'

const mockUseForwardEvents = vi.fn()
vi.mock('../../../hooks/useForwardEvents', () => ({
  useForwardEvents: (...args: unknown[]) => mockUseForwardEvents(...args),
}))

import UpcomingAlerts from '../../../components/events/UpcomingAlerts'

const testEvents: ForwardEvent[] = [
  {
    event_id: 'fomc-2026-03',
    event_type: 'fomc_decision',
    category: 'macro',
    title: 'FOMC Interest Rate Decision',
    event_date: '2026-03-17',
    days_until: 2,
    impact: 'high',
    direction: 'bullish',
    direction_probability: 0.62,
    avg_move_pct: 3.2,
    volatility_expected: 4.5,
    confidence: 0.71,
    sample_count: 24,
    reasoning: 'Historical FOMC decisions.',
  },
  {
    event_id: 'sol-unlock-2026-03',
    event_type: 'token_unlock',
    category: 'crypto',
    title: 'SOL Token Unlock',
    event_date: '2026-03-16',
    days_until: 1,
    impact: 'medium',
    direction: 'bearish',
    direction_probability: 0.71,
    avg_move_pct: 5.4,
    volatility_expected: 6.2,
    confidence: 0.55,
    sample_count: 8,
    reasoning: 'Large token unlocks.',
  },
  {
    event_id: 'cpi-2026-03',
    event_type: 'cpi_release',
    category: 'macro',
    title: 'CPI Release',
    event_date: '2026-03-19',
    days_until: 4,
    impact: 'high',
    direction: 'bearish',
    direction_probability: 0.58,
    avg_move_pct: 2.1,
    volatility_expected: 3.8,
    confidence: 0.64,
    sample_count: 18,
    reasoning: 'CPI prints above expectation.',
  },
  {
    event_id: 'eth-upgrade-2026-03',
    event_type: 'hard_fork',
    category: 'crypto',
    title: 'ETH Network Upgrade',
    event_date: '2026-03-20',
    days_until: 5,
    impact: 'medium',
    direction: 'bullish',
    direction_probability: 0.65,
    avg_move_pct: 4.1,
    volatility_expected: 5.0,
    confidence: 0.60,
    sample_count: 12,
    reasoning: 'Network upgrades bullish.',
  },
  {
    event_id: 'nfp-2026-03',
    event_type: 'nfp_report',
    category: 'macro',
    title: 'NFP Report',
    event_date: '2026-03-21',
    days_until: 6,
    impact: 'high',
    direction: 'neutral',
    direction_probability: 0.45,
    avg_move_pct: 1.8,
    volatility_expected: 3.2,
    confidence: 0.50,
    sample_count: 22,
    reasoning: 'Mixed signal.',
  },
  {
    event_id: 'btc-etf-expiry-2026-03',
    event_type: 'options_expiry',
    category: 'crypto',
    title: 'BTC ETF Options Expiry',
    event_date: '2026-03-18',
    days_until: 3,
    impact: 'low',
    direction: 'neutral',
    direction_probability: 0.50,
    avg_move_pct: 0.9,
    volatility_expected: 1.5,
    confidence: 0.30,
    sample_count: 3,
    reasoning: 'Insufficient data.',
  },
]

describe('UpcomingAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('with live data', () => {
    beforeEach(() => {
      mockUseForwardEvents.mockReturnValue({
        events: testEvents,
        error: undefined,
        isLoading: false,
      })
    })

    it('renders the section title', () => {
      render(<UpcomingAlerts />)
      expect(screen.getByText('Upcoming Alerts')).toBeInTheDocument()
    })

    it('renders at most 5 events', () => {
      const { container } = render(<UpcomingAlerts />)
      const alerts = container.querySelectorAll('.border-l-2')
      expect(alerts.length).toBeLessThanOrEqual(5)
      expect(alerts.length).toBeGreaterThan(0)
    })

    it('sorts by days_until (soonest first)', () => {
      render(<UpcomingAlerts />)
      const titles = screen.getAllByText(
        /SOL Token Unlock|FOMC Interest Rate Decision|BTC ETF Options Expiry|CPI Release|ETH Network Upgrade|NFP Report/,
      )
      expect(titles[0].textContent).toBe('SOL Token Unlock')
    })

    it('shows high impact events with red border', () => {
      const { container } = render(<UpcomingAlerts />)
      expect(container.querySelectorAll('.border-l-red-500').length).toBeGreaterThan(0)
    })

    it('shows direction with probability for sufficient samples', () => {
      render(<UpcomingAlerts />)
      expect(screen.getByText(/71%/)).toBeInTheDocument()
      expect(screen.getByText(/62%/)).toBeInTheDocument()
    })

    it('shows "No signal" for events with sample_count < 5', () => {
      render(<UpcomingAlerts />)
      expect(screen.getByText('No signal')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows skeleton placeholders', () => {
      mockUseForwardEvents.mockReturnValue({ events: [], error: undefined, isLoading: true })
      const { container } = render(<UpcomingAlerts />)
      expect(container.querySelectorAll('.animate-pulse').length).toBe(3)
    })
  })

  describe('error state', () => {
    it('shows error message when API errors', () => {
      mockUseForwardEvents.mockReturnValue({
        events: [],
        error: new Error('API error'),
        isLoading: false,
      })
      render(<UpcomingAlerts />)
      expect(screen.getByText('Failed to load alerts')).toBeInTheDocument()
    })
  })
})
