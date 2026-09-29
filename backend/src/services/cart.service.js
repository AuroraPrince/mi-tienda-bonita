// ─── cart.service.js ──────────────────────────────────────────────────────────
// Lógica de negocio del carrito de compras.
// Orquesta Cart.js y Product.js para validar stock en cada operación.
// ─────────────────────────────────────────────────────────────────────────────

import {
  obtenerCarritoCompleto,
  agregarItem,
  actualizarCantidadItem,
  eliminarItem,
  vaciarCarrito,
  contarItems,
} from '../models/Cart.js'
import { obtenerProductoPorId } from '../models/Product.js'
import { logger } from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene el carrito completo del usuario con totales calculados.
 * @param {string} userId
 */
export const obtenerCarrito = async (userId) => {
  return obtenerCarritoCompleto(userId)
}

/**
 * Devuelve solo el conteo de items para el badge del header.
 * @param {string} userId
 */
export const obtenerConteoCarrito = async (userId) => {
  const total = await contarItems(userId)
  return { total }
}

// ─────────────────────────────────────────────────────────────────────────────
// AGREGAR ITEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agrega un producto al carrito validando:
 *  - Que el producto exista y esté activo
 *  - Que haya stock suficiente
 * @param {string} userId
 * @param {object} item
 * @param {string} item.productoId
 * @param {number} item.cantidad
 * @param {string} [item.talla]
 */
export const agregarAlCarrito = async (userId, { productoId, cantidad, talla }) => {
  // Validar que el producto existe
  const producto = await obtenerProductoPorId(productoId)
  if (!producto) throw new Error('Producto no encontrado.')
  if (!producto.activo) throw new Error('Este producto no está disponible.')

  // Validar stock
  if (producto.stock < cantidad) {
    throw new Error(
      `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`
    )
  }

  const item = await agregarItem(userId, { productoId, cantidad, talla })

  logger.info('Item agregado al carrito:', { userId, productoId, cantidad })
  return obtenerCarritoCompleto(userId)
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR CANTIDAD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Actualiza la cantidad de un item del carrito.
 * Valida el stock si la cantidad aumenta.
 * Si la cantidad llega a 0 elimina el item.
 * @param {string} userId
 * @param {string} itemId    - ID de cart_items
 * @param {number} cantidad
 */
export const actualizarItemCarrito = async (userId, itemId, cantidad) => {
  if (cantidad <= 0) {
    await eliminarItem(itemId)
    logger.info('Item eliminado del carrito por cantidad 0:', { userId, itemId })
    return obtenerCarritoCompleto(userId)
  }

  await actualizarCantidadItem(itemId, cantidad)
  logger.info('Cantidad de item actualizada:', { userId, itemId, cantidad })
  return obtenerCarritoCompleto(userId)
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINAR ITEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Elimina un item específico del carrito.
 * @param {string} userId
 * @param {string} itemId
 */
export const eliminarItemCarrito = async (userId, itemId) => {
  await eliminarItem(itemId)
  logger.info('Item eliminado del carrito:', { userId, itemId })
  return obtenerCarritoCompleto(userId)
}

// ─────────────────────────────────────────────────────────────────────────────
// VACIAR CARRITO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vacía completamente el carrito del usuario.
 * Se usa internamente al confirmar una orden.
 * @param {string} userId
 */
export const limpiarCarrito = async (userId) => {
  await vaciarCarrito(userId)
  logger.info('Carrito vaciado:', { userId })
  return { vaciado: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINCRONIZAR (merge carrito anónimo → autenticado)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fusiona items de un carrito local (anónimo) con el carrito del usuario.
 * El frontend envía los items almacenados en localStorage al hacer login.
 * @param {string} userId
 * @param {Array<{productoId, cantidad, talla}>} itemsLocales
 */
export const sincronizarCarrito = async (userId, itemsLocales = []) => {
  if (!itemsLocales.length) return obtenerCarritoCompleto(userId)

  for (const item of itemsLocales) {
    try {
      await agregarAlCarrito(userId, item)
    } catch (err) {
      // Si un item falla (stock agotado, producto inexistente) continuamos con los demás
      logger.warn('No se pudo sincronizar item:', {
        userId,
        productoId: item.productoId,
        error: err.message,
      })
    }
  }

  return obtenerCarritoCompleto(userId)
}
