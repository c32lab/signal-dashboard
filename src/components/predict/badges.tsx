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
  const config: Record<string, { label: string; cls: string; tip: string }> = {
    active:     { label: '🟢 监控中', cls: 'bg-blue-900 text-blue-300', tip: '预测已发出，等待市场验证' },
    validating: { label: '🔄 验证中', cls: 'bg-yellow-900 text-yellow-300', tip: '1d 验证完成，等待 3d/7d 验证' },
    validated:  { label: '✅ 已验证', cls: 'bg-green-900 text-green-300', tip: '全部时间窗口验证完成' },
    expired:    { label: '⏰ 已过期', cls: 'bg-gray-700 text-gray-400', tip: '超过验证窗口未触发' },
    completed:  { label: '✅ 已完成', cls: 'bg-green-900 text-green-300', tip: '预测流程已完成' },
    failed:     { label: '❌ 失败', cls: 'bg-red-900 text-red-300', tip: '预测未命中' },
  }
  const c = config[status?.toLowerCase()] ?? { label: status, cls: 'bg-gray-700 text-gray-400', tip: status }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.cls}`} title={c.tip}>
      {c.label}
    </span>
  )
}
