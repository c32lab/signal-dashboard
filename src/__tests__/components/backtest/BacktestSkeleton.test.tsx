/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BacktestSkeleton } from '../../../components/backtest'

describe('BacktestSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<BacktestSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders animated pulse elements', () => {
    const { container } = render(<BacktestSkeleton />)
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })
})
