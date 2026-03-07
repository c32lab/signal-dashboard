interface DecisionPaginationProps {
  total: number
  safePage: number
  totalPages: number
  isFiltered: boolean
  onPrev: () => void
  onNext: () => void
}

export default function DecisionPagination({
  total,
  safePage,
  totalPages,
  isFiltered,
  onPrev,
  onNext,
}: DecisionPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
      <span>
        {total} record{total !== 1 ? 's' : ''}
        {isFiltered ? ' (filtered)' : ''}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={safePage === 1}
          className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <span className="px-2">
          {safePage} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={safePage === totalPages}
          className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  )
}
