// ─── payments.routes.js ───────────────────────────────────────────────────────
// Rutas de pagos con Stripe.
//
// IMPORTANTE — orden de registro en server.js:
//   1. La ruta del webhook DEBE registrarse con express.raw() ANTES de express.json()
//      para que Stripe pueda verificar la firma con el raw body.
//   El index.js de rutas ya gestiona este orden correctamente.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import {
  createPaymentIntent,
  stripeWebhook,
} from '../controllers/paymentController.js'
import { verificarToken }           from '../middleware/auth.middleware.js'
import { validarCrearPaymentIntent } from '../middleware/validation.middleware.js'

const router = Router()

// ── Webhook de Stripe (raw body — sin express.json()) ─────────────────────────
// Esta ruta se monta en index.js con express.raw() antes que el resto
router.post('/webhook', stripeWebhook)

// ── Autenticadas ──────────────────────────────────────────────────────────────
router.post('/create-intent', verificarToken, validarCrearPaymentIntent, createPaymentIntent)

export default router
