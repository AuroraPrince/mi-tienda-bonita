// ─── payment.service.js ───────────────────────────────────────────────────────
// Lógica de negocio de pagos con Stripe.
// Orquesta Payment.js, Order.js, Product.js y email.service.js.
// ─────────────────────────────────────────────────────────────────────────────

import {
  crearPaymentIntent,
  obtenerPaymentIntent,
  construirEventoWebhook,
  actualizarEstadoPago,
  obtenerPagoPorStripeId,
  vincularOrden,
  ESTADOS_PAGO,
} from '../models/Payment.js'
import { marcarComoPagada } from '../models/Order.js'
import { reducirStock }     from '../models/Product.js'
import { vaciarCarrito }    from '../models/Cart.js'
import { enviarConfirmacionOrden } from './email.service.js'
import { calcularTotal }    from '../utils/helpers.js'
import { logger }           from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// CREAR PAYMENT INTENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea un PaymentIntent de Stripe y lo registra en BD.
 * El frontend usa el clientSecret para confirmar el pago con Stripe.js.
 * @param {object} datos
 * @param {string} datos.userId
 * @param {Array}  datos.items      - [{ productoId, cantidad, precio }]
 * @param {string} [datos.moneda]
 */
export const iniciarPago = async ({ userId, items, moneda = 'cop' }) => {
  const monto = calcularTotal(items)

  if (monto <= 0) {
    throw new Error('El monto del pago debe ser mayor a 0.')
  }

  const resultado = await crearPaymentIntent({
    userId,
    monto,
    moneda,
    metadata: { itemCount: items.length },
  })

  logger.info('PaymentIntent creado:', {
    userId,
    monto,
    paymentIntentId: resultado.paymentIntentId,
  })

  return {
    clientSecret:    resultado.clientSecret,
    paymentIntentId: resultado.paymentIntentId,
    monto,
    moneda:          moneda.toUpperCase(),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMAR PAGO (llamado desde el order.service tras pago exitoso)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifica con Stripe que el PaymentIntent esté realmente pagado.
 * @param {string} paymentIntentId
 * @returns {boolean} true si el pago fue exitoso
 */
export const verificarPago = async (paymentIntentId) => {
  const pi = await obtenerPaymentIntent(paymentIntentId)

  if (pi.status !== 'succeeded') {
    throw new Error(
      `El pago no fue completado. Estado Stripe: "${pi.status}"`
    )
  }

  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK DE STRIPE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Procesa los eventos del webhook de Stripe.
 * Express debe pasar el raw body (Buffer) para verificar la firma.
 * @param {Buffer} rawBody    - req.rawBody
 * @param {string} signature  - req.headers['stripe-signature']
 */
export const procesarWebhook = async (rawBody, signature) => {
  // Verificar firma — lanza error si es inválida
  const evento = construirEventoWebhook(rawBody, signature)

  logger.info('Webhook Stripe recibido:', { type: evento.type, id: evento.id })

  switch (evento.type) {

    // ── Pago completado ──────────────────────────────────────────────────────
    case 'payment_intent.succeeded': {
      const pi = evento.data.object
      await _onPagoExitoso(pi)
      break
    }

    // ── Pago fallido ─────────────────────────────────────────────────────────
    case 'payment_intent.payment_failed': {
      const pi = evento.data.object
      await actualizarEstadoPago(pi.id, ESTADOS_PAGO.FALLIDO, {
        failure_message: pi.last_payment_error?.message,
      })
      logger.warn('Pago fallido:', { paymentIntentId: pi.id })
      break
    }

    // ── Pago cancelado ───────────────────────────────────────────────────────
    case 'payment_intent.canceled': {
      const pi = evento.data.object
      await actualizarEstadoPago(pi.id, ESTADOS_PAGO.CANCELADO)
      logger.info('Pago cancelado:', { paymentIntentId: pi.id })
      break
    }

    // ── Reembolso ────────────────────────────────────────────────────────────
    case 'charge.refunded': {
      const charge = evento.data.object
      if (charge.payment_intent) {
        await actualizarEstadoPago(charge.payment_intent, ESTADOS_PAGO.REEMBOLSADO)
        logger.info('Pago reembolsado:', { paymentIntentId: charge.payment_intent })
      }
      break
    }

    default:
      logger.debug('Evento Stripe no manejado:', { type: evento.type })
  }

  return { recibido: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER INTERNO — PAGO EXITOSO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Flujo completo al confirmar un pago exitoso:
 * 1. Actualiza estado del pago en BD
 * 2. Marca la orden como pagada
 * 3. Reduce el stock de cada producto
 * 4. Vacía el carrito
 * 5. Envía email de confirmación
 */
const _onPagoExitoso = async (pi) => {
  try {
    // 1. Actualizar estado del pago
    await actualizarEstadoPago(pi.id, ESTADOS_PAGO.COMPLETADO, {
      stripe_status: pi.status,
    })

    // 2. Marcar orden como pagada
    const orden = await marcarComoPagada(pi.id)

    if (!orden) {
      logger.warn('No se encontró orden para el PaymentIntent:', { paymentIntentId: pi.id })
      return
    }

    // 3. Reducir stock de cada producto
    for (const item of orden.items ?? []) {
      try {
        await reducirStock(item.product_id, item.cantidad)
      } catch (err) {
        logger.error('Error al reducir stock:', {
          productoId: item.product_id,
          error: err.message,
        })
      }
    }

    // 4. Vaciar carrito del usuario
    try {
      await vaciarCarrito(orden.user_id)
    } catch (err) {
      logger.warn('No se pudo vaciar el carrito:', { userId: orden.user_id })
    }

    // 5. Email de confirmación
    if (orden.usuario?.email) {
      await enviarConfirmacionOrden({
        email:  orden.usuario.email,
        nombre: orden.usuario.nombre ?? orden.usuario.email,
        orden,
      })
    }

    logger.info('Pago procesado exitosamente:', {
      paymentIntentId: pi.id,
      ordenId:         orden.id,
    })

  } catch (err) {
    logger.error('Error crítico al procesar pago exitoso:', {
      paymentIntentId: pi.id,
      error:           err.message,
    })
    throw err
  }
}
