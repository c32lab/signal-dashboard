import { useState } from 'react'
import type { Decision } from '../../types'
import SectionErrorBoundary from '../SectionErrorBoundary'
import DecisionRow from './DecisionRow'

export default function DecisionTable({
  decisions,
  isLoading,
  error,
}: {
  decisions: Decision[]
  isLoading: boolean
  error: unknown
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleToggle(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <SectionErrorBoundary title="Decision Table">
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        {isLoading && (
          <p className="text-gray-400 text-sm p-8 text-center">Loading decisions…</p>
        )}
        {error ? (
          <p className="text-red-400 text-sm p-8 text-center">
            Failed to load decisions: {String((error as Error)?.message ?? error)}
          </p>
        ) : null}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-950 sticky top-0 z-10">
                <tr>
                  {['Time', 'Symbol', 'Action', 'Dir', 'Type', 'Conf', 'Score', 'Price', 'SL', 'TP', 'Reasoning'].map(h => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {decisions.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-12 text-center text-gray-600 text-sm">
                      No decisions found
                    </td>
                  </tr>
                ) : (
                  decisions.map(d => {
                    const id = String(d.id)
                    return (
                      <DecisionRow
                        key={id}
                        d={d}
                        isExpanded={expandedId === id}
                        onToggle={() => handleToggle(id)}
                      />
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SectionErrorBoundary>
  )
}
