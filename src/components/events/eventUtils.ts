import type { ForwardEvent } from './types'

export const DIRECTION_COLOR: Record<ForwardEvent['direction'], string> = {
  bullish: 'text-green-400',
  bearish: 'text-red-400',
  neutral: 'text-gray-400',
}

export const DIRECTION_ARROW: Record<ForwardEvent['direction'], string> = {
  bullish: '▲',
  bearish: '▼',
  neutral: '—',
}

export const IMPACT_ORDER: Record<ForwardEvent['impact'], number> = {
  high: 0,
  medium: 1,
  low: 2,
}
