// ─── Payment.js ───────────────────────────────────────────────────────────────
// Model de Pago — integración con Stripe.
// Registra cada intento de pago y su estado final.
//
// Estructura esperada en Supabase:
// tabla: payments
//   id                 uuid        PK default gen_random_uuid()
//   order_id           uuid        FK → orders.id nullable
//   user_id            uuid        FK → profiles.id
//   stripe_payment_id  text        unique  (PaymentIntent ID de Stripe)
//   monto              numeric     not null  (en COP)
//   moneda             text        default 'COP'
//   estado             text        default 'pendiente'
//                                  → 'pendiente' | 'completado' | 'fallido'
//                                     | 'reembolsado' | 'cancelado'
//   metadata           jsonb       nullable  (datos extra de Stripe)
//   created_at         timestamptz default now()
//   updated_at         timestamptz default now()
// ─────────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'
import { supabaseAdmin } from '../config/supabase.js'
import { env } from '../config/env.js'
import { aCentavos, limpiarObjeto } from '../utils/helpers.js'

const TABLA = 'payments'

// ── Cliente Stripe ────────────────────────────────────────────────────────────
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

export const ESTADOS_PAGO = Object.freeze({
  PENDIENTE:    'pendiente',
  COMPLETADO:   'completado',
  FALLIDO:      'fallido',
  REEMBOLSADO:  'reembolsado',
  CANCELADO:    'cancelado',
})

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE — PaymentIntent
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea un PaymentIntent en Stripe y registra el pago en BD.
 * @param {object} datos
 * @param {string} datos.userId
 * @param {number} datos.monto   - Total en COP
 * @param {string} [datos.moneda]
 * @param {object} [datos.metadata]
 */
export const crearPaymentIntent = async ({ userId, monto, moneda = 'cop', metadata = {} }) => {
  // Crear PaymentIntent en Stripe (monto en centavos)
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   aCentavos(monto),
    currency: moneda.toLowerCase(),
    metadata: {
      userId,
      ...metadata,
    },
    automatic_payment_methods: { enabled: true },
  })

  // Registrar en BD
  const pago = await registrarPago({
    userId,
    stripePaymentId: paymentIntent.id,
    monto,
    moneda:   moneda.toUpperCase(),
    estado:   ESTADOS_PAGO.PENDIENTE,
    metadata: { client_secret: paymentIntent.client_secret },
  })

  return {
    pago,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  }
}

/**
 * Recupera un PaymentIntent de Stripe por su ID.
 * @param {string} paymentIntentId
 */
export const obtenerPaymentIntent = async (paymentIntentId) => {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Construye y verifica el evento de webhook de Stripe.
 * @param {Buffer} payload    - req.rawBody
 * @param {string} signature  - header stripe-signature
 */
export const construirEventoWebhook = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE DE DATOS — Pagos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo pago en la tabla payments.
 * @param {object} datos
 */
export const registrarPago = async ({
  userId,
  orderId,
  stripePaymentId,
  monto,
  moneda = 'COP',
  estado = ESTADOS_PAGO.PENDIENTE,
  metadata,
}) => {
  const payload = limpiarObjeto({
    user_id:           userId,
    order_id:          orderId ?? null,
    stripe_payment_id: stripePaymentId,
    monto,
    moneda:            moneda.toUpperCase(),
    estado,
    metadata:          metadata ?? null,
    created_at:        new Date().toISOString(),
    updated_at:        new Date().toISOString(),
  })

  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Obtiene un pago por su ID de Stripe.
 * @param {string} stripePaymentId
 */
export const obtenerPagoPorStripeId = async (stripePaymentId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .select('*')
    .eq('stripe_payment_id', stripePaymentId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Obtiene un pago por su ID interno.
 * @param {string} pagoId
 */
export const obtenerPagoPorId = async (pagoId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .select('*')
    .eq('id', pagoId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Lista los pagos de un usuario.
 * @param {string} userId
 * @param {object} [opciones]
 */
export const listarPagosPorUsuario = async (userId, { pagina = 1, limite = 10 } = {}) => {
  const desde = (pagina - 1) * limite
  const hasta = desde + limite - 1

  const { data, error, count } = await supabaseAdmin
    .from(TABLA)
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(desde, hasta)

  if (error) throw new Error(error.message)

  return {
    pagos: data,
    total: count ?? 0,
    totalPaginas: Math.ceil((count ?? 0) / limite),
    pagina,
  }
}

/**
 * Actualiza el estado de un pago en BD.
 * @param {string} stripePaymentId
 * @param {string} nuevoEstado
 * @param {object} [metadata]     - datos extra a fusionar
 */
export const actualizarEstadoPago = async (stripePaymentId, nuevoEstado, metadata) => {
  const pago = await obtenerPagoPorStripeId(stripePaymentId)

  const datos = limpiarObjeto({
    estado:     nuevoEstado,
    metadata:   metadata ? { ...pago.metadata, ...metadata } : pago.metadata,
    updated_at: new Date().toISOString(),
  })

  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .update(datos)
    .eq('stripe_payment_id', stripePaymentId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Vincula un pago con su orden definitiva.
 * Se llama al confirmar la orden tras el pago exitoso.
 * @param {string} stripePaymentId
 * @param {string} orderId
 */
export const vincularOrden = async (stripePaymentId, orderId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .update({
      order_id:   orderId,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_id', stripePaymentId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
