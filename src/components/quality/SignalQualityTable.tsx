import type { SignalQualitySymbol } from '../../types'

export default function SignalQualityTable({
  data,
  hours,
  onHoursChange,
}: {
  data: SignalQualitySymbol[]
  hours: number
  onHoursChange: (h: number) => void
}) {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-200">Signal Quality</h2>
        <div className="flex gap-1">
          {[1, 6, 24].map((h) => (
            <button
              key={h}
              onClick={() => onHoursChange(h)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                hours === h
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              {['Symbol', 'Long', 'Short', 'Hold', 'Total', 'Actionable Rate'].map((h) => (
                <th
                  key={h}
                  className={`py-2 px-3 font-semibold uppercase tracking-wider ${
                    h === 'Symbol' ? 'text-left' : 'text-right'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-600">
                  No data
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const total = row.long + row.short + row.hold
                const actionableRate = total ? ((row.long + row.short) / total) * 100 : 0
                return (
                  <tr
                    key={row.symbol}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-gray-200">
                      {row.symbol.replace('/USDT', '')}
                    </td>
                    <td className="py-2 px-3 text-right text-green-400">{row.long}</td>
                    <td className="py-2 px-3 text-right text-red-400">{row.short}</td>
                    <td className="py-2 px-3 text-right text-gray-400">{row.hold}</td>
                    <td className="py-2 px-3 text-right text-gray-300">{total}</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-300">
                      {actionableRate.toFixed(1)}%
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
