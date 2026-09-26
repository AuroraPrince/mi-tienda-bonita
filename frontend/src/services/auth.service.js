import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Registro ────────────────────────────────────────────────────────────────
export const registrar = async ({ email, password, nombre }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre }, // guarda el nombre en el perfil
    },
  })
  if (error) throw error
  return data
}

// ── Login ────────────────────────────────────────────────────────────────────
export const iniciarSesion = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

// ── Cerrar sesión ────────────────────────────────────────────────────────────
export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ── Obtener sesión actual ────────────────────────────────────────────────────
export const obtenerSesion = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// ── Escuchar cambios de sesión (para el contexto) ────────────────────────────
export const escucharSesion = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session)
  )
  return subscription // retorna para poder cancelar en el cleanup
}

// ── Recuperar contraseña ─────────────────────────────────────────────────────
export const recuperarPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export { supabase }
