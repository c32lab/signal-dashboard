interface TradePaginationProps {
  rangeStart: number
  rangeEnd: number
  total: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

export default function TradePagination({
  rangeStart,
  rangeEnd,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: TradePaginationProps) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-400">
      <span>{rangeStart}-{rangeEnd} of {total}</span>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-40 hover:bg-gray-700 transition-colors"
        >
          Prev
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-40 hover:bg-gray-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
