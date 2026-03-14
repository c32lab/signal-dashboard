/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockUseForwardEvents = vi.fn()
vi.mock('../../../hooks/useForwardEvents', () => ({
  useForwardEvents: (...args: unknown[]) => mockUseForwardEvents(...args),
}))

import EventCalendar from '../../../components/events/EventCalendar'
import { mockForwardEvents } from '../../../components/events/mockData'

describe('EventCalendar', () => {
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
      render(<EventCalendar />)
      expect(screen.getByText('Event Calendar')).toBeInTheDocument()
      expect(screen.getByText('Next 7 days')).toBeInTheDocument()
    })

    it('does not show demo data badge', () => {
      render(<EventCalendar />)
      expect(screen.queryByText('demo data')).not.toBeInTheDocument()
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

  describe('error fallback', () => {
    it('shows demo data badge when API errors', () => {
      mockUseForwardEvents.mockReturnValue({
        events: [],
        error: new Error('API error'),
        isLoading: false,
      })
      render(<EventCalendar />)
      expect(screen.getByText('demo data')).toBeInTheDocument()
      // Should still render mock events as fallback
      expect(screen.getByText('FOMC Interest Rate Decision')).toBeInTheDocument()
    })
  })

  describe('empty fallback', () => {
    it('shows demo data badge when API returns empty events', () => {
      mockUseForwardEvents.mockReturnValue({ events: [], error: undefined, isLoading: false })
      render(<EventCalendar />)
      expect(screen.getByText('demo data')).toBeInTheDocument()
    })
  })
})
