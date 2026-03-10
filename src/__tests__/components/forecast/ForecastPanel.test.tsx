/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/useForecast', () => ({
  useForecastPanel: vi.fn(),
}))

import ForecastPanel from '../../../components/forecast/ForecastPanel'
import { useForecastPanel } from '../../../hooks/useForecast'
import { mockForecastData } from '../../../mocks/forecast'

const mockUseForecastPanel = vi.mocked(useForecastPanel)

describe('ForecastPanel', () => {
  it('renders loading state', () => {
    mockUseForecastPanel.mockReturnValue({ data: undefined, error: undefined, isLoading: true })
    render(<ForecastPanel />)
    expect(screen.getByText(/Loading forecast data/)).toBeInTheDocument()
  })

  it('renders the section header', () => {
    mockUseForecastPanel.mockReturnValue({ data: mockForecastData, error: undefined, isLoading: false })
    render(<ForecastPanel />)
    expect(screen.getByText(/Forecast Signal/)).toBeInTheDocument()
  })

  it('renders forecast signal cards', () => {
    mockUseForecastPanel.mockReturnValue({ data: mockForecastData, error: undefined, isLoading: false })
    render(<ForecastPanel />)
    expect(screen.getAllByText('BTC').length).toBeGreaterThan(0)
    expect(screen.getAllByText('SOL').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ETH').length).toBeGreaterThan(0)
  })

  it('renders active predictions list', () => {
    mockUseForecastPanel.mockReturnValue({ data: mockForecastData, error: undefined, isLoading: false })
    render(<ForecastPanel />)
    expect(screen.getByText(/Active Predictions/)).toBeInTheDocument()
  })

  it('renders predict accuracy badge', () => {
    mockUseForecastPanel.mockReturnValue({ data: mockForecastData, error: undefined, isLoading: false })
    render(<ForecastPanel />)
    expect(screen.getByText('Predict Accuracy:')).toBeInTheDocument()
    expect(screen.getByText('68.8%')).toBeInTheDocument()
  })

  it('renders bridge status dot', () => {
    mockUseForecastPanel.mockReturnValue({ data: mockForecastData, error: undefined, isLoading: false })
    const { container } = render(<ForecastPanel />)
    const dot = container.querySelector('.bg-green-500')
    expect(dot).toBeInTheDocument()
  })

  it('renders disconnected state with red dot', () => {
    const disconnectedData = {
      ...mockForecastData,
      signals: [],
      bridge_status: 'disconnected' as const,
    }
    mockUseForecastPanel.mockReturnValue({ data: disconnectedData, error: new Error('Predict API: 503'), isLoading: false })
    const { container } = render(<ForecastPanel />)
    const dot = container.querySelector('.bg-red-500')
    expect(dot).toBeInTheDocument()
  })

  it('renders empty predictions state', () => {
    const emptyData = {
      ...mockForecastData,
      signals: [],
    }
    mockUseForecastPanel.mockReturnValue({ data: emptyData, error: undefined, isLoading: false })
    render(<ForecastPanel />)
    expect(screen.getByText('No active predictions')).toBeInTheDocument()
  })

  it('shows historical label when isHistorical is true', () => {
    const historicalData = {
      ...mockForecastData,
      isHistorical: true,
    }
    mockUseForecastPanel.mockReturnValue({ data: historicalData, error: undefined, isLoading: false })
    render(<ForecastPanel />)
    expect(screen.getByText(/No active predictions — showing recent history/)).toBeInTheDocument()
  })

  it('does not show historical label when isHistorical is false', () => {
    mockUseForecastPanel.mockReturnValue({ data: mockForecastData, error: undefined, isLoading: false })
    render(<ForecastPanel />)
    expect(screen.queryByText(/showing recent history/)).not.toBeInTheDocument()
  })
})
