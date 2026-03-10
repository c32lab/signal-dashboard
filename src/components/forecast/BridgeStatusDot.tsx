interface BridgeStatusDotProps {
  status: 'connected' | 'disconnected' | 'degraded'
  lastSync: string
}

const statusConfig = {
  connected: { color: 'bg-green-500', label: 'Connected' },
  degraded: { color: 'bg-yellow-500', label: 'Degraded' },
  disconnected: { color: 'bg-red-500', label: 'Disconnected' },
}

export default function BridgeStatusDot({ status, lastSync }: BridgeStatusDotProps) {
  const config = statusConfig[status]
  const syncTime = new Date(lastSync).toLocaleString()

  return (
    <span className="relative group cursor-help" title={`${config.label} — Last sync: ${syncTime}`}>
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.color}`} />
      <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-800 text-xs text-gray-300 px-3 py-1.5 rounded-lg whitespace-nowrap border border-gray-700 z-10">
        {config.label} — Last sync: {syncTime}
      </span>
    </span>
  )
}
