import { createContext, useState, useEffect, useContext } from 'react'
import {
  iniciarSesion,
  registrar,
  cerrarSesion,
  obtenerSesion,
  escucharSesion,
} from '../../services/auth.service'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null)   // objeto de usuario de Supabase
  const [cargando, setCargando] = useState(true)    // true mientras verifica la sesión
  const [error, setError]       = useState(null)

  // ── Verificar sesión activa al montar ──────────────────────────────────────
  useEffect(() => {
    obtenerSesion()
      .then((sesion) => setUsuario(sesion?.user ?? null))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))

    // Escuchar cambios en tiempo real (login, logout, refresh de token)
    const subscription = escucharSesion((sesion) => {
      setUsuario(sesion?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    try {
      setError(null)
      const data = await iniciarSesion({ email, password })
      setUsuario(data.user)
      return { ok: true }
    } catch (err) {
      setError(err.message)
      return { ok: false, mensaje: err.message }
    }
  }

  // ── Registro ───────────────────────────────────────────────────────────────
  const registro = async ({ email, password, nombre }) => {
    try {
      setError(null)
      const data = await registrar({ email, password, nombre })
      // Supabase puede requerir confirmación por email
      if (data.user && !data.session) {
        return { ok: true, confirmarEmail: true }
      }
      setUsuario(data.user)
      return { ok: true, confirmarEmail: false }
    } catch (err) {
      setError(err.message)
      return { ok: false, mensaje: err.message }
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await cerrarSesion()
      setUsuario(null)
    } catch (err) {
      setError(err.message)
    }
  }

  // Datos derivados
  const estaAutenticado = !!usuario
  const userId          = usuario?.id ?? null
  const nombreUsuario   = usuario?.user_metadata?.nombre ?? usuario?.email ?? ''

  return (
    <AuthContext.Provider
      value={{
        usuario,
        userId,
        nombreUsuario,
        estaAutenticado,
        cargando,
        error,
        login,
        registro,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook directo para consumir el contexto
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
