// ─── env.js ───────────────────────────────────────────────────────────────────
// Centraliza y valida todas las variables de entorno al arrancar el servidor.
// Si falta alguna variable obligatoria el proceso termina con un mensaje claro.
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv'
dotenv.config()

// ── Helper de validación ──────────────────────────────────────────────────────
function requerir(nombre) {
  const valor = process.env[nombre]
  if (!valor) {
    console.error(`❌  Variable de entorno requerida no definida: ${nombre}`)
    process.exit(1)
  }
  return valor
}

function opcional(nombre, porDefecto = '') {
  return process.env[nombre] ?? porDefecto
}

// ── Exportación centralizada ──────────────────────────────────────────────────
export const env = {
  // Entorno
  NODE_ENV:  opcional('NODE_ENV', 'development'),
  PORT:      parseInt(opcional('PORT', '5000'), 10),

  // Supabase
  SUPABASE_URL:      requerir('SUPABASE_URL'),
  SUPABASE_ANON_KEY: requerir('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requerir('SUPABASE_SERVICE_ROLE_KEY'),

  // JWT (usado para tokens propios si aplica)
  JWT_SECRET:     requerir('JWT_SECRET'),
  JWT_EXPIRES_IN: opcional('JWT_EXPIRES_IN', '7d'),

  // Stripe
  STRIPE_SECRET_KEY:      requerir('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET:  requerir('STRIPE_WEBHOOK_SECRET'),

  // CORS
  FRONTEND_URL: opcional('FRONTEND_URL', 'http://localhost:5173'),

  // Email (Nodemailer)
  EMAIL_HOST:     opcional('EMAIL_HOST', 'smtp.gmail.com'),
  EMAIL_PORT:     parseInt(opcional('EMAIL_PORT', '587'), 10),
  EMAIL_USER:     opcional('EMAIL_USER'),
  EMAIL_PASSWORD: opcional('EMAIL_PASSWORD'),
  EMAIL_FROM:     opcional('EMAIL_FROM', 'Mi Tienda Bonita <no-reply@mitiendabonita.com>'),
}

export default env
