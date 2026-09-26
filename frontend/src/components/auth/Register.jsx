import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function Register() {
  const { registro } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmar: '',
  })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [confirmacionEmail, setConfirmacionEmail] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrores((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const validar = () => {
    const nuevosErrores = {}
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.'
    if (!form.email)          nuevosErrores.email = 'El correo es obligatorio.'
    if (form.password.length < 6)
      nuevosErrores.password = 'Mínimo 6 caracteres.'
    if (form.password !== form.confirmar)
      nuevosErrores.confirmar = 'Las contraseñas no coinciden.'
    return nuevosErrores
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nuevosErrores = validar()
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setEnviando(true)
    const resultado = await registro({
      email: form.email,
      password: form.password,
      nombre: form.nombre,
    })
    setEnviando(false)

    if (resultado.ok && resultado.confirmarEmail) {
      setConfirmacionEmail(true)
    } else if (resultado.ok) {
      navigate('/', { replace: true })
    } else {
      setErrores({ global: resultado.mensaje ?? 'Error al registrarse.' })
    }
  }

  // Pantalla de confirmación de email
  if (confirmacionEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
          <span className="text-5xl">📧</span>
          <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">
            Revisa tu correo
          </h2>
          <p className="text-gray-500 text-sm">
            Te enviamos un enlace de confirmación a{' '}
            <span className="font-semibold text-gray-700">{form.email}</span>.
            Haz clic en el enlace para activar tu cuenta.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 text-green-600 font-medium hover:underline text-sm"
          >
            Ir al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <span className="text-4xl">⚽</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Crear cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">Regístrate para empezar a comprar</p>
        </div>

        {/* Error global */}
        {errores.global && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
            {errores.global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-600 mb-1">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              autoComplete="name"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                errores.nombre ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
          </div>

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
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                errores.email ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errores.email && <p className="text-red-500 text-xs mt-1">{errores.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                errores.password ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errores.password && <p className="text-red-500 text-xs mt-1">{errores.password}</p>}
          </div>

          {/* Confirmar password */}
          <div>
            <label htmlFor="confirmar" className="block text-sm font-medium text-gray-600 mb-1">
              Confirmar contraseña
            </label>
            <input
              id="confirmar"
              type="password"
              name="confirmar"
              value={form.confirmar}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                errores.confirmar ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errores.confirmar && <p className="text-red-500 text-xs mt-1">{errores.confirmar}</p>}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Link a login */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
