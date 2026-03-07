/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RegimeFilter from '../../../components/backtest/RegimeFilter'

describe('RegimeFilter', () => {
  it('renders all regime options', () => {
    render(<RegimeFilter selectedRegime="all" onSelect={vi.fn()} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Trending')).toBeInTheDocument()
    expect(screen.getByText('Ranging')).toBeInTheDocument()
    expect(screen.getByText('Volatile')).toBeInTheDocument()
  })

  it('calls onSelect when an option is clicked', () => {
    const onSelect = vi.fn()
    render(<RegimeFilter selectedRegime="all" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Trending'))
    expect(onSelect).toHaveBeenCalledWith('trending')
  })

  it('applies active style to selected regime', () => {
    render(<RegimeFilter selectedRegime="trending" onSelect={vi.fn()} />)
    const trendingBtn = screen.getByText('Trending')
    expect(trendingBtn.className).toContain('bg-green-600')
    const allBtn = screen.getByText('All')
    expect(allBtn.className).toContain('bg-gray-800')
  })

  it('displays labels with first letter capitalized', () => {
    render(<RegimeFilter selectedRegime="all" onSelect={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map(b => b.textContent)).toEqual(['All', 'Trending', 'Ranging', 'Volatile'])
  })
})
