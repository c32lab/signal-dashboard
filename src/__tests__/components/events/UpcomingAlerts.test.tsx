/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUseForwardEvents = vi.fn()
vi.mock('../../../hooks/useForwardEvents', () => ({
  useForwardEvents: (...args: unknown[]) => mockUseForwardEvents(...args),
}))

import UpcomingAlerts from '../../../components/events/UpcomingAlerts'
import { mockForwardEvents } from '../../../components/events/mockData'

describe('UpcomingAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('with live data', () => {
    beforeEach(() => {
      mockUseForwardEvents.mockReturnValue({
        events: mockForwardEvents,
        error: undefined,
        isLoading: false,
      })
    })

    it('renders the section title', () => {
      render(<UpcomingAlerts />)
      expect(screen.getByText('Upcoming Alerts')).toBeInTheDocument()
    })

    it('does not show demo data badge', () => {
      render(<UpcomingAlerts />)
      expect(screen.queryByText('demo data')).not.toBeInTheDocument()
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

  describe('error fallback', () => {
    it('shows demo data badge when API errors', () => {
      mockUseForwardEvents.mockReturnValue({
        events: [],
        error: new Error('API error'),
        isLoading: false,
      })
      render(<UpcomingAlerts />)
      expect(screen.getByText('demo data')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Alerts')).toBeInTheDocument()
    })
  })
})
