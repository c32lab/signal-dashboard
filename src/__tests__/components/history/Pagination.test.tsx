/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '../../../components/history/Pagination'

describe('Pagination', () => {
  const baseProps = {
    offset: 0,
    total: 200,
    startRecord: 1,
    endRecord: 50,
    currentPage: 1,
    totalPages: 4,
    onPrev: vi.fn(),
    onNext: vi.fn(),
  }

  it('renders record range', () => {
    render(<Pagination {...baseProps} />)
    expect(screen.getByText(/第 1–50 条/)).toBeInTheDocument()
    expect(screen.getByText(/共 200 条/)).toBeInTheDocument()
  })

  it('renders page indicator', () => {
    render(<Pagination {...baseProps} />)
    expect(screen.getByText('1 / 4')).toBeInTheDocument()
  })

  it('prev button disabled when offset=0', () => {
    render(<Pagination {...baseProps} offset={0} />)
    const prevBtn = screen.getByText(/上一页/)
    expect(prevBtn).toBeDisabled()
  })

  it('next button disabled when endRecord >= total', () => {
    render(<Pagination {...baseProps} endRecord={200} total={200} />)
    const nextBtn = screen.getByText(/下一页/)
    expect(nextBtn).toBeDisabled()
  })

  it('calls onPrev/onNext when clicked', () => {
    const onPrev = vi.fn()
    const onNext = vi.fn()
    render(<Pagination {...baseProps} offset={50} onPrev={onPrev} onNext={onNext} />)
    fireEvent.click(screen.getByText(/上一页/))
    expect(onPrev).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByText(/下一页/))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('both buttons enabled in middle page', () => {
    render(<Pagination {...baseProps} offset={50} startRecord={51} endRecord={100} currentPage={2} />)
    expect(screen.getByText(/上一页/)).not.toBeDisabled()
    expect(screen.getByText(/下一页/)).not.toBeDisabled()
  })
})
