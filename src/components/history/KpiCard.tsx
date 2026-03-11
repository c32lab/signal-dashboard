import DeltaBadge from '../ui/DeltaBadge'
import AnomalyBadge from '../ui/AnomalyBadge'

interface KpiCardProps {
  label: string
  value: string
  color?: string
  delta?: { current: number; previous: number; format: 'percent' | 'number' }
  anomaly?: { level: 'warning' | 'critical'; message: string }
}

export default function KpiCard({
  label,
  value,
  color = 'text-gray-100',
  delta,
  anomaly,
}: KpiCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold font-mono ${color}`}>{value}</p>
      {delta && (
        <div className="mt-1">
          <DeltaBadge current={delta.current} previous={delta.previous} format={delta.format} />
        </div>
      )}
      {anomaly && (
        <div className="mt-1">
          <AnomalyBadge level={anomaly.level} message={anomaly.message} />
        </div>
      )}
    </div>
  )
}
