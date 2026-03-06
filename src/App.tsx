import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { SWRConfig } from 'swr'
import ErrorBoundary from './components/ErrorBoundary'
import { fetchDynamicPriceRanges } from './utils/dataValidation'
import { SymbolsProvider } from './hooks/useSymbols'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const PredictDashboard = lazy(() => import('./pages/PredictDashboard'))
const QualityTracker = lazy(() => import('./pages/QualityTracker'))
const TraderHistory = lazy(() => import('./pages/TraderHistory'))
const CodeQuality = lazy(() => import('./pages/CodeQuality'))
const BacktestDashboard = lazy(() => import('./pages/BacktestDashboard'))
const IndustryChainPage = lazy(() => import('./pages/IndustryChainPage'))
const SystemHealthPage = lazy(() => import('./pages/SystemHealthPage'))
const TradingDashboard = lazy(() => import('./pages/TradingDashboard'))

interface NavItem {
  to: string
  label: string
  end?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

type NavEntry = NavItem | NavGroup

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

const NAV_ENTRIES: NavEntry[] = [
  { to: '/', label: '信号概览', end: true },
  { to: '/predict', label: '预测历史' },
  { to: '/backtest', label: '回测对比' },
  { to: '/trading', label: '交易记录' },
  { to: '/history', label: '事件库' },
  {
    label: '高级分析',
    items: [
      { to: '/quality', label: '信号质量' },
      { to: '/advanced/chain', label: '产业链图谱' },
      { to: '/advanced/system', label: '系统健康' },
    ],
  },
]

function DesktopDropdown({ group }: { group: NavGroup }) {
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

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
    <SymbolsProvider>
      <div className="bg-gray-950 text-gray-100 min-h-screen">
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
          {menuOpen && (
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
                            onClick={() => { setMenuOpen(false); setAdvancedOpen(false) }}
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
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `py-2 text-sm ${isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'}`
                    }
                  >
                    {entry.label}
                  </NavLink>
                )
              )}
            </div>
          )}
        </nav>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
              Loading…
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/predict" element={<PredictDashboard />} />
              <Route path="/quality" element={<QualityTracker />} />
              <Route path="/history" element={<TraderHistory />} />
              <Route path="/backtest" element={<BacktestDashboard />} />
              <Route path="/code-quality" element={<CodeQuality />} />
              <Route path="/advanced/chain" element={<IndustryChainPage />} />
              <Route path="/advanced/system" element={<SystemHealthPage />} />
              <Route path="/trading" element={<TradingDashboard />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </SymbolsProvider>
    </BrowserRouter>
    </SWRConfig>
  )
}

export default App
