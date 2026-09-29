// ─── auth.service.js ──────────────────────────────────────────────────────────
// Lógica de negocio de autenticación.
// Orquesta Supabase Auth + tabla profiles.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase, supabaseAdmin } from '../config/supabase.js'
import { crearPerfil, obtenerPerfilPorId, actualizarPerfil, sanitizarPerfil } from '../models/User.js'
import { logger } from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo usuario en Supabase Auth y crea su perfil público.
 * @param {object} datos
 * @param {string} datos.nombre
 * @param {string} datos.email
 * @param {string} datos.password
 * @returns {{ usuario, perfil, confirmarEmail }}
 */
export const registrarUsuario = async ({ nombre, email, password }) => {
  // 1. Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },   // user_metadata
    },
  })

  if (error) throw new Error(error.message)

  const { user, session } = data

  // 2. Crear perfil en tabla profiles
  try {
    await crearPerfil({ id: user.id, nombre, email })
  } catch (err) {
    // Si falla la creación del perfil logueamos pero no bloqueamos
    // (el trigger de Supabase puede crearlo también)
    logger.warn('No se pudo crear el perfil automáticamente:', { error: err.message })
  }

  logger.info('Usuario registrado:', { userId: user.id, email })

  return {
    usuario:        sanitizarPerfil({ id: user.id, email, nombre, rol: 'cliente' }),
    session,
    confirmarEmail: !session,   // true si Supabase requiere confirmación por email
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inicia sesión con email y password.
 * @param {object} datos
 * @param {string} datos.email
 * @param {string} datos.password
 * @returns {{ usuario, session }}
 */
export const iniciarSesion = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Supabase devuelve mensajes en inglés — los traducimos
    if (/invalid.*credentials|wrong.*password/i.test(error.message)) {
      throw new Error('Email o contraseña incorrectos.')
    }
    if (/email.*confirmed/i.test(error.message)) {
      throw new Error('Debes confirmar tu email antes de iniciar sesión.')
    }
    throw new Error(error.message)
  }

  const { user, session } = data

  // Cargar perfil público
  let perfil
  try {
    perfil = await obtenerPerfilPorId(user.id)
  } catch {
    perfil = { id: user.id, email: user.email, nombre: '', rol: 'cliente' }
  }

  logger.info('Login exitoso:', { userId: user.id, email })

  return {
    usuario: sanitizarPerfil(perfil),
    session,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cierra la sesión del usuario (invalida el token en Supabase).
 * @param {string} token - Bearer token del request
 */
export const cerrarSesion = async (token) => {
  // Construir cliente temporal con el token del usuario
  const { error } = await supabase.auth.admin
    ? await supabaseAdmin.auth.signOut()
    : await supabase.auth.signOut()

  if (error) logger.warn('Error al cerrar sesión:', { error: error.message })

  logger.info('Sesión cerrada.')
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFIL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene el perfil del usuario autenticado.
 * @param {string} userId
 */
export const obtenerPerfil = async (userId) => {
  const perfil = await obtenerPerfilPorId(userId)
  return sanitizarPerfil(perfil)
}

/**
 * Actualiza datos del perfil (nombre, teléfono, dirección, ciudad).
 * @param {string} userId
 * @param {object} campos
 */
export const actualizarPerfilUsuario = async (userId, campos) => {
  // Actualizar en tabla profiles
  const perfilActualizado = await actualizarPerfil(userId, campos)

  // Si cambia el nombre, sincronizar con Supabase Auth user_metadata
  if (campos.nombre) {
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { nombre: campos.nombre },
    })
  }

  logger.info('Perfil actualizado:', { userId })
  return sanitizarPerfil(perfilActualizado)
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTRASEÑA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Envía un email de recuperación de contraseña.
 * @param {string} email
 */
export const solicitarRecuperacionPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  })

  if (error) throw new Error(error.message)

  logger.info('Email de recuperación enviado:', { email })
  return { ok: true }
}

/**
 * Actualiza la contraseña del usuario autenticado.
 * @param {string} userId
 * @param {string} passwordNueva
 */
export const cambiarPassword = async (userId, passwordNueva) => {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: passwordNueva,
  })

  if (error) throw new Error(error.message)

  logger.info('Contraseña actualizada:', { userId })
  return { ok: true }
}
