// ─── cors.middleware.js ───────────────────────────────────────────────────────
// Configuración centralizada de CORS para Express.
// Permite solicitudes desde el frontend (Vite en dev, dominio en prod).
// ─────────────────────────────────────────────────────────────────────────────

import cors from 'cors'
import { env } from '../config/env.js'

// ── Orígenes permitidos ───────────────────────────────────────────────────────
const ORIGENES_PERMITIDOS = [
  env.FRONTEND_URL,                    // ej: http://localhost:5173 o https://mitiendabonita.com
  'http://localhost:5173',             // Vite dev server (siempre permitido)
  'http://localhost:4173',             // Vite preview
].filter(Boolean)

// ── Opciones de CORS ──────────────────────────────────────────────────────────
const opcionesCors = {
  origin: (origen, callback) => {
    // Permitir peticiones sin origen (Postman, curl, same-origin server-to-server)
    if (!origen) return callback(null, true)

    if (ORIGENES_PERMITIDOS.includes(origen)) {
      return callback(null, true)
    }

    return callback(new Error(`Origen no permitido por CORS: ${origen}`))
  },

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'stripe-signature',   // Webhooks de Stripe
  ],

  exposedHeaders: ['X-Total-Count'],  // Para paginación

  credentials: true,      // Permite enviar cookies / Authorization headers

  maxAge: 86400,          // Cache del preflight 24 horas (en segundos)
}

// ── Middleware exportado ──────────────────────────────────────────────────────
export const corsMiddleware = cors(opcionesCors)

export default corsMiddleware
