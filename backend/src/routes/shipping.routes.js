// ─── shipping.routes.js ───────────────────────────────────────────────────────
// Rutas de envío — cálculo de tarifas y validación de dirección.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import {
  calcular,
  getOpciones,
  validarDireccion,
} from '../controllers/shippingController.js'
import { validarCalcularEnvio } from '../middleware/validation.middleware.js'

const router = Router()

// ── Públicas (no requieren autenticación) ─────────────────────────────────────
router.post('/calcular',   validarCalcularEnvio, calcular)
router.post('/opciones',                         getOpciones)
router.post('/validar',                          validarDireccion)

export default router
