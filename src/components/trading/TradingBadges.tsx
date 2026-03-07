export function SideBadge({ side }: { side: 'LONG' | 'SHORT' }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        side === 'LONG' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
      }`}
    >
      {side}
    </span>
  )
}

export function StatusBadge({ status }: { status: 'open' | 'closed' }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
      status === 'open' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'
    }`}>
      {status === 'open' ? '开仓中' : '已平仓'}
    </span>
  )
}

export function PnlText({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-500">—</span>
  const color = value >= 0 ? 'text-green-400' : 'text-red-400'
  const prefix = value >= 0 ? '+' : ''
  return <span className={color}>{prefix}{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
}
