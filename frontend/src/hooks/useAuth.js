import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Hook para consumir el AuthContext.
 *
 * Uso:
 *   const { usuario, estaAutenticado, login, logout, registro } = useAuth()
 *
 * Retorna:
 *   - usuario          → objeto de usuario de Supabase (o null)
 *   - userId           → string con el UUID del usuario (o null)
 *   - nombreUsuario    → nombre o email del usuario
 *   - estaAutenticado  → boolean
 *   - cargando         → true mientras verifica la sesión al iniciar
 *   - error            → último mensaje de error de auth (o null)
 *   - login({ email, password })          → Promise<{ ok, mensaje? }>
 *   - registro({ email, password, nombre }) → Promise<{ ok, confirmarEmail?, mensaje? }>
 *   - logout()                            → Promise<void>
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
