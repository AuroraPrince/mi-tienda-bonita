import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import UserProfile from '../auth/UserProfile'

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { estaAutenticado } = useAuth()
  const { totalItems } = useCart()

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/productos', label: 'Productos' },
    { to: '/contacto', label: 'Contacto' },
  ]

  return (
    <nav className="relative">
      {/* ── Menú desktop ───────────────────────────────────────────────────── */}
      <ul className="hidden md:flex items-center gap-6">
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'text-green-600 font-semibold'
                  : 'text-gray-700 hover:text-green-600 transition-colors'
              }
            >
              {label}
            </NavLink>
          </li>
        ))}

        {/* Carrito con badge */}
        <li>
          <Link
            to="/carrito"
            className="relative flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            🛒 <span>Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </li>

        {/* Login o perfil según estado */}
        <li>
          {estaAutenticado ? (
            <UserProfile />
          ) : (
            <Link
              to="/login"
              className="text-gray-700 hover:text-green-600 font-medium text-sm transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </li>
      </ul>

      {/* ── Botón menú mobile ───────────────────────────────────────────────── */}
      <button
        className="md:hidden text-gray-700 text-2xl"
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Abrir menú"
      >
        {menuAbierto ? '✕' : '☰'}
      </button>

      {/* ── Menú mobile desplegable ─────────────────────────────────────────── */}
      {menuAbierto && (
        <div className="absolute top-full right-0 w-64 bg-white shadow-lg rounded-xl md:hidden z-40 overflow-hidden">
          <ul className="flex flex-col px-4 py-4 gap-4">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setMenuAbierto(false)}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-green-600 font-semibold'
                      : 'text-gray-700 hover:text-green-600'
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}

            {/* Carrito mobile */}
            <li>
              <Link
                to="/carrito"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center justify-between text-gray-700 hover:text-green-600"
              >
                <span>🛒 Carrito</span>
                {totalItems > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>

            {/* Login o logout mobile */}
            <li className="border-t border-gray-100 pt-3">
              {estaAutenticado ? (
                <UserProfile />
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="block text-center bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
