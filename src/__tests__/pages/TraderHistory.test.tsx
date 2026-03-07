/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

// Mock hooks
vi.mock('../../hooks/useApi', () => ({
  useDecisions: vi.fn(),
  usePerformance: vi.fn(),
  useOverview: vi.fn(),
}))

// Mock child components to simple stubs
vi.mock('../../components/history', () => ({
  KpiCard: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="kpi-card">{label}: {value}</div>
  ),
  FilterBar: () => <div data-testid="filter-bar">FilterBar</div>,
  SymbolSummary: () => <div data-testid="symbol-summary">SymbolSummary</div>,
  DecisionTable: ({ isLoading, error, decisions }: { isLoading: boolean; error: unknown; decisions: unknown[] }) => (
    <div data-testid="decision-table">
      {isLoading ? 'loading' : error ? 'error' : `rows:${decisions.length}`}
    </div>
  ),
  Pagination: () => <div data-testid="pagination">Pagination</div>,
  exportCsv: vi.fn(),
  PAGE_SIZE: 50,
  TIME_PERIODS: [],
  accColor: () => '',
  pnlColor: () => '',
  pnlStr: () => '',
}))

vi.mock('../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import TraderHistory from '../../pages/TraderHistory'
import { useDecisions, usePerformance, useOverview } from '../../hooks/useApi'

const mockUseDecisions = vi.mocked(useDecisions)
const mockUsePerformance = vi.mocked(usePerformance)
const mockUseOverview = vi.mocked(useOverview)

function mockHooksDefault(overrides: {
  decisions?: Record<string, unknown>
  performance?: Record<string, unknown>
  overview?: Record<string, unknown>
} = {}) {
  mockUseDecisions.mockReturnValue({
    data: undefined, isLoading: false, error: undefined,
    ...overrides.decisions,
  } as unknown as ReturnType<typeof useDecisions>)
  mockUsePerformance.mockReturnValue({
    data: undefined, isLoading: false, error: undefined,
    ...overrides.performance,
  } as unknown as ReturnType<typeof usePerformance>)
  mockUseOverview.mockReturnValue({
    data: undefined, isLoading: false, error: undefined,
    ...overrides.overview,
  } as unknown as ReturnType<typeof useOverview>)
}

describe('TraderHistory', () => {
  it('renders loading state — passes isLoading to DecisionTable', () => {
    mockHooksDefault({ decisions: { isLoading: true } })
    render(<TraderHistory />)
    expect(screen.getByTestId('decision-table')).toHaveTextContent('loading')
  })

  it('renders error state — passes error to DecisionTable', () => {
    mockHooksDefault({ decisions: { error: new Error('fail') } })
    render(<TraderHistory />)
    expect(screen.getByTestId('decision-table')).toHaveTextContent('error')
  })

  it('renders KPI cards with data', () => {
    mockHooksDefault({
      performance: {
        data: { overall: { total: 42, accuracy_pct: 65.3, avg_pnl_pct: 1.2 } },
      },
      overview: {
        data: { action_distribution: { LONG: 10, SHORT: 5, HOLD: 2 } },
      },
    })
    render(<TraderHistory />)
    const cards = screen.getAllByTestId('kpi-card')
    expect(cards).toHaveLength(4)
    expect(cards[0]).toHaveTextContent('Total Trades: 42')
    expect(cards[1]).toHaveTextContent('Win Rate: 65.3%')
    expect(cards[3]).toHaveTextContent('Active Signals: 15')
  })

  it('renders decisions and pagination when data present', () => {
    mockHooksDefault({
      decisions: { data: { decisions: [{}, {}, {}], total: 100, limit: 50, offset: 0 } },
    })
    render(<TraderHistory />)
    expect(screen.getByTestId('decision-table')).toHaveTextContent('rows:3')
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('hides pagination when no data', () => {
    mockHooksDefault({
      decisions: { data: { decisions: [], total: 0, limit: 50, offset: 0 } },
    })
    render(<TraderHistory />)
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })
})
