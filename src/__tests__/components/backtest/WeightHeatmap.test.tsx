/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WeightHeatmap from '../../../components/backtest/WeightHeatmap'

describe('WeightHeatmap', () => {
  const sampleConfigs = {
    baseline: {
      weights: { rsi: 0.3, macd: 0.2, volume: 0.1 },
      description: 'Default config',
    },
    aggressive: {
      weights: { rsi: 0.5, macd: 0.4, volume: 0.0 },
      description: 'Aggressive config',
    },
  }

  it('renders source names as row headers', () => {
    render(<WeightHeatmap configs={sampleConfigs} />)
    expect(screen.getByText('macd')).toBeInTheDocument()
    expect(screen.getByText('rsi')).toBeInTheDocument()
    expect(screen.getByText('volume')).toBeInTheDocument()
  })

  it('renders config names as column headers', () => {
    render(<WeightHeatmap configs={sampleConfigs} />)
    expect(screen.getByText('baseline')).toBeInTheDocument()
    expect(screen.getByText('aggressive')).toBeInTheDocument()
  })

  it('shows weight values as percentages', () => {
    render(<WeightHeatmap configs={sampleConfigs} />)
    // baseline: rsi=30%, macd=20%, volume=10%
    // aggressive: rsi=50%, macd=40%, volume=0%
    expect(screen.getByText('30%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('returns null for empty configs', () => {
    const { container } = render(<WeightHeatmap configs={{}} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders heading "Weight Heatmap"', () => {
    render(<WeightHeatmap configs={sampleConfigs} />)
    expect(screen.getByText('Weight Heatmap')).toBeInTheDocument()
  })

  it('handles configs with different weight sources', () => {
    const configs = {
      a: { weights: { rsi: 0.5 }, description: 'A' },
      b: { weights: { macd: 0.3 }, description: 'B' },
    }
    render(<WeightHeatmap configs={configs} />)
    // Both sources should appear as rows
    expect(screen.getByText('macd')).toBeInTheDocument()
    expect(screen.getByText('rsi')).toBeInTheDocument()
    // Missing weights default to 0%
    const zeroPcts = screen.getAllByText('0%')
    expect(zeroPcts).toHaveLength(2)
  })
})
