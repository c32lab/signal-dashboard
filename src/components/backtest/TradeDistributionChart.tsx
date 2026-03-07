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
import type { BacktestSummary } from '../../types/backtest'

interface TradeDistributionChartProps {
  summary: BacktestSummary[]
}

export default function TradeDistributionChart({ summary }: TradeDistributionChartProps) {
  const chartData = summary.map((s) => ({
    config: s.config,
    win_rate: s.win_rate_pct,
    pnl: s.total_pnl_pct,
  }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Trade Distribution</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="config"
            tick={{ fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => `${(v ?? 0).toFixed(0)}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
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
              String(name ?? '') === 'win_rate' ? 'Win Rate' : 'PnL%',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
            formatter={(value: unknown) => (String(value ?? '') === 'win_rate' ? 'Win Rate' : 'Total PnL%')}
          />
          <Bar yAxisId="left" dataKey="win_rate" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="pnl" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
