/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PnlChartLegend from '../../../components/backtest/PnlChartLegend'

describe('PnlChartLegend', () => {
  const baseProps = {
    configNames: ['A_current', 'B_test'],
    visible: { A_current: true, B_test: false },
    onToggle: vi.fn(),
    configs: {
      A_current: { weights: {}, description: 'Current config' },
      B_test: { weights: {}, description: 'Test config' },
    },
  }

  it('renders config name buttons', () => {
    render(<PnlChartLegend {...baseProps} />)
    expect(screen.getByText('A_current')).toBeInTheDocument()
    expect(screen.getByText('B_test')).toBeInTheDocument()
  })

  it('renders chart title', () => {
    render(<PnlChartLegend {...baseProps} />)
    expect(screen.getByText('Cumulative PnL%')).toBeInTheDocument()
  })

  it('calls onToggle when clicking a config button', async () => {
    const onToggle = vi.fn()
    render(<PnlChartLegend {...baseProps} onToggle={onToggle} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('A_current'))
    expect(onToggle).toHaveBeenCalledWith('A_current')
  })

  it('applies different styles for visible vs hidden configs', () => {
    render(<PnlChartLegend {...baseProps} />)
    const visibleBtn = screen.getByText('A_current').closest('button')
    const hiddenBtn = screen.getByText('B_test').closest('button')
    expect(visibleBtn?.className).toContain('bg-gray-800')
    expect(hiddenBtn?.className).toContain('bg-gray-950')
  })
})
