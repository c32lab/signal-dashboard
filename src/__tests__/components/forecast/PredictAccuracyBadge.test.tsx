/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PredictAccuracyBadge from '../../../components/forecast/PredictAccuracyBadge'

describe('PredictAccuracyBadge', () => {
  const accuracy = { '1d': 68.8, '3d': 37.9, '7d': 52.1 }

  it('renders all three horizon values', () => {
    render(<PredictAccuracyBadge accuracy={accuracy} />)
    expect(screen.getByText('68.8%')).toBeInTheDocument()
    expect(screen.getByText('37.9%')).toBeInTheDocument()
    expect(screen.getByText('52.1%')).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(<PredictAccuracyBadge accuracy={accuracy} />)
    expect(screen.getByText('Predict Accuracy:')).toBeInTheDocument()
  })

  it('applies green color for values >= 60', () => {
    render(<PredictAccuracyBadge accuracy={accuracy} />)
    const el = screen.getByText('68.8%')
    expect(el.className).toContain('text-green-400')
  })

  it('applies red color for values < 40', () => {
    render(<PredictAccuracyBadge accuracy={accuracy} />)
    const el = screen.getByText('37.9%')
    expect(el.className).toContain('text-red-400')
  })

  it('applies yellow color for values 40-60', () => {
    render(<PredictAccuracyBadge accuracy={accuracy} />)
    const el = screen.getByText('52.1%')
    expect(el.className).toContain('text-yellow-400')
  })
})
