interface EmptyStateProps {
  message?: string
  icon?: string
}

export default function EmptyState({ message = 'No data available', icon = '📭' }: EmptyStateProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 flex flex-col items-center justify-center gap-2">
      <span className="text-2xl">{icon}</span>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}
