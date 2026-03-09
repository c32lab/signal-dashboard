import { useAccuracy } from '../../hooks/useApi'
import type { AccuracyResponse } from '../../types'

function getBadge(pct: number): { bg: string; text: string; label: string } {
  if (pct >= 55) return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Good' }
  if (pct >= 45) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Caution' }
  return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Alert' }
}

function getDelta(data: AccuracyResponse): { value: number; direction: 'up' | 'down' | 'flat' } {
  const current = data.windows['24h'].accuracy['4h_pct']
  const previous = data.windows['12h'].accuracy['4h_pct']
  const diff = current - previous
  return {
    value: Math.abs(diff),
    direction: diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'flat',
  }
}

export default function AccuracyAlertIndicator() {
  const { data, isLoading, error } = useAccuracy()

  if (isLoading || error || !data) return null

  const accuracy = data.windows['24h'].accuracy['4h_pct']
  const badge = getBadge(accuracy)
  const delta = getDelta(data)

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${badge.bg}`} data-testid="accuracy-alert">
      <span className={`text-sm font-semibold ${badge.text}`}>
        {accuracy.toFixed(1)}%
      </span>
      <span className={`text-xs ${badge.text}`}>{badge.label}</span>
      {delta.direction !== 'flat' && (
        <span className={`text-xs ${delta.direction === 'up' ? 'text-green-400' : 'text-red-400'}`} data-testid="delta-indicator">
          {delta.direction === 'up' ? '▲' : '▼'} {delta.value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
