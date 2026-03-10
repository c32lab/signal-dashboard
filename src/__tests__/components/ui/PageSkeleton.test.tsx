/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import PageSkeleton from '../../../components/ui/PageSkeleton'

describe('PageSkeleton', () => {
  it('renders default 4 skeleton sections', () => {
    const { container } = render(<PageSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    // outer wrapper + 4 inner SectionSkeletons = 5
    expect(skeletons.length).toBe(5)
  })

  it('renders custom number of sections', () => {
    const { container } = render(<PageSkeleton sections={2} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(3) // outer + 2 inner
  })
})
