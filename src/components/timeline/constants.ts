export const PAGE_SIZE = 30

export const TIME_RANGES = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: 'ALL', hours: 0 },
] as const

export const DIRECTIONS = ['ALL', 'LONG', 'SHORT', 'HOLD'] as const

export function stripUsdt(symbol: string): string {
  return symbol.replace(/USDT$/i, '')
}

export const directionColor: Record<string, string> = {
  LONG: 'border-l-green-500',
  SHORT: 'border-l-red-500',
  HOLD: 'border-l-gray-500',
}

export const directionBadge: Record<string, string> = {
  LONG: 'bg-green-900/50 text-green-400',
  SHORT: 'bg-red-900/50 text-red-400',
  HOLD: 'bg-gray-700 text-gray-400',
}
