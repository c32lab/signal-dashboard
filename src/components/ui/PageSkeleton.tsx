import SectionSkeleton from './SectionSkeleton'

interface PageSkeletonProps {
  sections?: number
}

export default function PageSkeleton({ sections = 4 }: PageSkeletonProps) {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-pulse">
      {Array.from({ length: sections }, (_, i) => (
        <SectionSkeleton key={i} height={i === 0 ? 'h-24' : 'h-40'} />
      ))}
    </div>
  )
}
