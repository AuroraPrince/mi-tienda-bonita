// ─── authController.js ────────────────────────────────────────────────────────
// Recibe req/res, delega en auth.service.js y responde con helpers.
// ─────────────────────────────────────────────────────────────────────────────

import {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfil,
  actualizarPerfilUsuario,
  solicitarRecuperacionPassword,
  cambiarPassword,
} from '../services/auth.service.js'
import { respuestaOk, respuestaError } from '../utils/helpers.js'

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/registro
 * Body: { nombre, email, password }
 */
export const registro = async (req, res) => {
  const { nombre, email, password } = req.body

  const resultado = await registrarUsuario({ nombre, email, password })

  if (resultado.confirmarEmail) {
    return respuestaOk(
      res,
      { usuario: resultado.usuario },
      'Registro exitoso. Revisa tu email para confirmar tu cuenta.',
      201
    )
  }

  return respuestaOk(
    res,
    { usuario: resultado.usuario, session: resultado.session },
    'Registro exitoso.',
    201
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  const { email, password } = req.body

  const { usuario, session } = await iniciarSesion({ email, password })

  return respuestaOk(res, { usuario, session }, 'Sesión iniciada correctamente.')
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 */
export const logout = async (req, res) => {
  await cerrarSesion(req.headers.authorization)
  return respuestaOk(res, {}, 'Sesión cerrada correctamente.')
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFIL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/perfil
 * Header: Authorization: Bearer <token>
 */
export const getPerfil = async (req, res) => {
  const perfil = await obtenerPerfil(req.usuario.id)
  return respuestaOk(res, { perfil })
}

/**
 * PATCH /api/auth/perfil
 * Header: Authorization: Bearer <token>
 * Body: { nombre?, telefono?, direccion?, ciudad? }
 */
export const updatePerfil = async (req, res) => {
  const { nombre, telefono, direccion, ciudad } = req.body

  const perfil = await actualizarPerfilUsuario(req.usuario.id, {
    nombre, telefono, direccion, ciudad,
  })

  return respuestaOk(res, { perfil }, 'Perfil actualizado correctamente.')
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTRASEÑA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/recuperar-password
 * Body: { email }
 */
export const recuperarPassword = async (req, res) => {
  const { email } = req.body

  if (!email) return respuestaError(res, 'El email es requerido.')

  await solicitarRecuperacionPassword(email)

  return respuestaOk(
    res,
    {},
    'Si el email existe recibirás las instrucciones para restablecer tu contraseña.'
  )
}

/**
 * PATCH /api/auth/cambiar-password
 * Header: Authorization: Bearer <token>
 * Body: { passwordNueva }
 */
export const updatePassword = async (req, res) => {
  const { passwordNueva } = req.body

  await cambiarPassword(req.usuario.id, passwordNueva)

  return respuestaOk(res, {}, 'Contraseña actualizada correctamente.')
}

/**
 * GET /api/auth/me
 * Alias de getPerfil — devuelve el usuario del token actual.
 */
export const getMe = async (req, res) => {
  return respuestaOk(res, { usuario: req.usuario })
}
