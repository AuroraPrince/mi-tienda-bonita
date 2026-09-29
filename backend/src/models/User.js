// ─── User.js ──────────────────────────────────────────────────────────────────
// Model de Usuario.
// Supabase maneja la autenticación (auth.users), este model trabaja con la tabla
// pública "profiles" que extiende al usuario con datos del negocio.
//
// Estructura esperada en Supabase:
// tabla: profiles
//   id          uuid  PK (mismo id que auth.users)
//   nombre      text
//   email       text  unique
//   rol         text  default 'cliente'  → 'cliente' | 'admin'
//   telefono    text  nullable
//   direccion   text  nullable
//   ciudad      text  nullable
//   created_at  timestamptz  default now()
//   updated_at  timestamptz  default now()
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from '../config/supabase.js'
import { limpiarObjeto } from '../utils/helpers.js'

// Nombre de la tabla en Supabase
const TABLA = 'profiles'

// ── Roles válidos ─────────────────────────────────────────────────────────────
export const ROLES = Object.freeze({
  CLIENTE: 'cliente',
  ADMIN:   'admin',
})

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene el perfil de un usuario por su ID.
 * @param {string} id - UUID del usuario
 */
export const obtenerPerfilPorId = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Obtiene un usuario por su email.
 * @param {string} email
 */
export const obtenerPerfilPorEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Lista todos los usuarios (solo admin).
 * @param {object} opciones
 * @param {number} [opciones.pagina]
 * @param {number} [opciones.limite]
 * @param {string} [opciones.rol]
 */
export const listarUsuarios = async ({ pagina = 1, limite = 20, rol } = {}) => {
  const desde = (pagina - 1) * limite
  const hasta = desde + limite - 1

  let query = supabaseAdmin
    .from(TABLA)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(desde, hasta)

  if (rol) query = query.eq('rol', rol)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    usuarios: data,
    total: count ?? 0,
    totalPaginas: Math.ceil((count ?? 0) / limite),
    pagina,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ESCRITURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea el perfil público del usuario justo después del registro en Supabase Auth.
 * @param {object} datos
 * @param {string} datos.id     - UUID proveniente de auth.users
 * @param {string} datos.nombre
 * @param {string} datos.email
 * @param {string} [datos.rol]
 */
export const crearPerfil = async ({ id, nombre, email, rol = ROLES.CLIENTE }) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .insert({ id, nombre, email: email.toLowerCase(), rol })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Actualiza campos del perfil de forma parcial.
 * @param {string} id
 * @param {object} campos - Solo los campos a actualizar
 */
export const actualizarPerfil = async (id, campos) => {
  const datos = limpiarObjeto({
    ...campos,
    updated_at: new Date().toISOString(),
  })

  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .update(datos)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Cambia el rol de un usuario (solo admin puede hacer esto).
 * @param {string} id
 * @param {string} nuevoRol - 'cliente' | 'admin'
 */
export const cambiarRol = async (id, nuevoRol) => {
  if (!Object.values(ROLES).includes(nuevoRol)) {
    throw new Error(`Rol inválido: ${nuevoRol}`)
  }
  return actualizarPerfil(id, { rol: nuevoRol })
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifica si un usuario tiene rol de admin.
 * @param {object} usuario - Objeto perfil con campo 'rol'
 */
export const esAdmin = (usuario) => usuario?.rol === ROLES.ADMIN

/**
 * Sanitiza el perfil para enviarlo al cliente (elimina campos sensibles).
 * @param {object} perfil
 */
export const sanitizarPerfil = (perfil) => {
  if (!perfil) return null
  // eslint-disable-next-line no-unused-vars
  const { updated_at, ...publico } = perfil
  return publico
}
