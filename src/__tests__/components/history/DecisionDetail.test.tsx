/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DecisionDetail from '../../../components/history/DecisionDetail'

function wrap(ui: React.ReactElement) {
  return render(<table><tbody>{ui}</tbody></table>)
}

describe('DecisionDetail', () => {
  it('renders "No detail data" when rawJson is undefined', () => {
    wrap(<DecisionDetail colSpan={11} />)
    expect(screen.getByText('No detail data')).toBeInTheDocument()
  })

  it('renders "No detail data" when rawJson is invalid JSON', () => {
    wrap(<DecisionDetail rawJson="{bad json" colSpan={11} />)
    expect(screen.getByText('No detail data')).toBeInTheDocument()
  })

  it('renders "No signal breakdown available" when signals array is empty', () => {
    const json = JSON.stringify({ combined: { signals: [] } })
    wrap(<DecisionDetail rawJson={json} colSpan={11} />)
    expect(screen.getByText('No signal breakdown available')).toBeInTheDocument()
  })

  it('renders signal breakdown table with signal data', () => {
    const json = JSON.stringify({
      combined: {
        signals: [
          { source: 'RSI', direction: 'LONG', strength: 0.75, confidence: 0.8, timeframe: '1h', reasoning: 'Oversold' },
        ],
        agree_ratio: 0.833,
      },
      combined_score: 0.512,
      decision_type: 'FAST',
      reasoning: 'Strong buy signal',
    })
    wrap(<DecisionDetail rawJson={json} colSpan={11} />)
    expect(screen.getByText('Signal Breakdown')).toBeInTheDocument()
    expect(screen.getByText('RSI')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('0.75')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('Oversold')).toBeInTheDocument()
  })

  it('renders meta section with agree ratio, combined score, and type', () => {
    const json = JSON.stringify({
      combined: { signals: [], agree_ratio: 0.667 },
      combined_score: -0.234,
      decision_type: 'SLOW',
    })
    wrap(<DecisionDetail rawJson={json} colSpan={11} />)
    expect(screen.getByText('66.7%')).toBeInTheDocument()
    expect(screen.getByText('-0.234')).toBeInTheDocument()
    expect(screen.getByText('SLOW')).toBeInTheDocument()
    // negative score should be red
    const scoreEl = screen.getByText('-0.234')
    expect(scoreEl.className).toContain('text-red-400')
  })

  it('renders reasoning paragraph when present', () => {
    const json = JSON.stringify({ reasoning: 'Market is bearish' })
    wrap(<DecisionDetail rawJson={json} colSpan={5} />)
    expect(screen.getByText('Market is bearish')).toBeInTheDocument()
  })
})
