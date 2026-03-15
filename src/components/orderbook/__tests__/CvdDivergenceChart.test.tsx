import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CvdDivergenceChart from '../CvdDivergenceChart'

vi.mock('../../../hooks/useApi', () => ({
  useOrderbookCvd: () => ({ data: undefined, error: undefined, isLoading: false }),
}))

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  }
})

describe('CvdDivergenceChart', () => {
  it('renders without crash and shows empty state when no live data', () => {
    render(<CvdDivergenceChart />)
    expect(screen.getByText('CVD Divergence')).toBeInTheDocument()
    expect(screen.getByText(/CVD data not available/)).toBeInTheDocument()
  })
})
