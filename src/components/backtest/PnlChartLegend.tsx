import type { BacktestConfig } from '../../types/backtest'
import { CONFIG_COLORS } from './configColors'

interface PnlChartLegendProps {
  configNames: string[]
  visible: Record<string, boolean>
  onToggle: (name: string) => void
  configs: Record<string, BacktestConfig>
}

export default function PnlChartLegend({ configNames, visible, onToggle, configs }: PnlChartLegendProps) {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h2 className="text-sm font-semibold text-gray-300">Cumulative PnL%</h2>
      <div className="flex gap-2 flex-wrap">
        {configNames.map((c) => {
          const color = CONFIG_COLORS[c] ?? '#9ca3af'
          const desc = configs[c]?.description
          return (
            <button
              key={c}
              onClick={() => onToggle(c)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                visible[c]
                  ? 'bg-gray-800 text-gray-200'
                  : 'bg-gray-950 text-gray-600'
              }`}
              title={desc}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: visible[c] ? color : '#4b5563' }}
              />
              {c}
            </button>
          )
        })}
      </div>
    </div>
  )
}
