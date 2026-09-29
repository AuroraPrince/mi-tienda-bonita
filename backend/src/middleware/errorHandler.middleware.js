// ─── errorHandler.middleware.js ───────────────────────────────────────────────
// Manejador global de errores de Express.
// Debe registrarse ÚLTIMO en server.js, después de todas las rutas.
// Captura errores lanzados con next(err) o por express-async-errors.
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from '../utils/logger.js'
import { env } from '../config/env.js'

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS DE ERROR CONOCIDOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapea nombres/mensajes de error conocidos a códigos HTTP y mensajes limpios.
 * Evita exponer detalles internos al cliente en producción.
 */
const ERRORES_CONOCIDOS = [
  // Autenticación / autorización
  { match: /token.*inválido|invalid.*token|jwt/i,   status: 401, mensaje: 'Token inválido o expirado.' },
  { match: /no autenticado|unauthorized/i,           status: 401, mensaje: 'Autenticación requerida.' },
  { match: /acceso denegado|forbidden/i,             status: 403, mensaje: 'No tienes permiso para esta acción.' },

  // Recursos
  { match: /no encontrado|not found|PGRST116/i,      status: 404, mensaje: 'Recurso no encontrado.' },

  // Conflicto
  { match: /duplicate|ya existe|unique/i,            status: 409, mensaje: 'El recurso ya existe.' },

  // Stock / negocio
  { match: /stock insuficiente/i,                    status: 422, mensaje: null }, // usa mensaje original
  { match: /transición inválida/i,                   status: 422, mensaje: null },

  // Stripe
  { match: /stripe/i,                               status: 402, mensaje: 'Error al procesar el pago.' },

  // Webhook
  { match: /webhook/i,                              status: 400, mensaje: 'Firma de webhook inválida.' },
]

/**
 * Determina el status HTTP y el mensaje a partir del error.
 */
function clasificarError(err) {
  // Si el error ya trae un statusCode (ej: errores de Stripe, http-errors)
  if (err.statusCode && err.statusCode >= 400) {
    return { status: err.statusCode, mensaje: err.message }
  }
  if (err.status && err.status >= 400) {
    return { status: err.status, mensaje: err.message }
  }

  // Buscar coincidencia en errores conocidos
  for (const { match, status, mensaje } of ERRORES_CONOCIDOS) {
    if (match.test(err.message)) {
      return { status, mensaje: mensaje ?? err.message }
    }
  }

  // Error genérico
  return { status: 500, mensaje: 'Error interno del servidor.' }
}

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE DE ERROR (4 parámetros obligatorios en Express)
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const { status, mensaje } = clasificarError(err)

  // Loguear siempre el error completo en el servidor
  if (status >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${status}`, {
      mensaje: err.message,
      stack:   err.stack,
      userId:  req.usuario?.id ?? 'anónimo',
    })
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${status}: ${err.message}`)
  }

  // Respuesta al cliente
  const respuesta = {
    ok:      false,
    mensaje,
  }

  // En desarrollo incluir el stack para depuración
  if (env.NODE_ENV === 'development') {
    respuesta.stack   = err.stack
    respuesta.detalle = err.message
  }

  return res.status(status).json(respuesta)
}

// ─────────────────────────────────────────────────────────────────────────────
// RUTA NO ENCONTRADA (404)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Captura rutas que no coinciden con ningún router.
 * Debe registrarse ANTES del errorHandler pero DESPUÉS de todas las rutas.
 */
export const notFound = (req, res, next) => {
  const err = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`)
  err.status = 404
  next(err)
}

export default errorHandler
