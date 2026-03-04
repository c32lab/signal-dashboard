import { useMemo } from 'react'

interface Props {
  timestamp?: Date
}

export default function LastUpdated({ timestamp }: Props) {
  const isStale = useMemo(() => {
    if (!timestamp) return false
    return Date.now() - timestamp.getTime() > 2 * 60 * 1000
  }, [timestamp])

  if (!timestamp) return null

  const timeStr = timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          isStale ? 'bg-yellow-400' : 'bg-green-400'
        }`}
      />
      <span>Last updated: {timeStr}</span>
    </div>
  )
}
