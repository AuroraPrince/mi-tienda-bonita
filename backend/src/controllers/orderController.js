// ─── orderController.js ───────────────────────────────────────────────────────
// Recibe req/res, delega en order.service.js y responde con helpers.
// ─────────────────────────────────────────────────────────────────────────────

import {
  obtenerOrden,
  obtenerOrdenesUsuario,
  obtenerTodasLasOrdenes,
  crearNuevaOrden,
  actualizarEstado,
  cancelarOrdenUsuario,
} from '../services/order.service.js'
import { respuestaOk, respuestaError } from '../utils/helpers.js'

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/orders
 * Lista las órdenes del usuario autenticado.
 * Query: { pagina?, limite? }
 */
export const getOrders = async (req, res) => {
  const { pagina, limite } = req.query

  const resultado = await obtenerOrdenesUsuario(req.usuario.id, {
    pagina:  Number(pagina)  || 1,
    limite:  Number(limite)  || 10,
  })

  return respuestaOk(res, resultado)
}

/**
 * GET /api/orders/:id
 * Obtiene una orden por ID.
 * Valida que el cliente solo vea sus propias órdenes.
 */
export const getOrderById = async (req, res) => {
  const orden = await obtenerOrden(req.params.id, req.usuario)
  return respuestaOk(res, { orden })
}

/**
 * POST /api/orders
 * Crea una orden tras confirmar el pago con Stripe.
 * Body: { paymentIntentId, envio, items }
 */
export const createOrder = async (req, res) => {
  const { paymentIntentId, envio, items } = req.body

  const orden = await crearNuevaOrden({
    userId: req.usuario.id,
    paymentIntentId,
    envio,
    items,
  })

  return respuestaOk(res, { orden }, 'Orden creada correctamente.', 201)
}

/**
 * PATCH /api/orders/:id/cancelar
 * El cliente cancela su propia orden (solo si está en estado 'pendiente').
 */
export const cancelOrder = async (req, res) => {
  const orden = await cancelarOrdenUsuario(req.params.id, req.usuario.id)
  return respuestaOk(res, { orden }, 'Orden cancelada.')
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/orders
 * Lista todas las órdenes con filtros opcionales.
 * Query: { estado?, pagina?, limite? }
 */
export const getAllOrders = async (req, res) => {
  const { estado, pagina, limite } = req.query

  const resultado = await obtenerTodasLasOrdenes({
    estado,
    pagina: Number(pagina) || 1,
    limite: Number(limite) || 20,
  })

  return respuestaOk(res, resultado)
}

/**
 * GET /api/admin/orders/:id
 * Obtiene cualquier orden por ID (sin restricción de userId).
 */
export const getOrderByIdAdmin = async (req, res) => {
  // Pasamos el usuario con rol 'admin' para que el service no restrinja por userId
  const orden = await obtenerOrden(req.params.id, req.usuario)
  return respuestaOk(res, { orden })
}

/**
 * PATCH /api/admin/orders/:id/estado
 * Actualiza el estado de una orden.
 * Body: { estado, trackingUrl? }
 */
export const updateOrderStatus = async (req, res) => {
  const { estado, trackingUrl } = req.body

  if (!estado) return respuestaError(res, 'El estado es requerido.')

  const orden = await actualizarEstado(req.params.id, estado, { trackingUrl })
  return respuestaOk(res, { orden }, `Orden marcada como "${estado}".`)
}
