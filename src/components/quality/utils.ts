import { formatDateTime } from '../../utils/format'

export const SYMBOL_COLORS: Record<string, string> = {
  'BTC/USDT': '#60a5fa',
  'ETH/USDT': '#a78bfa',
  'SOL/USDT': '#22d3ee',
  'BNB/USDT': '#fbbf24',
  'XRP/USDT': '#34d399',
  'AVAX/USDT': '#f87171',
  'LINK/USDT': '#f472b6',
}

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e5e7eb' },
}

export const TREND_COLORS = ['#60a5fa', '#f59e0b', '#34d399', '#f87171', '#a78bfa', '#fb923c', '#22d3ee', '#e879f9']

export function accuracyColor(pct: number) {
  if (pct > 50) return '#34d399'
  if (pct >= 30) return '#fbbf24'
  return '#f87171'
}

export function formatHour(hour: string): string {
  if (isNaN(new Date(hour).getTime())) return hour
  return formatDateTime(hour)
}

export function pnlColor(pnl: number | null | undefined) {
  if (pnl == null) return 'text-gray-400'
  if (pnl > 0) return 'text-green-400'
  if (pnl < 0) return 'text-red-400'
  return 'text-gray-400'
}

export function pnlStr(pnl: number | null | undefined) {
  if (pnl == null) return '—'
  return `${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%`
}
