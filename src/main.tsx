import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import AuthProvider from '@/context/AuthProvider'
import CartProvider from '@/context/CartProvider'
import '@/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No #root element in index.html to mount into.')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      {/* Two providers at the root: every page and the NavBar read the same
          auth and cart state, and nothing has to pass `user` or the cart
          down through props to reach them. */}
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
