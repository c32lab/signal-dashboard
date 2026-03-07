import { CONFIG_COLORS } from './SummaryCard'

interface WeightHeatmapProps {
  configs: Record<string, { weights: Record<string, number>; description: string }>
}

export default function WeightHeatmap({ configs }: WeightHeatmapProps) {
  const configNames = Object.keys(configs)
  if (configNames.length === 0) return null

  // Collect all unique weight sources across configs
  const sourceSet = new Set<string>()
  for (const cfg of Object.values(configs)) {
    for (const key of Object.keys(cfg.weights)) {
      sourceSet.add(key)
    }
  }
  const sources = Array.from(sourceSet).sort()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-100">Weight Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs text-gray-400 px-2 py-1">Source</th>
              {configNames.map((name) => {
                const color = CONFIG_COLORS[name] ?? '#9ca3af'
                return (
                  <th key={name} className="text-center text-xs text-gray-400 px-2 py-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                      />
                      {name}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source} className="border-t border-gray-800">
                <td className="text-xs text-gray-300 px-2 py-1.5 whitespace-nowrap">
                  {source}
                </td>
                {configNames.map((name) => {
                  const value = configs[name].weights[source] ?? 0
                  const pct = Math.round(value * 100)
                  const opacity = value > 0 ? Math.max(0.15, value) : 0
                  return (
                    <td key={name} className="text-center px-2 py-1.5">
                      <span
                        className="inline-block w-full rounded px-2 py-0.5 font-mono text-xs text-white"
                        style={{
                          backgroundColor:
                            value > 0
                              ? `rgba(96, 165, 250, ${opacity})`
                              : 'rgba(107, 114, 128, 0.3)',
                        }}
                      >
                        {pct}%
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
