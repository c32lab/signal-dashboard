/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import UpcomingAlerts from '../../../components/events/UpcomingAlerts'

describe('UpcomingAlerts', () => {
  it('renders the section title', () => {
    render(<UpcomingAlerts />)
    expect(screen.getByText('Upcoming Alerts')).toBeInTheDocument()
  })

  it('renders at most 5 events', () => {
    const { container } = render(<UpcomingAlerts />)
    // Each alert has a border-l-2 class
    const alerts = container.querySelectorAll('.border-l-2')
    expect(alerts.length).toBeLessThanOrEqual(5)
    expect(alerts.length).toBeGreaterThan(0)
  })

  it('sorts by days_until (soonest first)', () => {
    render(<UpcomingAlerts />)
    const titles = screen.getAllByText(
      /SOL Token Unlock|FOMC Interest Rate Decision|BTC ETF Options Expiry|CPI Release|ETH Network Upgrade|NFP Report/,
    )
    // SOL is 1d out (soonest), should be first
    expect(titles[0].textContent).toBe('SOL Token Unlock')
  })

  it('shows high impact events with red border', () => {
    const { container } = render(<UpcomingAlerts />)
    const redBorders = container.querySelectorAll('.border-l-red-500')
    expect(redBorders.length).toBeGreaterThan(0)
  })

  it('shows impact badges', () => {
    render(<UpcomingAlerts />)
    expect(screen.getAllByText('high').length).toBeGreaterThan(0)
    expect(screen.getAllByText('medium').length).toBeGreaterThan(0)
  })

  it('shows direction with probability for sufficient samples', () => {
    render(<UpcomingAlerts />)
    // SOL: 71% bearish
    expect(screen.getByText(/71%/)).toBeInTheDocument()
    // FOMC: 62% bullish
    expect(screen.getByText(/62%/)).toBeInTheDocument()
  })

  it('shows "No signal" for events with sample_count < 5', () => {
    render(<UpcomingAlerts />)
    // BTC ETF Options Expiry has sample_count=3
    expect(screen.getByText('No signal')).toBeInTheDocument()
  })

  it('shows days until label', () => {
    render(<UpcomingAlerts />)
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
  })
})
