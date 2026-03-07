/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KpiCard from '../../../components/history/KpiCard'

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total" value="1,234" />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('applies custom color class', () => {
    render(<KpiCard label="PnL" value="+5.2%" color="text-green-400" />)
    const el = screen.getByText('+5.2%')
    expect(el.className).toContain('text-green-400')
  })

  it('uses default color when not specified', () => {
    render(<KpiCard label="Score" value="42" />)
    const el = screen.getByText('42')
    expect(el.className).toContain('text-gray-100')
  })

  it('renders with monospace font', () => {
    render(<KpiCard label="Value" value="99" />)
    const el = screen.getByText('99')
    expect(el.className).toContain('font-mono')
  })
})
