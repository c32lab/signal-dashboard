/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfigWeightsDetail from '../../../components/backtest/ConfigWeightsDetail'
import type { BacktestConfig } from '../../../types/backtest'

const configs: Record<string, BacktestConfig> = {
  A_current: { weights: { momentum: 0.4, mean_rev: 0.6 }, description: 'Current' },
  B_test: { weights: { momentum: 0.7, mean_rev: 0.3 }, description: 'Test' },
}

describe('ConfigWeightsDetail', () => {
  it('renders collapsed by default', () => {
    render(<ConfigWeightsDetail configs={configs} />)
    expect(screen.getByText('Config Weights Detail')).toBeInTheDocument()
    expect(screen.getByText('▼')).toBeInTheDocument()
    // Table should not be visible
    expect(screen.queryByText('Weight Key')).not.toBeInTheDocument()
  })

  it('expands on click and shows weight table', () => {
    render(<ConfigWeightsDetail configs={configs} />)
    fireEvent.click(screen.getByText('Config Weights Detail'))
    expect(screen.getByText('▲')).toBeInTheDocument()
    expect(screen.getByText('Weight Key')).toBeInTheDocument()
    expect(screen.getByText('momentum')).toBeInTheDocument()
    expect(screen.getByText('mean_rev')).toBeInTheDocument()
  })

  it('renders multiple config columns with weight values', () => {
    render(<ConfigWeightsDetail configs={configs} />)
    fireEvent.click(screen.getByText('Config Weights Detail'))
    // Config column headers
    expect(screen.getByText('A_current')).toBeInTheDocument()
    expect(screen.getByText('B_test')).toBeInTheDocument()
    // Weight values
    expect(screen.getByText('0.4')).toBeInTheDocument()
    expect(screen.getByText('0.7')).toBeInTheDocument()
  })

  it('highlights differing values with amber styling', () => {
    render(<ConfigWeightsDetail configs={configs} />)
    fireEvent.click(screen.getByText('Config Weights Detail'))
    // momentum values differ (0.4 vs 0.7), should have amber styling
    const cell04 = screen.getByText('0.4')
    expect(cell04.className).toContain('text-amber-400')
  })

  it('returns null when configs is empty', () => {
    const { container } = render(<ConfigWeightsDetail configs={{}} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders "—" for missing weight values', () => {
    const partialConfigs: Record<string, BacktestConfig> = {
      A: { weights: { momentum: 0.4, rsi: 0.3 }, description: 'A' },
      B: { weights: { momentum: 0.5 }, description: 'B' },
    }
    render(<ConfigWeightsDetail configs={partialConfigs} />)
    fireEvent.click(screen.getByText('Config Weights Detail'))
    // B doesn't have rsi, should show "—"
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('does not highlight when all values are the same', () => {
    const sameConfigs: Record<string, BacktestConfig> = {
      A: { weights: { momentum: 0.5 }, description: 'A' },
      B: { weights: { momentum: 0.5 }, description: 'B' },
    }
    render(<ConfigWeightsDetail configs={sameConfigs} />)
    fireEvent.click(screen.getByText('Config Weights Detail'))
    const cells = screen.getAllByText('0.5')
    cells.forEach(cell => {
      expect(cell.className).not.toContain('text-amber-400')
    })
  })
})
