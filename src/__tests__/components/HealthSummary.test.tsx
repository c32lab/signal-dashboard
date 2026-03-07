/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthSummary } from '../../components/dashboard/HealthSummary'
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

describe('HealthSummary', () => {
  it('renders uptime formatted as "Xh Ym"', () => {
    render(<HealthSummary data={makeHealth({ uptime_seconds: 7380 })} />)
    expect(screen.getByText('2h 3m')).toBeInTheDocument()
  })

  it('renders decision rate with green color when >= 0.5', () => {
    render(<HealthSummary data={makeHealth({ decision_rate_per_hour: 1.5 })} />)
    const el = screen.getByText('1.50/hr')
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('text-green-400')
  })

  it('renders decision rate with yellow color when < 0.5 and >= 0.1', () => {
    render(<HealthSummary data={makeHealth({ decision_rate_per_hour: 0.3 })} />)
    const el = screen.getByText('0.30/hr')
    expect(el.className).toContain('text-yellow-400')
  })

  it('renders decision rate with red color when < 0.1', () => {
    render(<HealthSummary data={makeHealth({ decision_rate_per_hour: 0.05 })} />)
    const el = screen.getByText('0.05/hr')
    expect(el.className).toContain('text-red-400')
  })

  it('renders duplicate ratio as percentage', () => {
    render(<HealthSummary data={makeHealth({ duplicate_ratio: 0.3 })} />)
    expect(screen.getByText('30.0%')).toBeInTheDocument()
  })

  it('renders active and disabled symbol counts', () => {
    render(<HealthSummary data={makeHealth({
      active_symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
      disabled_symbols: ['XRPUSDT'],
    })} />)
    expect(screen.getByText('3 / 1 disabled')).toBeInTheDocument()
  })

  it('renders bias alerts when present', () => {
    render(<HealthSummary data={makeHealth({
      bias_alerts: [
        { collector: 'rsi_collector', bias_score: 0.85, alert: 'Strong long bias detected' },
      ],
    })} />)
    expect(screen.getByText(/rsi_collector/)).toBeInTheDocument()
    expect(screen.getByText(/Strong long bias detected/)).toBeInTheDocument()
    expect(screen.getByText(/0\.850/)).toBeInTheDocument()
  })

  it('does not render bias alerts section when array is empty', () => {
    const { container } = render(<HealthSummary data={makeHealth({ bias_alerts: [] })} />)
    expect(container.querySelector('.border-yellow-700')).toBeNull()
  })

  it('renders duplicate ratio with red color when > 60%', () => {
    render(<HealthSummary data={makeHealth({ duplicate_ratio: 0.7 })} />)
    const el = screen.getByText('70.0%')
    expect(el.className).toContain('text-red-400')
  })

  it('renders duplicate ratio with yellow color when 40-60%', () => {
    render(<HealthSummary data={makeHealth({ duplicate_ratio: 0.5 })} />)
    const el = screen.getByText('50.0%')
    expect(el.className).toContain('text-yellow-400')
  })

  it('renders duplicate ratio with green color when <= 40%', () => {
    render(<HealthSummary data={makeHealth({ duplicate_ratio: 0.2 })} />)
    const el = screen.getByText('20.0%')
    expect(el.className).toContain('text-green-400')
  })

  it('renders symbol color red when disabled symbols exist', () => {
    render(<HealthSummary data={makeHealth({ active_symbols: ['BTC'], disabled_symbols: ['ETH'] })} />)
    const el = screen.getByText('1 / 1 disabled')
    expect(el.className).toContain('text-red-400')
  })

  it('renders symbol color green when no disabled symbols', () => {
    render(<HealthSummary data={makeHealth({ active_symbols: ['BTC'], disabled_symbols: [] })} />)
    const el = screen.getByText('1 / 0 disabled')
    expect(el.className).toContain('text-green-400')
  })
})
