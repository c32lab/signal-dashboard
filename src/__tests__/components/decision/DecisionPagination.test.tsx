/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DecisionPagination from '../../../components/decision/DecisionPagination'

const defaultProps = {
  total: 50,
  safePage: 2,
  totalPages: 5,
  isFiltered: false,
  onPrev: vi.fn(),
  onNext: vi.fn(),
}

describe('DecisionPagination', () => {
  it('renders record count with plural', () => {
    render(<DecisionPagination {...defaultProps} />)
    expect(screen.getByText('50 records')).toBeInTheDocument()
  })

  it('renders singular when total is 1', () => {
    render(<DecisionPagination {...defaultProps} total={1} />)
    expect(screen.getByText('1 record')).toBeInTheDocument()
  })

  it('shows filtered label when isFiltered is true', () => {
    render(<DecisionPagination {...defaultProps} isFiltered={true} />)
    expect(screen.getByText('50 records (filtered)')).toBeInTheDocument()
  })

  it('does not show filtered label when isFiltered is false', () => {
    render(<DecisionPagination {...defaultProps} />)
    expect(screen.queryByText(/filtered/)).not.toBeInTheDocument()
  })

  it('shows current page and total pages', () => {
    render(<DecisionPagination {...defaultProps} />)
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('calls onPrev when prev button clicked', () => {
    const onPrev = vi.fn()
    render(<DecisionPagination {...defaultProps} onPrev={onPrev} />)
    fireEvent.click(screen.getByText('‹'))
    expect(onPrev).toHaveBeenCalledOnce()
  })

  it('calls onNext when next button clicked', () => {
    const onNext = vi.fn()
    render(<DecisionPagination {...defaultProps} onNext={onNext} />)
    fireEvent.click(screen.getByText('›'))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('disables prev button on first page', () => {
    render(<DecisionPagination {...defaultProps} safePage={1} />)
    expect(screen.getByText('‹')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<DecisionPagination {...defaultProps} safePage={5} />)
    expect(screen.getByText('›')).toBeDisabled()
  })

  it('enables both buttons on middle page', () => {
    render(<DecisionPagination {...defaultProps} safePage={3} />)
    expect(screen.getByText('‹')).not.toBeDisabled()
    expect(screen.getByText('›')).not.toBeDisabled()
  })

  it('renders zero records', () => {
    render(<DecisionPagination {...defaultProps} total={0} safePage={1} totalPages={1} />)
    expect(screen.getByText('0 records')).toBeInTheDocument()
  })
})
