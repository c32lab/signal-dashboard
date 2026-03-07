import type { SymbolBacktest } from '../../types/backtest'
import SectionErrorBoundary from '../SectionErrorBoundary'
import SymbolRow from './SymbolRow'

const PAGE_SIZE = 20

interface SymbolTableSectionProps {
  bySymbol: Record<string, SymbolBacktest[]>
  page: number
  onPageChange: (page: number) => void
}

export default function SymbolTableSection({ bySymbol, page, onPageChange }: SymbolTableSectionProps) {
  const symbols = Object.keys(bySymbol).sort()
  const totalPages = Math.max(1, Math.ceil(symbols.length / PAGE_SIZE))
  const pageSymbols = symbols.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (symbols.length === 0) return null

  return (
    <SectionErrorBoundary title="By Symbol">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-300">
          By Symbol
          <span className="ml-2 text-xs text-gray-500 font-normal">
            ({symbols.length} symbols)
          </span>
        </h2>
        {pageSymbols.map((sym) => (
          <SymbolRow key={sym} symbol={sym} rows={bySymbol[sym]} />
        ))}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, symbols.length)} of {symbols.length}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-400 leading-7">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionErrorBoundary>
  )
}
