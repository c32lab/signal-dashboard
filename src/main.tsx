import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initErrorTracker } from './utils/errorTracker'
import { initPerformanceMonitor } from './utils/performanceMonitor'

initErrorTracker()
initPerformanceMonitor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
