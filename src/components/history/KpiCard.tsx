export default function KpiCard({
  label,
  value,
  color = 'text-gray-100',
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  )
}
