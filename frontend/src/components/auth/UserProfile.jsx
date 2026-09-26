import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useCart } from '../cart/CartContext'

export default function UserProfile() {
  const { usuario, nombreUsuario, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [cerrandoSesion, setCerrandoSesion] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  const handleLogout = async () => {
    setCerrandoSesion(true)
    await logout()
    setCerrandoSesion(false)
    navigate('/')
  }

  if (!usuario) return null

  // Inicial del nombre para el avatar
  const inicial = nombreUsuario.charAt(0).toUpperCase()

  return (
    <div className="relative">
      {/* Botón avatar */}
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="Menú de usuario"
      >
        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
          {inicial}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
          {nombreUsuario}
        </span>
        <span className="text-gray-400 text-xs">{menuAbierto ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {menuAbierto && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          {/* Info usuario */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 truncate">{nombreUsuario}</p>
            <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
          </div>

          {/* Links */}
          <ul className="py-1">
            <li>
              <button
                onClick={() => { navigate('/carrito'); setMenuAbierto(false) }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex justify-between items-center"
              >
                <span>🛒 Mi carrito</span>
                {totalItems > 0 && (
                  <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => { navigate('/pedidos'); setMenuAbierto(false) }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                📦 Mis pedidos
              </button>
            </li>
          </ul>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              disabled={cerrandoSesion}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {cerrandoSesion ? 'Cerrando sesión...' : '🚪 Cerrar sesión'}
            </button>
          </div>
        </div>
      )}

      {/* Cerrar dropdown al hacer click fuera */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuAbierto(false)}
        />
      )}
    </div>
  )
}
