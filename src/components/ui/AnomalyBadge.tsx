interface AnomalyBadgeProps {
  level: 'warning' | 'critical'
  message: string
}

export default function AnomalyBadge({ level, message }: AnomalyBadgeProps) {
  const isWarning = level === 'warning'
  const borderClass = isWarning ? 'border-yellow-500/60' : 'border-red-500/60'
  const bgClass = isWarning ? 'bg-yellow-500/10' : 'bg-red-500/10'
  const textClass = isWarning ? 'text-yellow-400' : 'text-red-400'
  const icon = isWarning ? '⚠️' : '🔴'

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border ${borderClass} ${bgClass} ${textClass}`}>
      <span>{icon}</span>
      {message}
    </span>
  )
}
