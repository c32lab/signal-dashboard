import { useState } from 'react'

interface DataWarningProps {
  message: string
}

export default function DataWarning({ message }: DataWarningProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-flex items-center ml-1">
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-help text-amber-500 text-xs leading-none select-none"
        aria-label={message}
      >
        ⚠
      </span>
      {visible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-xs px-2 py-1 rounded bg-amber-950 border border-amber-700 text-amber-300 text-[11px] leading-snug whitespace-pre-wrap pointer-events-none shadow-lg">
          {message}
        </span>
      )}
    </span>
  )
}
