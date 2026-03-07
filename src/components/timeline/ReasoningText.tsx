import { useState } from 'react'

export default function ReasoningText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 120

  return (
    <div>
      <p className={`text-xs text-gray-400 ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-blue-400 hover:text-blue-300 mt-1"
        >
          {expanded ? '收起' : '展开'}
        </button>
      )}
    </div>
  )
}
