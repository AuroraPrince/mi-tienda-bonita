import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider, useAuth } from './components/auth/AuthContext'
import { CartProvider } from './components/cart/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import './index.css'

// CartProvider necesita el userId del usuario autenticado.
// Este wrapper intermedio lo obtiene del AuthContext.
function CartProviderConAuth({ children }) {
  const { userId } = useAuth()
  return <CartProvider userId={userId}>{children}</CartProvider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProviderConAuth>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </CartProviderConAuth>
    </AuthProvider>
  </React.StrictMode>,
)
