import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ENTRIES, isGroup } from './navTypes'

export default function MobileMenu({ onClose }: { onClose: () => void }) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <div className="md:hidden border-t border-gray-800 px-4 pb-3 flex flex-col gap-1">
      {NAV_ENTRIES.map((entry) =>
        isGroup(entry) ? (
          <div key={entry.label}>
            <button
              onClick={() => setAdvancedOpen((o) => !o)}
              className="w-full flex items-center justify-between py-2 text-sm text-gray-400 hover:text-gray-200"
            >
              {entry.label}
              <svg
                className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {advancedOpen && (
              <div className="pl-3 flex flex-col gap-1">
                {entry.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => { onClose(); setAdvancedOpen(false) }}
                    className={({ isActive }) =>
                      `py-2 text-sm ${isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ) : (
          <NavLink
            key={entry.to}
            to={entry.to}
            end={entry.end}
            onClick={onClose}
            className={({ isActive }) =>
              `py-2 text-sm ${isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'}`
            }
          >
            {entry.label}
          </NavLink>
        )
      )}
    </div>
  )
}
