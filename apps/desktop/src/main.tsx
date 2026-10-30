import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@focusflow/app'
import '@focusflow/ui/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
