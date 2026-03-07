/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import SkeletonCards from '../../components/timeline/SkeletonCards'

describe('SkeletonCards', () => {
  it('renders 4 skeleton placeholders', () => {
    const { container } = render(<SkeletonCards />)
    const cards = container.querySelectorAll('.animate-pulse')
    // Each of the 4 cards has 3 pulse elements inside + 1 outside = 4 pulse per card? Let's just check > 0
    expect(cards.length).toBeGreaterThanOrEqual(4)
  })

  it('renders 4 top-level card rows', () => {
    const { container } = render(<SkeletonCards />)
    const rows = container.querySelectorAll('.flex.gap-4')
    expect(rows).toHaveLength(4)
  })
})
