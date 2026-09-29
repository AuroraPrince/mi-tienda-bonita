// ─── auth.middleware.js ───────────────────────────────────────────────────────
// Middleware de autenticación y autorización.
// Verifica el JWT emitido por Supabase Auth en el header Authorization.
// Adjunta el usuario autenticado a req.usuario para uso en controllers.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../config/supabase.js'
import { obtenerPerfilPorId } from '../models/User.js'
import { extraerBearerToken } from '../utils/helpers.js'
import { logger } from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICAR TOKEN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifica el Bearer token de Supabase y adjunta el perfil del usuario
 * a req.usuario. Si el token es inválido o ha expirado, devuelve 401.
 */
export const verificarToken = async (req, res, next) => {
  try {
    const token = extraerBearerToken(req.headers.authorization)

    if (!token) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token de autenticación requerido.',
      })
    }

    // Verificar el token con Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token inválido o expirado.',
      })
    }

    // Cargar el perfil público desde la tabla profiles
    let perfil
    try {
      perfil = await obtenerPerfilPorId(user.id)
    } catch {
      // Si el perfil no existe aún (ej: primer login sin perfil creado)
      perfil = {
        id:    user.id,
        email: user.email,
        rol:   'cliente',
      }
    }

    // Adjuntar al request para uso en controllers
    req.usuario = {
      id:     user.id,
      email:  user.email,
      rol:    perfil.rol ?? 'cliente',
      nombre: perfil.nombre ?? user.user_metadata?.nombre ?? '',
      perfil,
    }

    return next()
  } catch (err) {
    logger.error('Error en verificarToken:', { message: err.message })
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno al verificar autenticación.',
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTORIZACIÓN POR ROL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory que genera un middleware de autorización por roles.
 * Debe usarse DESPUÉS de verificarToken.
 *
 * @param {...string} roles - Roles permitidos: 'admin', 'cliente'
 * @example
 *   router.get('/admin/stats', verificarToken, requerirRol('admin'), handler)
 *   router.get('/perfil',      verificarToken, requerirRol('admin', 'cliente'), handler)
 */
export const requerirRol = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'No autenticado.',
      })
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}.`,
      })
    }

    return next()
  }
}

// ── Atajos semánticos ─────────────────────────────────────────────────────────

/** Solo admins */
export const soloAdmin = requerirRol('admin')

/** Admins y clientes (cualquier usuario autenticado) */
export const soloAutenticado = requerirRol('admin', 'cliente')

// ─────────────────────────────────────────────────────────────────────────────
// OPCIONAL (no falla si no hay token)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Igual que verificarToken pero no bloquea si no hay token.
 * Útil en rutas públicas que muestran info extra si el usuario está logueado.
 * Ej: lista de productos (pública) pero con favoritos si está autenticado.
 */
export const tokenOpcional = async (req, res, next) => {
  const token = extraerBearerToken(req.headers.authorization)

  if (!token) {
    req.usuario = null
    return next()
  }

  // Si hay token, intentar verificarlo sin bloquear
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (!error && user) {
      let perfil
      try { perfil = await obtenerPerfilPorId(user.id) } catch { perfil = null }

      req.usuario = {
        id:     user.id,
        email:  user.email,
        rol:    perfil?.rol ?? 'cliente',
        nombre: perfil?.nombre ?? '',
        perfil,
      }
    } else {
      req.usuario = null
    }
  } catch {
    req.usuario = null
  }

  return next()
}
