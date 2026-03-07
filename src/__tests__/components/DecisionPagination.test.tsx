/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DecisionPagination from '../../components/decision/DecisionPagination'

describe('DecisionPagination', () => {
  const baseProps = {
    total: 100,
    safePage: 1,
    totalPages: 5,
    isFiltered: false,
    onPrev: vi.fn(),
    onNext: vi.fn(),
  }

  it('renders record count', () => {
    render(<DecisionPagination {...baseProps} />)
    expect(screen.getByText('100 records')).toBeInTheDocument()
  })

  it('uses singular "record" for count of 1', () => {
    render(<DecisionPagination {...baseProps} total={1} />)
    expect(screen.getByText('1 record')).toBeInTheDocument()
  })

  it('shows "(filtered)" when isFiltered is true', () => {
    render(<DecisionPagination {...baseProps} isFiltered={true} />)
    expect(screen.getByText(/\(filtered\)/)).toBeInTheDocument()
  })

  it('renders page indicator', () => {
    render(<DecisionPagination {...baseProps} safePage={3} totalPages={5} />)
    expect(screen.getByText('3 / 5')).toBeInTheDocument()
  })

  it('disables prev button on first page', () => {
    render(<DecisionPagination {...baseProps} safePage={1} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<DecisionPagination {...baseProps} safePage={5} totalPages={5} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[1]).toBeDisabled()
  })

  it('calls onPrev and onNext when clicked', () => {
    const onPrev = vi.fn()
    const onNext = vi.fn()
    render(<DecisionPagination {...baseProps} safePage={3} onPrev={onPrev} onNext={onNext} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(onPrev).toHaveBeenCalledOnce()
    fireEvent.click(buttons[1])
    expect(onNext).toHaveBeenCalledOnce()
  })
})
