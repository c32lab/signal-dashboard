/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ForwardEvent } from '../../../components/events/types'

const mockUseForwardEvents = vi.fn()
vi.mock('../../../hooks/useForwardEvents', () => ({
  useForwardEvents: (...args: unknown[]) => mockUseForwardEvents(...args),
}))

import EventCalendar from '../../../components/events/EventCalendar'

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
    reasoning: 'Historical FOMC decisions in similar rate environments have led to bullish crypto reactions 62% of the time, with an average 3.2% upward move within 24h.',
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
    reasoning: 'CPI prints above expectation have historically triggered risk-off moves.',
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
    reasoning: 'Large token unlocks for SOL have historically preceded sell pressure.',
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
    reasoning: 'Network upgrades have generally been bullish catalysts for ETH.',
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
    reasoning: 'Non-Farm Payroll reports show mixed directional signal for crypto.',
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
    reasoning: 'Insufficient historical data for BTC ETF options expiry events.',
  },
]

describe('EventCalendar', () => {
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
      render(<EventCalendar />)
      expect(screen.getByText('Event Calendar')).toBeInTheDocument()
      expect(screen.getByText('Next 7 days')).toBeInTheDocument()
    })

    it('renders all events', () => {
      render(<EventCalendar />)
      expect(screen.getByText('FOMC Interest Rate Decision')).toBeInTheDocument()
      expect(screen.getByText('CPI Release')).toBeInTheDocument()
      expect(screen.getByText('SOL Token Unlock')).toBeInTheDocument()
    })

    it('shows impact badges', () => {
      render(<EventCalendar />)
      expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(3)
      expect(screen.getAllByText('Medium').length).toBeGreaterThanOrEqual(2)
    })

    it('shows direction probability for events with sufficient samples', () => {
      render(<EventCalendar />)
      expect(screen.getByText(/62%/)).toBeInTheDocument()
      expect(screen.getByText(/71%/)).toBeInTheDocument()
    })

    it('shows "Insufficient data" for events with sample_count < 5', () => {
      render(<EventCalendar />)
      expect(screen.getByText('Insufficient data')).toBeInTheDocument()
    })

    it('collapse/expand toggle works', () => {
      render(<EventCalendar />)
      fireEvent.click(screen.getByText('▲ collapse'))
      expect(screen.queryByText('FOMC Interest Rate Decision')).not.toBeInTheDocument()
      fireEvent.click(screen.getByText('▼ expand'))
      expect(screen.getByText('FOMC Interest Rate Decision')).toBeInTheDocument()
    })

    it('expands event details on click', () => {
      render(<EventCalendar />)
      fireEvent.click(screen.getByText('FOMC Interest Rate Decision'))
      expect(screen.getByText(/Historical FOMC decisions/)).toBeInTheDocument()
      expect(screen.getByText('3.2%')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows skeleton placeholders', () => {
      mockUseForwardEvents.mockReturnValue({ events: [], error: undefined, isLoading: true })
      const { container } = render(<EventCalendar />)
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
      render(<EventCalendar />)
      expect(screen.getByText('Failed to load events')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when API returns no events', () => {
      mockUseForwardEvents.mockReturnValue({ events: [], error: undefined, isLoading: false })
      render(<EventCalendar />)
      expect(screen.getByText('No upcoming events in the next 7 days')).toBeInTheDocument()
    })
  })
})
