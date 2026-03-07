/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OverallSummary from '../../components/quality/OverallSummary'
import type { PerformanceResponse } from '../../types'

function makeOverall(overrides: Partial<PerformanceResponse['overall']> = {}): PerformanceResponse['overall'] {
  return { total: 100, correct: 60, accuracy_pct: 60.0, avg_pnl_pct: 1.23, ...overrides }
}

describe('OverallSummary', () => {
  it('renders "Overall Performance" heading', () => {
    render(<OverallSummary overall={makeOverall()} />)
    expect(screen.getByText('Overall Performance')).toBeInTheDocument()
  })

  it('renders accuracy_pct formatted to 2 decimals with %', () => {
    render(<OverallSummary overall={makeOverall({ accuracy_pct: 65.123 })} />)
    expect(screen.getByText('65.12%')).toBeInTheDocument()
  })

  it('renders avg_pnl_pct using pnlStr format', () => {
    render(<OverallSummary overall={makeOverall({ avg_pnl_pct: 1.23 })} />)
    expect(screen.getByText('+1.23%')).toBeInTheDocument()
  })

  it('renders total trades count', () => {
    render(<OverallSummary overall={makeOverall({ total: 250 })} />)
    expect(screen.getByText('250')).toBeInTheDocument()
  })

  it('renders correct count', () => {
    render(<OverallSummary overall={makeOverall({ correct: 42 })} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('uses green color for accuracy >50', () => {
    const { container } = render(<OverallSummary overall={makeOverall({ accuracy_pct: 55 })} />)
    const el = container.querySelector('[style*="color"]')
    expect(el).toHaveStyle({ color: '#34d399' })
  })

  it('uses yellow color for accuracy >=30 and <=50', () => {
    const { container } = render(<OverallSummary overall={makeOverall({ accuracy_pct: 35 })} />)
    const el = container.querySelector('[style*="color"]')
    expect(el).toHaveStyle({ color: '#fbbf24' })
  })

  it('uses red color for accuracy <30', () => {
    const { container } = render(<OverallSummary overall={makeOverall({ accuracy_pct: 20 })} />)
    const el = container.querySelector('[style*="color"]')
    expect(el).toHaveStyle({ color: '#f87171' })
  })
})
