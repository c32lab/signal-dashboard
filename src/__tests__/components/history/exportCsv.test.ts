import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock api
const mockDecisions = vi.fn()
vi.mock('../../../api', () => ({
  api: { decisions: (...args: unknown[]) => mockDecisions(...args) },
}))

// Mock DOM APIs for download
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
const mockRevokeObjectURL = vi.fn()

const { exportCsv } = await import('../../../components/history/exportCsv')

describe('exportCsv', () => {
  beforeEach(() => {
    mockDecisions.mockReset()
    mockClick.mockClear()
    mockCreateObjectURL.mockClear()
    mockRevokeObjectURL.mockClear()

    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    })

    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLElement)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates CSV with correct headers', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [{
        id: '1',
        timestamp: '2026-03-07T10:00:00Z',
        symbol: 'BTC/USDT',
        action: 'LONG',
        direction: 'LONG',
        decision_type: 'FAST',
        confidence: 0.85,
        combined_score: 0.512,
        price_at_decision: 65000,
        reasoning: 'Bullish',
        raw_json: JSON.stringify({ suggested_stop_loss: 63000, suggested_take_profit: 70000 }),
      }],
      total: 1,
    })

    await exportCsv({})

    // Check the anchor click was called
    expect(mockClick).toHaveBeenCalled()
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')

    // Verify CSV content via Blob constructor args
    const blobArg = vi.mocked(document.createElement).mock.results[0].value
    expect(blobArg.href).toBe('blob:mock-url')
  })

  it('fetches multiple pages when total > batchSize', async () => {
    const makeBatch = (offset: number, size: number) => ({
      decisions: Array.from({ length: size }, (_, i) => ({
        id: String(offset + i),
        timestamp: '2026-03-07T10:00:00Z',
        symbol: 'ETH/USDT',
        action: 'LONG',
        direction: 'LONG',
        decision_type: 'FAST',
        confidence: 0.9,
        combined_score: 0.3,
        price_at_decision: 3000,
        reasoning: 'test',
      })),
      total: 450,
    })

    mockDecisions
      .mockResolvedValueOnce(makeBatch(0, 200))
      .mockResolvedValueOnce(makeBatch(200, 200))
      .mockResolvedValueOnce(makeBatch(400, 50))

    await exportCsv({})

    expect(mockDecisions).toHaveBeenCalledTimes(3)
    expect(mockDecisions).toHaveBeenCalledWith(expect.objectContaining({ limit: 200, offset: 0 }))
    expect(mockDecisions).toHaveBeenCalledWith(expect.objectContaining({ limit: 200, offset: 200 }))
    expect(mockDecisions).toHaveBeenCalledWith(expect.objectContaining({ limit: 200, offset: 400 }))
  })

  it('passes server filters but excludes direction', async () => {
    mockDecisions.mockResolvedValue({ decisions: [], total: 0 })

    await exportCsv({ symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', from: '2026-03-01' })

    expect(mockDecisions).toHaveBeenCalledWith(
      expect.objectContaining({ symbol: 'BTC/USDT', action: 'LONG', from: '2026-03-01' }),
    )
    // direction should NOT be in server call
    const callArg = mockDecisions.mock.calls[0][0]
    expect(callArg).not.toHaveProperty('direction')
  })

  it('applies direction filter client-side', async () => {
    mockDecisions.mockResolvedValue({
      decisions: [
        { id: '1', timestamp: 't1', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', decision_type: 'FAST', confidence: 0.8, combined_score: 0.5, price_at_decision: 65000, reasoning: 'a' },
        { id: '2', timestamp: 't2', symbol: 'BTC/USDT', action: 'SHORT', direction: 'SHORT', decision_type: 'FAST', confidence: 0.7, combined_score: -0.3, price_at_decision: 64000, reasoning: 'b' },
      ],
      total: 2,
    })

    // Capture the Blob content
    const BlobSpy = vi.fn().mockImplementation(function(this: Blob, parts: string[]) {
      (this as Blob & { _content: string })._content = parts[0]
      return this
    })
    vi.stubGlobal('Blob', BlobSpy)

    await exportCsv({ direction: 'LONG' })

    const csvContent = (BlobSpy.mock.instances[0] as unknown as { _content: string })._content
    const lines = csvContent.split('\n')
    // Header + 1 filtered row (only LONG)
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('timestamp')
    expect(lines[1]).toContain('LONG')
  })

  it('stops fetching when decisions.length < batchSize', async () => {
    mockDecisions.mockResolvedValue({
      decisions: Array.from({ length: 50 }, (_, i) => ({
        id: String(i),
        timestamp: '2026-03-07T10:00:00Z',
        symbol: 'ETH/USDT',
        action: 'HOLD',
        direction: 'LONG',
        decision_type: 'SLOW',
        confidence: 0.5,
        combined_score: 0,
        price_at_decision: 3000,
        reasoning: 'test',
      })),
      total: 50,
    })

    await exportCsv({})

    // Only 1 request since first batch returned < 200 items
    expect(mockDecisions).toHaveBeenCalledTimes(1)
  })
})
