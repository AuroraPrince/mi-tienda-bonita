// ─── routes/index.js ──────────────────────────────────────────────────────────
// Punto de entrada de todas las rutas del backend.
// Se registra en server.js con: app.use('/api', router)
//
// NOTA sobre el webhook de Stripe:
//   Necesita el raw body (Buffer) antes de que express.json() lo parsee.
//   Por eso se monta con express.raw() de forma independiente ANTES del
//   middleware global de JSON.
// ─────────────────────────────────────────────────────────────────────────────

import { Router }   from 'express'
import express      from 'express'

import authRoutes     from './auth.routes.js'
import productRoutes  from './products.routes.js'
import cartRoutes     from './cart.routes.js'
import orderRoutes    from './orders.routes.js'
import paymentRoutes  from './payments.routes.js'
import shippingRoutes from './shipping.routes.js'

const router = Router()

// ── Webhook de Stripe — raw body ANTES de express.json() ─────────────────────
// Se registra aquí de forma independiente para garantizar el orden correcto.
router.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  (await import('../controllers/paymentController.js')).stripeWebhook
)

// ── Resto de rutas (usan express.json() del server global) ───────────────────
router.use('/auth',     authRoutes)
router.use('/products', productRoutes)
router.use('/cart',     cartRoutes)
router.use('/orders',   orderRoutes)
router.use('/payments', paymentRoutes)
router.use('/shipping', shippingRoutes)

// ── Rutas admin (prefijo /admin/*) ────────────────────────────────────────────
// Las rutas admin de cada módulo ya están definidas internamente
// con el prefijo /admin en sus respectivos archivos de rutas.
// El server.js las expone bajo /api/admin/* automáticamente.

export default router
