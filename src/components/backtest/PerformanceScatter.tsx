import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
  ZAxis,
} from 'recharts'
import type { BacktestSummary } from '../../types/backtest'
import { CONFIG_COLORS } from './SummaryCard'

interface PerformanceScatterProps {
  summary: BacktestSummary[]
  configs: Record<string, { weights: Record<string, number>; description: string }>
}

function pct(v: number | undefined | null, decimals = 1): string {
  return `${(v ?? 0).toFixed(decimals)}%`
}

function dotSize(trades: number): number {
  return Math.min(120, Math.max(40, trades))
}

export default function PerformanceScatter({ summary, configs }: PerformanceScatterProps) {
  // Group data by config for separate Scatter elements (each gets its own color)
  const configNames = [...new Set(summary.map((s) => s.config))]

  const dataByConfig = configNames.map((name) => ({
    name,
    description: configs[name]?.description ?? name,
    color: CONFIG_COLORS[name] ?? '#9ca3af',
    data: summary
      .filter((s) => s.config === name)
      .map((s) => ({
        x: s.win_rate_pct,
        y: s.total_pnl_pct,
        z: dotSize(s.total_trades),
        config: s.config,
        description: configs[name]?.description ?? name,
        sharpe: s.sharpe,
        maxDD: s.max_drawdown_pct,
        trades: s.total_trades,
      })),
  }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Performance Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="x"
            name="Win Rate"
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            label={{ value: 'Win Rate %', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Total PnL"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            label={{ value: 'Total PnL %', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          />
          <ZAxis type="number" dataKey="z" range={[40, 120]} />
          <ReferenceLine x={50} stroke="#6b7280" strokeDasharray="3 3" />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as {
                config: string
                description: string
                x: number
                y: number
                sharpe: number
                maxDD: number
                trades: number
              }
              return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs shadow-lg">
                  <p className="font-semibold text-gray-100 mb-1">{d.config}</p>
                  <p className="text-gray-400 mb-2">{d.description}</p>
                  <p className="text-gray-300">Win Rate: {pct(d.x)}</p>
                  <p className="text-gray-300">PnL: {pct(d.y, 2)}</p>
                  <p className="text-gray-300">Sharpe: {d.sharpe.toFixed(2)}</p>
                  <p className="text-gray-300">Max DD: {pct(d.maxDD)}</p>
                  <p className="text-gray-300">Trades: {d.trades}</p>
                </div>
              )
            }}
          />
          <Legend
            formatter={(value: unknown) => (
              <span className="text-gray-300 text-xs">{String(value ?? '')}</span>
            )}
          />
          {dataByConfig.map((cfg) => (
            <Scatter
              key={cfg.name}
              name={cfg.name}
              data={cfg.data}
              fill={cfg.color}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
