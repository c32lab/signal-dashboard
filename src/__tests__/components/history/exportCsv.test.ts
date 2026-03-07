import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportCsv } from '../../../components/history/exportCsv'
import { api } from '../../../api'

vi.mock('../../../api', () => ({
  api: {
    decisions: vi.fn(),
  },
}))

const mockDecisions = vi.mocked(api.decisions)

describe('exportCsv', () => {
  let clickSpy: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    clickSpy = vi.fn()
    revokeObjectURL = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({
      click: clickSpy,
      set href(_: string) {},
      set download(_: string) {},
    } as unknown as HTMLAnchorElement)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    URL.revokeObjectURL = revokeObjectURL as (url: string) => void
  })

  it('fetches decisions and triggers download', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [
        {
          id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
          action: 'LONG', direction: 'LONG', confidence: 0.85,
          decision_type: 'FAST', combined_score: 0.9, reasoning: 'Test',
          price_at_decision: 60000,
        },
      ],
      total: 1, limit: 200, offset: 0,
    })

    await exportCsv({})
    expect(mockDecisions).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })

  it('applies direction filter client-side', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [
        {
          id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
          action: 'LONG', direction: 'LONG', confidence: 0.85,
          decision_type: 'FAST', combined_score: 0.9, reasoning: 'Test',
          price_at_decision: 60000,
        },
        {
          id: '2', timestamp: '2026-03-07T02:00:00Z', symbol: 'ETH/USDT',
          action: 'SHORT', direction: 'SHORT', confidence: 0.7,
          decision_type: 'SLOW', combined_score: 0.5, reasoning: 'Test2',
          price_at_decision: 3000,
        },
      ],
      total: 2, limit: 200, offset: 0,
    })

    await exportCsv({ direction: 'LONG' })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('does not send direction to backend', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [],
      total: 0, limit: 200, offset: 0,
    })

    await exportCsv({ direction: 'LONG', symbol: 'BTC/USDT' })
    const callArgs = mockDecisions.mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('direction')
    expect(callArgs).toHaveProperty('symbol', 'BTC/USDT')
  })

  it('handles null confidence and combined_score', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [
        {
          id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
          action: 'HOLD', direction: 'HOLD',
          confidence: undefined as unknown as number,
          decision_type: 'FAST',
          combined_score: undefined as unknown as number,
          reasoning: '',
          price_at_decision: undefined as unknown as number,
        },
      ],
      total: 1, limit: 200, offset: 0,
    })

    await exportCsv({})
    expect(clickSpy).toHaveBeenCalled()
  })

  it('handles stop_loss and take_profit from raw_json', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [
        {
          id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
          action: 'LONG', direction: 'LONG', confidence: 0.85,
          decision_type: 'FAST', combined_score: 0.9, reasoning: 'Test "quoted"',
          price_at_decision: 60000,
          raw_json: JSON.stringify({ suggested_stop_loss: 58000, suggested_take_profit: 65000 }),
        },
      ],
      total: 1, limit: 200, offset: 0,
    })

    await exportCsv({})
    expect(clickSpy).toHaveBeenCalled()
  })

  it('paginates when total exceeds batch size', async () => {
    const makeBatch = (offset: number) => ({
      decisions: Array.from({ length: 200 }, (_, i) => ({
        id: String(offset + i), timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
        action: 'LONG', direction: 'LONG', confidence: 0.85,
        decision_type: 'FAST', combined_score: 0.9, reasoning: '',
        price_at_decision: 60000,
      })),
      total: 500, limit: 200, offset,
    })
    mockDecisions
      .mockResolvedValueOnce(makeBatch(0))
      .mockResolvedValueOnce(makeBatch(200))
      .mockResolvedValueOnce({ decisions: Array.from({ length: 100 }, (_, i) => ({
        id: String(400 + i), timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
        action: 'LONG', direction: 'LONG', confidence: 0.85,
        decision_type: 'FAST', combined_score: 0.9, reasoning: '',
        price_at_decision: 60000,
      })), total: 500, limit: 200, offset: 400 })

    await exportCsv({})
    expect(mockDecisions).toHaveBeenCalledTimes(3)
    expect(clickSpy).toHaveBeenCalled()
  })

  it('stops pagination when allRows reaches total', async () => {
    mockDecisions.mockResolvedValue({
      decisions: Array.from({ length: 50 }, (_, i) => ({
        id: String(i), timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
        action: 'LONG', direction: 'LONG', confidence: 0.85,
        decision_type: 'FAST', combined_score: 0.9, reasoning: '',
        price_at_decision: 60000,
      })),
      total: 50, limit: 200, offset: 0,
    })

    await exportCsv({})
    expect(mockDecisions).toHaveBeenCalledTimes(1)
  })

  it('handles no direction filter (exports all rows)', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [
        { id: '1', timestamp: 't', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.5, decision_type: 'FAST', combined_score: 0.5, reasoning: 'r', price_at_decision: 60000 },
        { id: '2', timestamp: 't', symbol: 'ETH/USDT', action: 'SHORT', direction: 'SHORT', confidence: 0.5, decision_type: 'FAST', combined_score: 0.5, reasoning: 'r', price_at_decision: 3000 },
      ],
      total: 2, limit: 200, offset: 0,
    })

    await exportCsv({})
    expect(clickSpy).toHaveBeenCalled()
  })

  it('handles reasoning with undefined', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [
        { id: '1', timestamp: 't', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.5, decision_type: 'FAST', combined_score: 0.5, reasoning: undefined as unknown as string, price_at_decision: 60000 },
      ],
      total: 1, limit: 200, offset: 0,
    })

    await exportCsv({})
    expect(clickSpy).toHaveBeenCalled()
  })

  it('handles invalid raw_json gracefully', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [
        { id: '1', timestamp: 't', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.5, decision_type: 'FAST', combined_score: 0.5, reasoning: '', price_at_decision: 60000, raw_json: 'invalid json' },
      ],
      total: 1, limit: 200, offset: 0,
    })

    await exportCsv({})
    expect(clickSpy).toHaveBeenCalled()
  })
})
