export default function SectionSkeleton({ text }: { text: string }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
      {text}
    </div>
  )
}
