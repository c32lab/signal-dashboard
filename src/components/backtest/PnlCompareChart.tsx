import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { formatDateTime, formatChartTime } from '../../utils/format'
import type { PnlCurvePoint, BacktestConfig } from '../../types/backtest'
import { CONFIG_COLORS } from './configColors'
import PnlChartLegend from './PnlChartLegend'
import { usePnlChartData } from './usePnlChartData'

interface PnlCompareChartProps {
  pnlCurve: Record<string, PnlCurvePoint[]>
  configs: Record<string, BacktestConfig>
}

export default function PnlCompareChart({ pnlCurve, configs }: PnlCompareChartProps) {
  const { configNames, visible, toggle, chartData, visibleConfigs } = usePnlChartData(pnlCurve)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <PnlChartLegend
        configNames={configNames}
        visible={visible}
        onToggle={toggle}
        configs={configs}
      />

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(ts: string) => formatChartTime(ts)}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            minTickGap={60}
          />
          <YAxis
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={52}
          />
          <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af', fontSize: 11 }}
            itemStyle={{ fontSize: 12 }}
            labelFormatter={(ts: unknown) => formatDateTime(String(ts ?? ''))}
            formatter={(value: unknown, name: unknown) => [
              `${Number(value ?? 0).toFixed(2)}%`,
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
          {visibleConfigs.map((c) => (
            <Line
              key={c}
              type="monotone"
              dataKey={c}
              stroke={CONFIG_COLORS[c] ?? '#9ca3af'}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
