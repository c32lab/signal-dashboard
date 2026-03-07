import {
  BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer,
} from 'recharts'

interface TradeStatsProps {
  totalCount: number
  openCount: number
  closedCount: number
  winRate: number
  longCount: number
  shortCount: number
}

export default function TradeStats({ totalCount, openCount, closedCount, winRate, longCount, shortCount }: TradeStatsProps) {
  const sideDistData = [
    { name: 'LONG', count: longCount },
    { name: 'SHORT', count: shortCount },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Trade Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs">Total Trades</p>
          <p className="text-gray-100 text-xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs">Open</p>
          <p className="text-gray-100 text-xl font-bold">{openCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs">Closed</p>
          <p className="text-gray-100 text-xl font-bold">{closedCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs">Win Rate</p>
          <p className={`text-xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {winRate.toFixed(1)}%
          </p>
          {closedCount > 0 && closedCount < 10 && (
            <p className="text-xs text-yellow-500 mt-1">⚠ Small sample, high variance</p>
          )}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs">LONG %</p>
          <p className="text-green-400 text-xl font-bold">
            {totalCount === 0 ? '0.0' : (longCount / totalCount * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs">SHORT %</p>
          <p className="text-red-400 text-xl font-bold">
            {totalCount === 0 ? '0.0' : (shortCount / totalCount * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* LONG/SHORT Distribution Bar Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-500 text-xs mb-2">LONG / SHORT Distribution</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={sideDistData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 50 }}>
            <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Bar dataKey="count" barSize={20}>
              {sideDistData.map((entry, idx) => (
                <Cell key={idx} fill={entry.name === 'LONG' ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
