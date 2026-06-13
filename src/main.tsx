import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './app/router'
import { AppProviders } from './features/shared/providers/AppProviders'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <Router/>
    </AppProviders>
  </StrictMode>,
)
