// ─── cartController.js ────────────────────────────────────────────────────────
// Recibe req/res, delega en cart.service.js y responde con helpers.
// Todas las rutas requieren autenticación (verificarToken).
// ─────────────────────────────────────────────────────────────────────────────

import {
  obtenerCarrito,
  obtenerConteoCarrito,
  agregarAlCarrito,
  actualizarItemCarrito,
  eliminarItemCarrito,
  limpiarCarrito,
  sincronizarCarrito,
} from '../services/cart.service.js'
import { respuestaOk, respuestaError } from '../utils/helpers.js'

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/cart
 * Devuelve el carrito completo con items y totales.
 */
export const getCarrito = async (req, res) => {
  const carrito = await obtenerCarrito(req.usuario.id)
  return respuestaOk(res, { carrito })
}

/**
 * GET /api/cart/count
 * Devuelve solo el conteo de items (para el badge del header).
 */
export const getConteo = async (req, res) => {
  const conteo = await obtenerConteoCarrito(req.usuario.id)
  return respuestaOk(res, conteo)
}

// ─────────────────────────────────────────────────────────────────────────────
// AGREGAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/cart
 * Body: { productoId, cantidad, talla? }
 */
export const addItem = async (req, res) => {
  const { productoId, cantidad, talla } = req.body

  const carrito = await agregarAlCarrito(req.usuario.id, { productoId, cantidad, talla })
  return respuestaOk(res, { carrito }, 'Producto agregado al carrito.', 201)
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/cart/:itemId
 * Body: { cantidad }
 * Si cantidad = 0 → elimina el item automáticamente.
 */
export const updateItem = async (req, res) => {
  const { itemId } = req.params
  const { cantidad } = req.body

  if (cantidad === undefined || cantidad === null) {
    return respuestaError(res, 'La cantidad es requerida.')
  }

  const carrito = await actualizarItemCarrito(req.usuario.id, itemId, Number(cantidad))
  return respuestaOk(res, { carrito }, 'Carrito actualizado.')
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DELETE /api/cart/:itemId
 * Elimina un item específico del carrito.
 */
export const removeItem = async (req, res) => {
  const carrito = await eliminarItemCarrito(req.usuario.id, req.params.itemId)
  return respuestaOk(res, { carrito }, 'Producto eliminado del carrito.')
}

/**
 * DELETE /api/cart
 * Vacía completamente el carrito.
 */
export const clearCarrito = async (req, res) => {
  const resultado = await limpiarCarrito(req.usuario.id)
  return respuestaOk(res, resultado, 'Carrito vaciado.')
}

// ─────────────────────────────────────────────────────────────────────────────
// SINCRONIZAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/cart/sync
 * Fusiona el carrito local (anónimo) con el del usuario al hacer login.
 * Body: { items: [{ productoId, cantidad, talla? }] }
 */
export const syncCarrito = async (req, res) => {
  const { items } = req.body

  if (!Array.isArray(items)) {
    return respuestaError(res, 'Se requiere un array de items.')
  }

  const carrito = await sincronizarCarrito(req.usuario.id, items)
  return respuestaOk(res, { carrito }, 'Carrito sincronizado.')
}
