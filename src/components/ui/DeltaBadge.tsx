interface DeltaBadgeProps {
  current: number
  previous: number
  format: 'percent' | 'number'
  invertColor?: boolean
}

export default function DeltaBadge({ current, previous, format, invertColor = false }: DeltaBadgeProps) {
  if (previous === 0 && current === 0) {
    return <span className="text-xs text-gray-500">→ 0{format === 'percent' ? '%' : ''}</span>
  }

  const diff = previous === 0 ? 100 : ((current - previous) / Math.abs(previous)) * 100
  const rounded = Math.abs(diff) < 0.05 ? 0 : diff

  const isPositive = rounded > 0
  const isNeutral = rounded === 0
  const absChange = Math.abs(rounded)
  const isPulsing = absChange > 15

  const suffix = format === 'percent' ? 'pp' : '%'
  const label = format === 'percent'
    ? `${isPositive ? '+' : ''}${(current - previous).toFixed(1)}${suffix}`
    : `${isPositive ? '+' : ''}${rounded.toFixed(1)}${suffix}`

  if (isNeutral) {
    return <span className="text-xs text-gray-500">→ 0{suffix}</span>
  }

  const greenClass = 'text-green-400'
  const redClass = 'text-red-400'
  const upColor = invertColor ? redClass : greenClass
  const downColor = invertColor ? greenClass : redClass
  const colorClass = isPositive ? upColor : downColor
  const arrow = isPositive ? '▲' : '▼'

  return (
    <span className={`text-xs font-medium ${colorClass} inline-flex items-center gap-0.5`}>
      {isPulsing && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${isPositive ? (invertColor ? 'bg-red-400' : 'bg-green-400') : (invertColor ? 'bg-green-400' : 'bg-red-400')}`} />
      )}
      {arrow}{label}
    </span>
  )
}
