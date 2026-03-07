/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TradeFilters from '../../../components/trading/TradeFilters'

const baseProps = {
  symbols: ['BTCUSDT', 'ETHUSDT'],
  filterSymbol: 'ALL',
  onFilterSymbol: vi.fn(),
  filterSide: 'ALL' as const,
  onFilterSide: vi.fn(),
  filterStatus: 'ALL' as const,
  onFilterStatus: vi.fn(),
}

describe('TradeFilters', () => {
  it('renders all filter dropdowns', () => {
    render(<TradeFilters {...baseProps} />)
    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(3)
  })

  it('renders symbol options', () => {
    render(<TradeFilters {...baseProps} />)
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument()
    expect(screen.getByText('ETHUSDT')).toBeInTheDocument()
  })

  it('calls onFilterSymbol when symbol changes', async () => {
    const onFilterSymbol = vi.fn()
    render(<TradeFilters {...baseProps} onFilterSymbol={onFilterSymbol} />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'BTCUSDT')
    expect(onFilterSymbol).toHaveBeenCalledWith('BTCUSDT')
  })

  it('calls onFilterSide when side changes', async () => {
    const onFilterSide = vi.fn()
    render(<TradeFilters {...baseProps} onFilterSide={onFilterSide} />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'LONG')
    expect(onFilterSide).toHaveBeenCalledWith('LONG')
  })

  it('calls onFilterStatus when status changes', async () => {
    const onFilterStatus = vi.fn()
    render(<TradeFilters {...baseProps} onFilterStatus={onFilterStatus} />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getAllByRole('combobox')[2], 'open')
    expect(onFilterStatus).toHaveBeenCalledWith('open')
  })
})
