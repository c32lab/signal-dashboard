/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventTable } from '../../../components/predict/EventTable'
import type { Event } from '../../../types/predict'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    date: '2026-03-06',
    symbol: 'BTC/USDT',
    price_change: -2.5,
    close_price: 60000,
    category: 'macro',
    event: 'Fed rate decision impact on crypto markets',
    tags: ['fed', 'macro', 'rates'],
    lesson: 'Rate decisions cause volatility',
    pattern_name: 'fed_rate_impact',
    source: 'CoinDesk',
    created_at: '2026-03-06T10:00:00Z',
    sources_json: [],
    url: 'https://example.com/article',
    affected_symbols_json: [],
    structured_sources_json: [],
    ...overrides,
  }
}

describe('EventTable', () => {
  it('renders event rows', () => {
    render(<EventTable events={[makeEvent(), makeEvent({ id: 2, symbol: 'ETH/USDT', category: 'defi' })]} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
    expect(screen.getByText('defi')).toBeInTheDocument()
  })

  it('renders source link when url present', () => {
    render(<EventTable events={[makeEvent({ url: 'https://example.com', source: 'Reuters' })]} />)
    const link = screen.getByText('Reuters')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders plain text when no url', () => {
    render(<EventTable events={[makeEvent({ url: '', source: 'Internal' })]} />)
    const el = screen.getByText('Internal')
    expect(el.tagName).not.toBe('A')
  })

  it('renders tags', () => {
    render(<EventTable events={[makeEvent({ tags: ['btc', 'whale', 'dip'] })]} />)
    expect(screen.getByText('btc')).toBeInTheDocument()
    expect(screen.getByText('whale')).toBeInTheDocument()
    expect(screen.getByText('dip')).toBeInTheDocument()
  })

  it('renders price change with sign', () => {
    render(<EventTable events={[makeEvent({ price_change: 1.25 })]} />)
    expect(screen.getByText('+1.25%')).toBeInTheDocument()
  })

  it('renders empty table when events array is empty', () => {
    render(<EventTable events={[]} />)
    // Headers should still render
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    // No data rows
    const rows = screen.getAllByRole('row')
    // Only the header row
    expect(rows).toHaveLength(1)
  })

  it('renders dash when source is missing and no url', () => {
    render(<EventTable events={[makeEvent({ url: '', source: '' })]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('truncates long event text', () => {
    const longEvent = 'A'.repeat(80)
    render(<EventTable events={[makeEvent({ event: longEvent })]} />)
    // Should show truncated text (60 chars + …)
    expect(screen.getByText('A'.repeat(60) + '…')).toBeInTheDocument()
  })

  it('sorts events by date descending', () => {
    const events = [
      makeEvent({ id: 1, date: '2026-03-01', symbol: 'OLD' }),
      makeEvent({ id: 2, date: '2026-03-05', symbol: 'NEW' }),
    ]
    render(<EventTable events={events} />)
    const cells = screen.getAllByRole('row')
    // First data row should be the newer date
    expect(cells[1]).toHaveTextContent('NEW')
  })
})
