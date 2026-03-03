import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PredictDashboard from './pages/PredictDashboard'

function App() {
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
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<PredictDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
