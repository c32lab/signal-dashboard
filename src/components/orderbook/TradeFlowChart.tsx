import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { mockTradeFlow } from './mockData'
import { useOrderbookFlow } from '../../hooks/useApi'
import { apiFlowToDisplayPoint } from './types'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

export default function TradeFlowChart() {
  const { data: liveData, error } = useOrderbookFlow('BTCUSDT')
  const isLive = liveData && !error

  const chartData = mockTradeFlow.map((p) => ({
    time: formatTime(p.timestamp),
    buy_volume: p.buy_volume,
    sell_volume: p.sell_volume,
    imbalance: p.imbalance,
  }))

  const livePoint = isLive ? apiFlowToDisplayPoint(liveData) : null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Trade Flow (1min)</h3>
        {isLive ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-800/50">
            LIVE
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-500 border border-yellow-800/50">
            MOCK
          </span>
        )}
      </div>

      {livePoint && (
        <div className="flex gap-4 mb-3 text-xs">
          <span className="text-green-400">Buy {formatUsd(livePoint.buy_volume)}</span>
          <span className="text-red-400">Sell {formatUsd(livePoint.sell_volume)}</span>
          <span className="text-blue-400">Imbalance {livePoint.imbalance.toFixed(3)}</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            interval={9}
            tickLine={false}
          />
          <YAxis
            yAxisId="volume"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickFormatter={formatUsd}
            tickLine={false}
            axisLine={false}
            width={55}
          />
          <YAxis
            yAxisId="imbalance"
            orientation="right"
            domain={[-1, 1]}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#D1D5DB' }}
            formatter={(value, name) => {
              const v = Number(value)
              if (name === 'imbalance') return [v.toFixed(3), 'Imbalance']
              return [formatUsd(v), name === 'buy_volume' ? 'Buy Volume' : 'Sell Volume']
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }}
            formatter={(value: string) => {
              if (value === 'buy_volume') return 'Buy'
              if (value === 'sell_volume') return 'Sell'
              return 'Imbalance'
            }}
          />
          <Bar yAxisId="volume" dataKey="buy_volume" stackId="vol" fill="#22C55E" fillOpacity={0.7} />
          <Bar yAxisId="volume" dataKey="sell_volume" stackId="vol" fill="#EF4444" fillOpacity={0.7} />
          <Line
            yAxisId="imbalance"
            dataKey="imbalance"
            stroke="#60A5FA"
            strokeWidth={1.5}
            dot={false}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
