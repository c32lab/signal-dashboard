export const PAGE_SIZE = 50

export const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'AVAX/USDT', 'LINK/USDT']

export const ACTIONS = ['LONG', 'SHORT', 'HOLD']
export const DIRECTIONS = ['LONG', 'SHORT', 'NEUTRAL']

export const TIME_PERIODS: { label: string; ms: number }[] = [
  { label: 'Last 1h',  ms: 1 * 60 * 60_000 },
  { label: 'Last 6h',  ms: 6 * 60 * 60_000 },
  { label: 'Last 24h', ms: 24 * 60 * 60_000 },
  { label: 'Last 7d',  ms: 7 * 24 * 60 * 60_000 },
]
