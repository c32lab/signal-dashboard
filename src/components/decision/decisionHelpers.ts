import { formatDateTime } from '../../utils/format'

export const PAGE_SIZE = 20
export const DIRECTIONS = ['LONG', 'SHORT', 'HOLD']

export type TimePreset = '1h' | '6h' | '24h' | '7d' | 'all'

export const TIME_PRESETS: { label: string; value: TimePreset; hours?: number }[] = [
  { label: '1h', value: '1h', hours: 1 },
  { label: '6h', value: '6h', hours: 6 },
  { label: '24h', value: '24h', hours: 24 },
  { label: '7d', value: '7d', hours: 168 },
  { label: 'All', value: 'all' },
]

// Rounds to the nearest minute to prevent SWR key churn (P0 fix)
export function fromIso(hours: number): string {
  const ms = Date.now() - hours * 3600_000
  const rounded = Math.floor(ms / 60_000) * 60_000
  return new Date(rounded).toISOString()
}

export function directionBadge(direction: string) {
  switch (direction) {
    case 'LONG':
      return 'bg-green-900 text-green-300'
    case 'SHORT':
      return 'bg-red-900 text-red-300'
    default:
      return 'bg-gray-800 text-gray-400'
  }
}

export function typeBadge(type: string) {
  switch (type?.toUpperCase()) {
    case 'FAST':
      return 'bg-blue-900 text-blue-300'
    case 'SLOW':
      return 'bg-purple-900 text-purple-300'
    default:
      return 'bg-gray-800 text-gray-500'
  }
}

export function formatTs(ts: string): string {
  if (isNaN(new Date(ts).getTime())) return ts
  return formatDateTime(ts)
}
