import { useHealth } from '../../hooks/useApi'

export default function ApiStatusIndicator() {
  const { data, error, isLoading } = useHealth()

  const color = isLoading
    ? 'bg-amber-400'
    : error
      ? 'bg-red-500'
      : data
        ? 'bg-green-500'
        : 'bg-gray-500'

  const label = isLoading
    ? 'Connecting…'
    : error
      ? 'API Error'
      : data
        ? 'API Connected'
        : 'Unknown'

  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-gray-500 hidden sm:inline">{label}</span>
    </div>
  )
}
