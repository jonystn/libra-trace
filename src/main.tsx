import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { applyMotionCssVars } from './motion/tokens'
import App from './App'

applyMotionCssVars()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
