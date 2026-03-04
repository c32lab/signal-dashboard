import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import PredictDashboard from './pages/PredictDashboard'
import QualityTracker from './pages/QualityTracker'
import TraderHistory from './pages/TraderHistory'
import ErrorBoundary from './components/ErrorBoundary'
import { fetchDynamicPriceRanges } from './utils/dataValidation'

function App() {
  // Preload dynamic price ranges from data-eng API on app mount
  useEffect(() => { fetchDynamicPriceRanges() }, [])
  return (
    <BrowserRouter>
      <div className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="flex gap-4 px-6 py-3 bg-gray-900 border-b border-gray-800">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }
          >
            Signal
          </NavLink>
          <NavLink
            to="/predict"
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }
          >
            Predict
          </NavLink>
          <NavLink
            to="/quality"
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }
          >
            Quality
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }
          >
            History
          </NavLink>
        </nav>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<PredictDashboard />} />
            <Route path="/quality" element={<QualityTracker />} />
            <Route path="/history" element={<TraderHistory />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  )
}

export default App
