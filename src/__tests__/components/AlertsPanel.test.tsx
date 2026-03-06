/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlertsPanel } from '../../components/dashboard/AlertsPanel'
import type { HealthResponse } from '../../types'

function makeHealth(overrides: Partial<HealthResponse> = {}): HealthResponse {
  return {
    status: 'running',
    uptime_seconds: 7200,
    decision_rate_per_hour: 1.5,
    duplicate_ratio: 0.3,
    active_symbols: ['BTCUSDT', 'ETHUSDT'],
    disabled_symbols: [],
    bias_alerts: [],
    ...overrides,
  }
}

describe('AlertsPanel', () => {
  it('returns null when no alerts, dupRatio <= 0.5, and no disabled symbols', () => {
    const { container } = render(<AlertsPanel data={makeHealth()} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders bias alerts with red coloring when bias_score > 0.7', () => {
    render(<AlertsPanel data={makeHealth({
      bias_alerts: [{ collector: 'momentum', bias_score: 0.85, alert: 'Severe bias' }],
    })} />)
    expect(screen.getByText('momentum')).toBeInTheDocument()
    expect(screen.getByText('0.850')).toBeInTheDocument()
    expect(screen.getByText('Severe bias')).toBeInTheDocument()
    // Check red styling on score text
    const scoreEl = screen.getByText('0.850')
    expect(scoreEl.className).toContain('text-red-300')
  })

  it('renders bias alerts with yellow coloring when bias_score > 0.5 and <= 0.7', () => {
    render(<AlertsPanel data={makeHealth({
      bias_alerts: [{ collector: 'rsi', bias_score: 0.6, alert: 'Moderate bias' }],
    })} />)
    const scoreEl = screen.getByText('0.600')
    expect(scoreEl.className).toContain('text-yellow-300')
  })

  it('renders bias alerts with gray coloring when bias_score <= 0.5', () => {
    render(<AlertsPanel data={makeHealth({
      bias_alerts: [{ collector: 'macd', bias_score: 0.3, alert: 'Low bias' }],
    })} />)
    const scoreEl = screen.getByText('0.300')
    expect(scoreEl.className).toContain('text-gray-400')
  })

  it('renders high duplicate ratio warning when dupRatio > 0.5', () => {
    render(<AlertsPanel data={makeHealth({ duplicate_ratio: 0.75 })} />)
    expect(screen.getByText(/High duplicate ratio: 75\.0%/)).toBeInTheDocument()
  })

  it('does not render duplicate warning when dupRatio <= 0.5', () => {
    render(<AlertsPanel data={makeHealth({ duplicate_ratio: 0.4 })} />)
    // No alerts at all, returns null
    expect(screen.queryByText(/High duplicate ratio/)).toBeNull()
  })

  it('renders disabled symbols list', () => {
    render(<AlertsPanel data={makeHealth({
      disabled_symbols: ['XRPUSDT', 'DOGEUSDT'],
    })} />)
    expect(screen.getByText(/Symbols disabled: XRPUSDT, DOGEUSDT/)).toBeInTheDocument()
  })
})
