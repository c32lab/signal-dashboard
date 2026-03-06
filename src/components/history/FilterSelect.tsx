export default function FilterSelect({
  value,
  onChange,
  disabled,
  title,
  children,
}: {
  value: string
  onChange?: (v: string) => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      title={title}
      className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </select>
  )
}
