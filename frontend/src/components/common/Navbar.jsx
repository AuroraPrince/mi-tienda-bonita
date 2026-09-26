import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/productos', label: 'Productos' },
    { to: '/contacto', label: 'Contacto' },
  ]

  return (
    <nav>
      {/* Menú desktop */}
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

        {/* Carrito */}
        <li>
          <Link
            to="/carrito"
            className="relative flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            🛒 <span>Carrito</span>
          </Link>
        </li>
      </ul>

      {/* Botón menú mobile */}
      <button
        className="md:hidden text-gray-700 text-2xl"
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Abrir menú"
      >
        {menuAbierto ? '✕' : '☰'}
      </button>

      {/* Menú mobile desplegable */}
      {menuAbierto && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden z-40">
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
            <li>
              <Link
                to="/carrito"
                onClick={() => setMenuAbierto(false)}
                className="text-gray-700 hover:text-green-600"
              >
                🛒 Carrito
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
