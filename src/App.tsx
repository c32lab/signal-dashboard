import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SWRConfig } from 'swr'
import Dashboard from './pages/Dashboard'
import PredictDashboard from './pages/PredictDashboard'
import QualityTracker from './pages/QualityTracker'
import TraderHistory from './pages/TraderHistory'
import CodeQuality from './pages/CodeQuality'
import ErrorBoundary from './components/ErrorBoundary'
import { fetchDynamicPriceRanges } from './utils/dataValidation'

const NAV_LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Signal', end: true },
  { to: '/predict', label: 'Predict' },
  { to: '/quality', label: 'Quality' },
  { to: '/history', label: 'History' },
  { to: '/code-quality', label: 'Code Quality' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Preload dynamic price ranges from data-eng API on app mount
  useEffect(() => { fetchDynamicPriceRanges() }, [])

  return (
    <SWRConfig value={{
      onError: (error, key) => {
        console.error(`[SWR Error] ${key}:`, error.message)
      },
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }}>
    <BrowserRouter>
      <div className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-gray-400 text-sm font-semibold tracking-wide sm:hidden">
              Signal Dashboard
            </span>
            {/* Desktop nav links */}
            <div className="hidden sm:flex gap-4">
              {NAV_LINKS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            {/* Hamburger button (mobile only) */}
            <button
              className="sm:hidden p-1 text-gray-400 hover:text-gray-200 transition-colors"
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
          {menuOpen && (
            <div className="sm:hidden border-t border-gray-800 px-4 pb-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-2 text-sm ${isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<PredictDashboard />} />
            <Route path="/quality" element={<QualityTracker />} />
            <Route path="/history" element={<TraderHistory />} />
            <Route path="/code-quality" element={<CodeQuality />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
    </SWRConfig>
  )
}

export default App
