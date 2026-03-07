/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TradePagination from '../../../components/trading/TradePagination'

describe('TradePagination', () => {
  it('renders range and total', () => {
    render(
      <TradePagination
        rangeStart={1} rangeEnd={15} total={30}
        canPrev={false} canNext={true}
        onPrev={() => {}} onNext={() => {}}
      />
    )
    expect(screen.getByText('1-15 of 30')).toBeInTheDocument()
  })

  it('disables prev button when canPrev is false', () => {
    render(
      <TradePagination
        rangeStart={1} rangeEnd={15} total={30}
        canPrev={false} canNext={true}
        onPrev={() => {}} onNext={() => {}}
      />
    )
    expect(screen.getByText('上一页')).toBeDisabled()
  })

  it('disables next button when canNext is false', () => {
    render(
      <TradePagination
        rangeStart={16} rangeEnd={30} total={30}
        canPrev={true} canNext={false}
        onPrev={() => {}} onNext={() => {}}
      />
    )
    expect(screen.getByText('下一页')).toBeDisabled()
  })

  it('calls onNext when clicking next', async () => {
    const onNext = vi.fn()
    render(
      <TradePagination
        rangeStart={1} rangeEnd={15} total={30}
        canPrev={false} canNext={true}
        onPrev={() => {}} onNext={onNext}
      />
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('下一页'))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('calls onPrev when clicking prev', async () => {
    const onPrev = vi.fn()
    render(
      <TradePagination
        rangeStart={16} rangeEnd={30} total={30}
        canPrev={true} canNext={false}
        onPrev={onPrev} onNext={() => {}}
      />
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('上一页'))
    expect(onPrev).toHaveBeenCalledOnce()
  })
})
