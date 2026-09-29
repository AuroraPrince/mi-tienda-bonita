// ─── supabase.js ──────────────────────────────────────────────────────────────
// Exporta dos clientes de Supabase:
//   · supabase      → anon key  (operaciones del lado del usuario)
//   · supabaseAdmin → service role key (operaciones del lado del servidor / admin)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

// ── Cliente público (anon key) ────────────────────────────────────────────────
// Respeta las políticas RLS definidas en Supabase.
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,   // El backend no persiste sesiones localmente
    },
  }
)

// ── Cliente admin (service role key) ─────────────────────────────────────────
// Salta las políticas RLS. Úsalo SOLO en operaciones de servidor de confianza
// (crear usuarios, consultas admin, etc.). Nunca lo expongas al cliente.
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export default supabase
