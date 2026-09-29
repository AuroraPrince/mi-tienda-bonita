// ─── order.service.js ─────────────────────────────────────────────────────────
// Lógica de negocio de órdenes.
// Orquesta Order.js, Product.js, Cart.js, payment.service y email.service.
// ─────────────────────────────────────────────────────────────────────────────

import {
  crearOrden,
  obtenerOrdenPorId,
  listarOrdenesPorUsuario,
  listarTodasLasOrdenes,
  actualizarEstadoOrden,
  ESTADOS_ORDEN,
} from '../models/Order.js'
import { obtenerProductoPorId, restaurarStock } from '../models/Product.js'
import { verificarPago }       from './payment.service.js'
import { enviarNotificacionEnvio } from './email.service.js'
import { paginar, calcularTotal }  from '../utils/helpers.js'
import { logger }              from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene una orden por ID.
 * Verifica que la orden pertenezca al usuario (salvo que sea admin).
 * @param {string} ordenId
 * @param {object} usuario  - req.usuario
 */
export const obtenerOrden = async (ordenId, usuario) => {
  const orden = await obtenerOrdenPorId(ordenId)

  if (!orden) throw new Error('Orden no encontrada.')

  // Un cliente solo puede ver sus propias órdenes
  if (usuario.rol !== 'admin' && orden.user_id !== usuario.id) {
    throw new Error('No tienes permiso para ver esta orden.')
  }

  return orden
}

/**
 * Lista las órdenes del usuario autenticado.
 * @param {string} userId
 * @param {object} opciones
 */
export const obtenerOrdenesUsuario = async (userId, { pagina = 1, limite = 10 } = {}) => {
  const resultado = await listarOrdenesPorUsuario(userId, { pagina, limite })
  return {
    ordenes:    resultado.ordenes,
    paginacion: paginar({ total: resultado.total, pagina, limite }),
  }
}

/**
 * Lista todas las órdenes (solo admin).
 * @param {object} opciones
 */
export const obtenerTodasLasOrdenes = async ({ estado, pagina = 1, limite = 20 } = {}) => {
  const resultado = await listarTodasLasOrdenes({ estado, pagina, limite })
  return {
    ordenes:    resultado.ordenes,
    paginacion: paginar({ total: resultado.total, pagina, limite }),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR ORDEN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea una orden tras confirmar el pago con Stripe.
 * Flujo:
 *  1. Verificar que el PaymentIntent esté pagado en Stripe
 *  2. Enriquecer los items con nombre y precio actuales del producto
 *  3. Calcular el total
 *  4. Crear la orden en BD
 *
 * @param {object} datos
 * @param {string} datos.userId
 * @param {string} datos.paymentIntentId
 * @param {object} datos.envio
 * @param {Array}  datos.items  - [{ productoId, cantidad, talla }]
 */
export const crearNuevaOrden = async ({ userId, paymentIntentId, envio, items }) => {
  // 1. Verificar pago en Stripe
  await verificarPago(paymentIntentId)

  // 2. Enriquecer items con snapshot de precio y nombre
  const itemsEnriquecidos = await Promise.all(
    items.map(async (item) => {
      const producto = await obtenerProductoPorId(item.productoId)
      if (!producto) throw new Error(`Producto no encontrado: ${item.productoId}`)

      return {
        productoId: item.productoId,
        nombre:     producto.nombre,
        precio:     Number(producto.precio),
        cantidad:   item.cantidad,
        talla:      item.talla ?? null,
      }
    })
  )

  // 3. Calcular total
  const total = calcularTotal(
    itemsEnriquecidos.map((i) => ({ precio: i.precio, cantidad: i.cantidad }))
  )

  // 4. Crear orden en BD
  const orden = await crearOrden({
    userId,
    total,
    paymentIntentId,
    envio,
    items: itemsEnriquecidos,
  })

  logger.info('Orden creada:', { ordenId: orden.id, userId, total })
  return orden
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR ESTADO (Admin)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Actualiza el estado de una orden con lógica adicional:
 *  - Al marcar como 'enviado' → envía email de notificación al cliente
 *  - Al marcar como 'cancelado' → restaura el stock de los productos
 *
 * @param {string} ordenId
 * @param {string} nuevoEstado
 * @param {object} [opciones]
 * @param {string} [opciones.trackingUrl]
 */
export const actualizarEstado = async (ordenId, nuevoEstado, { trackingUrl } = {}) => {
  const ordenActualizada = await actualizarEstadoOrden(ordenId, nuevoEstado)

  // ── Acciones secundarias según el nuevo estado ────────────────────────────

  if (nuevoEstado === ESTADOS_ORDEN.ENVIADO) {
    // Notificar al cliente por email
    if (ordenActualizada.usuario?.email) {
      await enviarNotificacionEnvio({
        email:      ordenActualizada.usuario.email,
        nombre:     ordenActualizada.usuario.nombre ?? '',
        orden:      ordenActualizada,
        trackingUrl,
      }).catch((err) => {
        logger.warn('No se pudo enviar email de envío:', { error: err.message })
      })
    }
  }

  if (nuevoEstado === ESTADOS_ORDEN.CANCELADO) {
    // Restaurar stock de cada producto
    for (const item of ordenActualizada.items ?? []) {
      try {
        await restaurarStock(item.product_id, item.cantidad)
      } catch (err) {
        logger.error('Error al restaurar stock al cancelar orden:', {
          productoId: item.product_id,
          error:      err.message,
        })
      }
    }
    logger.info('Stock restaurado por cancelación de orden:', { ordenId })
  }

  logger.info('Estado de orden actualizado:', {
    ordenId,
    estadoAnterior: ordenActualizada.estado,
    nuevoEstado,
  })

  return ordenActualizada
}

// ─────────────────────────────────────────────────────────────────────────────
// CANCELAR (Cliente)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Permite al cliente cancelar su propia orden si está en estado 'pendiente'.
 * @param {string} ordenId
 * @param {string} userId
 */
export const cancelarOrdenUsuario = async (ordenId, userId) => {
  const orden = await obtenerOrdenPorId(ordenId)

  if (!orden) throw new Error('Orden no encontrada.')

  if (orden.user_id !== userId) {
    throw new Error('No tienes permiso para cancelar esta orden.')
  }

  if (orden.estado !== ESTADOS_ORDEN.PENDIENTE) {
    throw new Error(
      `Solo puedes cancelar órdenes en estado "pendiente". Estado actual: "${orden.estado}"`
    )
  }

  return actualizarEstado(ordenId, ESTADOS_ORDEN.CANCELADO)
}
