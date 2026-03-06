import { formatDateTime } from '../../utils/format'

export function actionBadge(action: string): string {
  switch (action) {
    case 'LONG': return 'bg-green-900 text-green-300'
    case 'SHORT': return 'bg-red-900 text-red-300'
    default: return 'bg-gray-800 text-gray-400'
  }
}

export function dirBadge(dir: string): string {
  switch (dir) {
    case 'LONG': return 'bg-green-900/60 text-green-400'
    case 'SHORT': return 'bg-red-900/60 text-red-400'
    default: return 'bg-gray-800 text-gray-500'
  }
}

export function typeBadge(type: string): string {
  switch (type?.toUpperCase()) {
    case 'FAST': return 'bg-blue-900 text-blue-300'
    case 'SLOW': return 'bg-purple-900 text-purple-300'
    default: return 'bg-gray-800 text-gray-500'
  }
}

export function scoreColor(score: number): string {
  if (score > 0) return 'text-green-400'
  if (score < 0) return 'text-red-400'
  return 'text-gray-400'
}

export function accColor(pct: number | null | undefined): string {
  if (pct == null) return 'text-gray-100'
  if (pct > 50) return 'text-green-400'
  if (pct >= 30) return 'text-amber-400'
  return 'text-red-400'
}

export function pnlColor(pnl: number | null | undefined): string {
  if (pnl == null) return 'text-gray-300'
  if (pnl > 0) return 'text-green-400'
  if (pnl < 0) return 'text-red-400'
  return 'text-gray-300'
}

export function pnlStr(pnl: number | null | undefined): string {
  if (pnl == null) return '—'
  return `${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%`
}

export function formatTs(ts: string): string {
  if (isNaN(new Date(ts).getTime())) return ts
  return formatDateTime(ts)
}

export function formatPrice(p: number | null | undefined): string {
  if (p == null) return '—'
  if (p >= 1) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `$${p.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
}

export function stripUsdt(sym: string): string {
  return sym.replace(/\/USDT$/, '').replace(/USDT$/, '')
}

export function parseRawJson(rawJson?: string): { stop_loss: number | null; take_profit: number | null } {
  if (!rawJson) return { stop_loss: null, take_profit: null }
  try {
    const p = JSON.parse(rawJson)
    return {
      stop_loss: p.suggested_stop_loss ?? null,
      take_profit: p.suggested_take_profit ?? null,
    }
  } catch {
    return { stop_loss: null, take_profit: null }
  }
}
