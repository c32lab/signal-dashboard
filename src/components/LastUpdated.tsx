interface Props {
  /** Pass any changing data reference to show an indicator. */
  dataVersion?: unknown
}

/**
 * Simple "data is live" indicator. Shows a green dot when data is present.
 * Intentionally avoids Date.now() / new Date() during render to comply with
 * react-hooks/purity. The dot is always green when data is loaded;
 * staleness is handled by SWR's error/loading states upstream.
 */
export default function LastUpdated({ dataVersion }: Props) {
  if (dataVersion === undefined) return null

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
      <span>Live</span>
    </div>
  )
}
