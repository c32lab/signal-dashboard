interface PredictAccuracyBadgeProps {
  accuracy: { '1d': number; '3d': number; '7d': number }
}

function accuracyColor(value: number): string {
  if (value >= 60) return 'text-green-400'
  if (value >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

export default function PredictAccuracyBadge({ accuracy }: PredictAccuracyBadgeProps) {
  const horizons = [
    { key: '1d' as const, label: '1d' },
    { key: '3d' as const, label: '3d' },
    { key: '7d' as const, label: '7d' },
  ]

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="font-medium">Predict Accuracy:</span>
      {horizons.map((h, i) => (
        <span key={h.key} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-600">|</span>}
          <span>{h.label}</span>
          <span className={`font-semibold ${accuracyColor(accuracy[h.key])}`}>
            {(accuracy[h.key] ?? 0).toFixed(1)}%
          </span>
        </span>
      ))}
    </div>
  )
}
