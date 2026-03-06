import type { Decision } from '../../types'
import { api } from '../../api'
import { parseRawJson, stripUsdt } from './utils'

export async function exportCsv(filters: {
  symbol?: string
  action?: string
  direction?: string
  type?: string
  from?: string
}) {
  const batchSize = 200
  const maxRecords = 2000
  const allRows: Decision[] = []
  // direction is client-side only, don't send to backend
  const { direction, ...serverFilters } = filters

  for (let offset = 0; offset < maxRecords; offset += batchSize) {
    const resp = await api.decisions({ ...serverFilters, limit: batchSize, offset })
    allRows.push(...resp.decisions)
    if (allRows.length >= resp.total || resp.decisions.length < batchSize) break
  }

  // Apply direction filter client-side
  const filtered = direction
    ? allRows.filter(d => d.direction === direction)
    : allRows

  const headers = [
    'timestamp', 'symbol', 'action', 'direction', 'decision_type',
    'confidence', 'combined_score', 'price_at_decision', 'stop_loss', 'take_profit', 'reasoning',
  ]
  const rows = filtered.map(d => {
    const { stop_loss, take_profit } = parseRawJson(d.raw_json)
    return [
      d.timestamp,
      stripUsdt(d.symbol),
      d.action,
      d.direction,
      d.decision_type,
      typeof d.confidence === 'number' ? `${(d.confidence * 100).toFixed(1)}%` : '', // confidence: decimal_0_1 → ×100
      typeof d.combined_score === 'number' ? d.combined_score.toFixed(3) : '',
      typeof d.price_at_decision === 'number' ? d.price_at_decision.toFixed(4) : '',
      stop_loss != null ? String(stop_loss) : '',
      take_profit != null ? String(take_profit) : '',
      `"${(d.reasoning || '').replace(/"/g, '""')}"`,
    ]
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `decisions_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
