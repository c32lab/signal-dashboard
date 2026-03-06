export function DirectionBadge({ direction }: { direction: string }) {
  const isLong = direction?.toUpperCase() === 'LONG'
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${
        isLong ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
      }`}
    >
      {direction}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-blue-900 text-blue-300',
    completed: 'bg-green-900 text-green-300',
    expired: 'bg-gray-700 text-gray-400',
    failed: 'bg-red-900 text-red-300',
  }
  const cls = map[status?.toLowerCase()] ?? 'bg-gray-700 text-gray-400'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${cls}`}>
      {status}
    </span>
  )
}
