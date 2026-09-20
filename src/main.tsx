import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import AuthProvider from '@/context/AuthProvider'
import '@/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No #root element in index.html to mount into.')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      {/* One provider at the root: every page and the NavBar read the same
          auth state, and nothing has to pass `user` down to reach it. */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
