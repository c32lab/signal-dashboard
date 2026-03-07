import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ENTRIES, isGroup } from './navTypes'
import DesktopDropdown from './DesktopDropdown'
import MobileMenu from './MobileMenu'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-gray-400 text-sm font-semibold tracking-wide md:hidden">
          Signal Dashboard
        </span>
        {/* Desktop nav links */}
        <div className="hidden md:flex gap-4 items-center">
          {NAV_ENTRIES.map((entry) =>
            isGroup(entry) ? (
              <DesktopDropdown key={entry.label} group={entry} />
            ) : (
              <NavLink
                key={entry.to}
                to={entry.to}
                end={entry.end}
                className={({ isActive }) =>
                  isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
                }
              >
                {entry.label}
              </NavLink>
            )
          )}
        </div>
        {/* Hamburger button (mobile only) */}
        <button
          className="md:hidden p-1 text-gray-400 hover:text-gray-200 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      {/* Mobile dropdown menu */}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </nav>
  )
}
