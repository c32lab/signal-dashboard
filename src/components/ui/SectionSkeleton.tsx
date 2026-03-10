interface SectionSkeletonProps {
  height?: string
  label?: string
}

export default function SectionSkeleton({ height = 'h-32', label }: SectionSkeletonProps) {
  return (
    <div
      className={`bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm animate-pulse ${height}`}
    >
      {label ? `Loading ${label}…` : 'Loading…'}
    </div>
  )
}
