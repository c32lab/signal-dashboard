import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { SymbolBacktest, BacktestConfig } from '../../types/backtest'
import { CONFIG_COLORS } from './configColors'

interface WinRateCompareChartProps {
  bySymbol: Record<string, SymbolBacktest[]>
  configs: Record<string, BacktestConfig>
}

export default function WinRateCompareChart({ bySymbol, configs }: WinRateCompareChartProps) {
  const configNames = Object.keys(configs)
  const symbols = Object.keys(bySymbol).sort()

  const chartData = symbols.map((sym) => {
    const row: Record<string, string | number> = { symbol: sym }
    const rows = bySymbol[sym] ?? []
    for (const r of rows) {
      row[r.config] = r.win_rate_pct
    }
    return row
  })

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Win Rate by Symbol</h2>
      <ResponsiveContainer width="100%" height={Math.max(260, symbols.length * 28)}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="symbol"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(v: number) => `${(v ?? 0).toFixed(0)}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={48}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af', fontSize: 11 }}
            itemStyle={{ fontSize: 12 }}
            formatter={(value: unknown, name: unknown) => [
              `${Number(value ?? 0).toFixed(1)}%`,
              String(name ?? ''),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
            formatter={(value: unknown) => {
              const name = String(value ?? '')
              const desc = configs[name]?.description
              return desc ? `${name} — ${desc}` : name
            }}
          />
          {configNames.map((c) => (
            <Bar
              key={c}
              dataKey={c}
              fill={CONFIG_COLORS[c] ?? '#9ca3af'}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
