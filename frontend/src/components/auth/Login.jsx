import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function Login() {
  const { login, cargando } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.from ?? '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      setError('Completa todos los campos.')
      return
    }

    setEnviando(true)
    const resultado = await login({ email: form.email, password: form.password })
    setEnviando(false)

    if (resultado.ok) {
      navigate(destino, { replace: true })
    } else {
      setError(resultado.mensaje ?? 'Credenciales incorrectas.')
    }
  }

  if (cargando) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <span className="text-4xl">⚽</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Iniciar sesión</h1>
          <p className="text-gray-400 text-sm mt-1">Bienvenido de nuevo</p>
        </div>

        {/* Error global */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                Contraseña
              </label>
              <Link
                to="/recuperar-password"
                className="text-xs text-green-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Link a registro */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-green-600 font-medium hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
