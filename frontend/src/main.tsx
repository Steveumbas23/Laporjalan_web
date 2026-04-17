import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/base.css'
import './css/layout.css'
import './css/components.css'
import './css/pages/landing/hero.css'
import './css/pages/landing/about.css'
import './css/pages/landing/feature.css'
import './css/pages/landing/map.css'
import './css/pages/landing/footer.css'
import './css/pages/dashboard.css'
import './css/pages/auth.css'
import './css/pages/errors.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
