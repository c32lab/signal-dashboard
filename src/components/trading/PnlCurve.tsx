import { formatChartTime } from '../../utils/format'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface PnlCurveProps {
  data: { time: string; cumPnl: number }[]
}

export default function PnlCurve({ data }: PnlCurveProps) {
  if (data.length === 0) return null

  const lastPnl = data[data.length - 1]?.cumPnl ?? 0
  const pnlColor = lastPnl >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">累计 PnL 曲线</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            tickFormatter={(v: string) => formatChartTime(v)}
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
          />
          <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelFormatter={(label: unknown) => formatChartTime(String(label ?? ''))}
            formatter={(value: unknown) => [`$${Number(value ?? 0).toFixed(2)}`, 'Cumulative PnL']}
          />
          <Area
            type="monotone"
            dataKey="cumPnl"
            stroke={pnlColor}
            fill={pnlColor}
            fillOpacity={0.15}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
