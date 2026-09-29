// ─── paymentController.js ─────────────────────────────────────────────────────
// Recibe req/res, delega en payment.service.js y responde con helpers.
// El webhook de Stripe requiere el raw body — se configura en server.js.
// ─────────────────────────────────────────────────────────────────────────────

import {
  iniciarPago,
  procesarWebhook,
} from '../services/payment.service.js'
import { respuestaOk, respuestaError } from '../utils/helpers.js'

// ─────────────────────────────────────────────────────────────────────────────
// CREAR PAYMENT INTENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/create-intent
 * Crea un PaymentIntent en Stripe y devuelve el clientSecret al frontend.
 * Body: { items: [{ productoId, cantidad, precio }], moneda? }
 */
export const createPaymentIntent = async (req, res) => {
  const { items, moneda } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return respuestaError(res, 'Se requiere al menos un item.')
  }

  const resultado = await iniciarPago({
    userId: req.usuario.id,
    items,
    moneda: moneda ?? 'cop',
  })

  return respuestaOk(res, resultado, 'PaymentIntent creado.')
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK DE STRIPE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/webhook
 * Recibe eventos de Stripe (pago exitoso, fallido, reembolso, etc.).
 *
 * IMPORTANTE:
 * - Esta ruta NO usa express.json() — necesita el raw body (Buffer).
 * - En server.js se debe registrar ANTES del middleware global express.json():
 *     app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
 * - No requiere autenticación (viene de Stripe, se verifica por firma).
 */
export const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature']

  if (!signature) {
    return respuestaError(res, 'Firma de Stripe requerida.', 400)
  }

  // req.body aquí es un Buffer (raw body), no JSON
  const resultado = await procesarWebhook(req.body, signature)

  // Stripe requiere una respuesta 200 rápida
  return res.status(200).json(resultado)
}
