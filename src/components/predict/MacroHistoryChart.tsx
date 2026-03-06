import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MacroSnapshot } from '../../types/predict'

export function MacroHistoryChart({ snapshots }: { snapshots: MacroSnapshot[] }) {
  const data = [...snapshots]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((s) => ({
      time: new Date(s.timestamp).toLocaleDateString(),
      macro_score: s.macro_score,
      fear_greed: s.fear_greed,
    }))

  return (
    <div className="h-[200px] sm:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="time"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="macro"
          domain={[0, 10]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <YAxis
          yAxisId="fg"
          orientation="right"
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#e5e7eb' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
        <Line
          yAxisId="macro"
          type="monotone"
          dataKey="macro_score"
          stroke="#60a5fa"
          strokeWidth={2}
          dot={false}
          name="Macro Score"
        />
        <Line
          yAxisId="fg"
          type="monotone"
          dataKey="fear_greed"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          name="Fear & Greed"
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}
