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
  const config: Record<string, { label: string; cls: string }> = {
    active:     { label: '🟢 监控中', cls: 'bg-blue-900 text-blue-300' },
    validating: { label: '🔄 验证中', cls: 'bg-yellow-900 text-yellow-300' },
    validated:  { label: '✅ 已验证', cls: 'bg-green-900 text-green-300' },
    expired:    { label: '⏰ 已过期', cls: 'bg-gray-700 text-gray-400' },
    completed:  { label: '✅ 已完成', cls: 'bg-green-900 text-green-300' },
    failed:     { label: '❌ 失败', cls: 'bg-red-900 text-red-300' },
  }
  const c = config[status?.toLowerCase()] ?? { label: status, cls: 'bg-gray-700 text-gray-400' }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.cls}`} title={status}>
      {c.label}
    </span>
  )
}
