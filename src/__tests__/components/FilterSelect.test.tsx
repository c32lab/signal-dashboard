/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterSelect from '../../components/history/FilterSelect'

describe('FilterSelect', () => {
  it('renders a select element with children', () => {
    render(
      <FilterSelect value="all">
        <option value="all">All</option>
        <option value="btc">BTC</option>
      </FilterSelect>
    )
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('BTC')).toBeInTheDocument()
  })

  it('calls onChange with selected value', () => {
    const handleChange = vi.fn()
    render(
      <FilterSelect value="all" onChange={handleChange}>
        <option value="all">All</option>
        <option value="btc">BTC</option>
      </FilterSelect>
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'btc' } })
    expect(handleChange).toHaveBeenCalledWith('btc')
  })

  it('respects disabled prop', () => {
    render(
      <FilterSelect value="all" disabled>
        <option value="all">All</option>
      </FilterSelect>
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('renders with title attribute', () => {
    render(
      <FilterSelect value="all" title="Pick symbol">
        <option value="all">All</option>
      </FilterSelect>
    )
    expect(screen.getByTitle('Pick symbol')).toBeInTheDocument()
  })
})
