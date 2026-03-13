/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventCalendar from '../../../components/events/EventCalendar'

describe('EventCalendar', () => {
  it('renders the section title', () => {
    render(<EventCalendar />)
    expect(screen.getByText('Event Calendar')).toBeInTheDocument()
    expect(screen.getByText('Next 7 days')).toBeInTheDocument()
  })

  it('renders all mock events', () => {
    render(<EventCalendar />)
    expect(screen.getByText('FOMC Interest Rate Decision')).toBeInTheDocument()
    expect(screen.getByText('CPI Release')).toBeInTheDocument()
    expect(screen.getByText('SOL Token Unlock')).toBeInTheDocument()
    expect(screen.getByText('ETH Network Upgrade')).toBeInTheDocument()
    expect(screen.getByText('NFP Report')).toBeInTheDocument()
    expect(screen.getByText('BTC ETF Options Expiry')).toBeInTheDocument()
  })

  it('shows impact badges', () => {
    render(<EventCalendar />)
    const highBadges = screen.getAllByText('High')
    expect(highBadges.length).toBeGreaterThanOrEqual(3)
    const mediumBadges = screen.getAllByText('Medium')
    expect(mediumBadges.length).toBeGreaterThanOrEqual(2)
    const lowBadges = screen.getAllByText('Low')
    expect(lowBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('shows direction probability for events with sufficient samples', () => {
    render(<EventCalendar />)
    // FOMC: 62% bullish, sample_count=24
    expect(screen.getByText(/62%/)).toBeInTheDocument()
    // SOL unlock: 71% bearish, sample_count=8
    expect(screen.getByText(/71%/)).toBeInTheDocument()
  })

  it('shows "Insufficient data" for events with sample_count < 5', () => {
    render(<EventCalendar />)
    // BTC ETF Options Expiry has sample_count=3
    expect(screen.getByText('Insufficient data')).toBeInTheDocument()
  })

  it('shows low sample warning for 5 <= sample_count < 20', () => {
    render(<EventCalendar />)
    // SOL Token Unlock has sample_count=8
    expect(screen.getByText(/Low sample \(n=8\)/)).toBeInTheDocument()
    // ETH Network Upgrade has sample_count=12
    expect(screen.getByText(/Low sample \(n=12\)/)).toBeInTheDocument()
    // CPI Release has sample_count=18
    expect(screen.getByText(/Low sample \(n=18\)/)).toBeInTheDocument()
  })

  it('shows normal sample count for n >= 20', () => {
    render(<EventCalendar />)
    // FOMC has sample_count=24
    expect(screen.getByText('n=24')).toBeInTheDocument()
    // NFP has sample_count=22
    expect(screen.getByText('n=22')).toBeInTheDocument()
  })

  it('collapse/expand toggle works', () => {
    render(<EventCalendar />)
    const collapseBtn = screen.getByText('▲ collapse')
    fireEvent.click(collapseBtn)
    expect(screen.getByText('▼ expand')).toBeInTheDocument()
    // Events should be hidden
    expect(screen.queryByText('FOMC Interest Rate Decision')).not.toBeInTheDocument()
    // Expand again
    fireEvent.click(screen.getByText('▼ expand'))
    expect(screen.getByText('FOMC Interest Rate Decision')).toBeInTheDocument()
  })

  it('expands event details on click', () => {
    render(<EventCalendar />)
    const fomcCard = screen.getByText('FOMC Interest Rate Decision')
    fireEvent.click(fomcCard)
    // Should now show reasoning and stats
    expect(
      screen.getByText(/Historical FOMC decisions/),
    ).toBeInTheDocument()
    expect(screen.getByText('Avg Move')).toBeInTheDocument()
    expect(screen.getByText('3.2%')).toBeInTheDocument()
  })

  it('shows day group labels', () => {
    render(<EventCalendar />)
    // "Tomorrow" appears as both a day group label and in the event card
    const tomorrowElements = screen.getAllByText('Tomorrow')
    expect(tomorrowElements.length).toBeGreaterThanOrEqual(1)
  })
})
