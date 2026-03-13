import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { SWRConfig } from 'swr'
import ErrorBoundary from './components/ErrorBoundary'
import { fetchDynamicPriceRanges } from './utils/dataValidation'
import { SymbolsProvider } from './hooks/useSymbols'
import NavBar from './components/layout/NavBar'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const QualityTracker = lazy(() => import('./pages/QualityTracker'))
const TraderHistory = lazy(() => import('./pages/TraderHistory'))
const CodeQuality = lazy(() => import('./pages/CodeQuality'))
const BacktestDashboard = lazy(() => import('./pages/BacktestDashboard'))
const SystemHealthPage = lazy(() => import('./pages/SystemHealthPage'))
const TradingDashboard = lazy(() => import('./pages/TradingDashboard'))
const SignalTimeline = lazy(() => import('./pages/SignalTimeline'))

// Derive BrowserRouter basename from <base href> (set by Vite's `base: './'`).
// "/signal/" → "/signal", "/" → ""
function getBasename(): string {
  try {
    return new URL(document.baseURI).pathname.replace(/\/+$/, '')
  } catch {
    return ''
  }
}

const APP_BASENAME = getBasename()

function App() {
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
    <BrowserRouter basename={APP_BASENAME}>
    <SymbolsProvider>
      <div className="bg-gray-950 text-gray-100 min-h-screen">
        <NavBar />
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
              Loading…
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/quality" element={<QualityTracker />} />
              <Route path="/history" element={<TraderHistory />} />
              <Route path="/backtest" element={<BacktestDashboard />} />
              <Route path="/code-quality" element={<CodeQuality />} />
              <Route path="/advanced/system" element={<SystemHealthPage />} />
              <Route path="/trading" element={<TradingDashboard />} />
              <Route path="/timeline" element={<SignalTimeline />} />
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
