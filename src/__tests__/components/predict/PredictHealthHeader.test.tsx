/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PredictHealthHeader } from '../../../components/predict/PredictHealthHeader'
import type { PredictAccuracyResponse } from '../../../types/predict'

function makeAccuracy(overrides: Partial<Record<string, { total: number; correct: number; accuracy: number }>> = {}): PredictAccuracyResponse {
  return {
    accuracy: {
      '1d': { total: 20, correct: 12, accuracy: 60.0 },
      '3d': { total: 15, correct: 7, accuracy: 46.7 },
      ...overrides,
    },
    recent_validations: [],
  }
}

describe('PredictHealthHeader', () => {
  it('renders Online when serviceOk is true', () => {
    render(
      <PredictHealthHeader serviceOk={true} activeCount={5} eventCount={10} macroScore={72.3} accuracy={undefined} />
    )
    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.queryByText('Down')).not.toBeInTheDocument()
  })

  it('renders Down when serviceOk is false', () => {
    render(
      <PredictHealthHeader serviceOk={false} activeCount={0} eventCount={0} macroScore={null} accuracy={undefined} />
    )
    expect(screen.getByText('Down')).toBeInTheDocument()
    expect(screen.queryByText('Online')).not.toBeInTheDocument()
  })

  it('renders active count and event count', () => {
    render(
      <PredictHealthHeader serviceOk={true} activeCount={42} eventCount={108} macroScore={null} accuracy={undefined} />
    )
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('108')).toBeInTheDocument()
  })

  it('renders macro score formatted to 1 decimal', () => {
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={72.345} accuracy={undefined} />
    )
    expect(screen.getByText('72.3')).toBeInTheDocument()
  })

  it('renders dash when macroScore is null', () => {
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={null} accuracy={undefined} />
    )
    // Macro Score card should show em-dash
    const macroDashes = screen.getAllByText('—')
    expect(macroDashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders accuracy percentages when accuracy data provided', () => {
    const acc = makeAccuracy()
    render(
      <PredictHealthHeader serviceOk={true} activeCount={5} eventCount={10} macroScore={65} accuracy={acc} />
    )
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    expect(screen.getByText('46.7%')).toBeInTheDocument()
  })

  it('renders correct/total counts', () => {
    const acc = makeAccuracy()
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={null} accuracy={acc} />
    )
    expect(screen.getByText('12/20')).toBeInTheDocument()
    expect(screen.getByText('7/15')).toBeInTheDocument()
  })

  it('shows low sample warning when total < 10', () => {
    const acc = makeAccuracy({
      '1d': { total: 5, correct: 3, accuracy: 60.0 },
      '3d': { total: 8, correct: 4, accuracy: 50.0 },
    })
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={null} accuracy={acc} />
    )
    const warnings = screen.getAllByText(/Low sample/)
    expect(warnings).toHaveLength(2)
  })

  it('does not show low sample warning when total >= 10', () => {
    const acc = makeAccuracy({
      '1d': { total: 20, correct: 12, accuracy: 60.0 },
      '3d': { total: 15, correct: 7, accuracy: 46.7 },
    })
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={null} accuracy={acc} />
    )
    expect(screen.queryByText(/Low sample/)).not.toBeInTheDocument()
  })

  it('renders dashes when accuracy is undefined', () => {
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={null} accuracy={undefined} />
    )
    // 1d and 3d accuracy cards + macro score = multiple dashes
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(3)
  })

  it('applies green color for accuracy >= 60', () => {
    const acc = makeAccuracy({ '1d': { total: 20, correct: 14, accuracy: 70.0 } })
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={null} accuracy={acc} />
    )
    const el = screen.getByText('70.0%')
    expect(el.className).toContain('text-green-400')
  })

  it('applies yellow color for accuracy >= 50 and < 60', () => {
    const acc = makeAccuracy({ '1d': { total: 20, correct: 11, accuracy: 55.0 } })
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={null} accuracy={acc} />
    )
    const el = screen.getByText('55.0%')
    expect(el.className).toContain('text-yellow-400')
  })

  it('applies red color for accuracy < 50', () => {
    const acc = makeAccuracy({ '1d': { total: 20, correct: 6, accuracy: 30.0 } })
    render(
      <PredictHealthHeader serviceOk={true} activeCount={0} eventCount={0} macroScore={null} accuracy={acc} />
    )
    const el = screen.getByText('30.0%')
    expect(el.className).toContain('text-red-400')
  })
})
