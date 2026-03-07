import { useState } from 'react'
import type { BacktestConfig } from '../../types/backtest'

interface Props {
  configs: Record<string, BacktestConfig>
}

export default function ConfigWeightsDetail({ configs }: Props) {
  const [open, setOpen] = useState(false)
  const configNames = Object.keys(configs)

  if (configNames.length === 0) return null

  // Collect all unique weight keys across configs
  const allKeys = Array.from(
    new Set(configNames.flatMap((name) => Object.keys(configs[name]?.weights ?? {})))
  ).sort()

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:bg-gray-800/50"
      >
        <span className="font-medium">Config Weights Detail</span>
        <span className="text-gray-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-sm text-gray-200 border border-gray-800">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-3 py-2 text-left border-b border-gray-800 text-gray-400">
                  Weight Key
                </th>
                {configNames.map((name) => (
                  <th
                    key={name}
                    className="px-3 py-2 text-right border-b border-gray-800 text-gray-400"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allKeys.map((key) => {
                const values = configNames.map((name) => configs[name]?.weights?.[key])
                const allSame = values.every((v) => v === values[0])

                return (
                  <tr key={key} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-3 py-2 text-gray-400">{key}</td>
                    {configNames.map((name) => {
                      const val = configs[name]?.weights?.[key]
                      return (
                        <td
                          key={name}
                          className={`px-3 py-2 text-right ${
                            allSame ? '' : 'text-amber-400 font-medium'
                          }`}
                        >
                          {val !== undefined ? val : '—'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
