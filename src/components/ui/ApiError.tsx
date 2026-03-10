interface ApiErrorProps {
  message?: string
  onRetry?: () => void
}

export default function ApiError({ message = 'Failed to load data', onRetry }: ApiErrorProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-red-800/50 p-6 flex flex-col items-center justify-center gap-3">
      <p className="text-red-400 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-xs font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
