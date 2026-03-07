import { useEffect, useState, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { NavGroup } from './navTypes'

export default function DesktopDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const isAnyChildActive = group.items.some((item) =>
    location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 text-sm transition-colors ${
          isAnyChildActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        {group.label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-1 z-50 min-w-[8rem]">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm rounded transition-colors ${
                  isActive
                    ? 'text-blue-400 font-bold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
