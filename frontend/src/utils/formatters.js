import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MONEDA, ESTADOS_ORDEN } from './constants'

// ─── Moneda ────────────────────────────────────────────────────────────────

/**
 * Formatea un número como moneda colombiana.
 * formatearPrecio(50000) → "$50.000"
 */
export const formatearPrecio = (valor) => {
  if (valor == null || isNaN(valor)) return '$0'
  return new Intl.NumberFormat(MONEDA.LOCALE, {
    style:                 'currency',
    currency:              MONEDA.CODIGO,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

/**
 * Formatea el costo de envío. Retorna "Gratis" si es 0.
 * formatearEnvio(0)     → "Gratis"
 * formatearEnvio(15000) → "$15.000"
 */
export const formatearEnvio = (costo) => {
  if (costo === 0) return 'Gratis'
  return formatearPrecio(costo)
}

/**
 * Convierte pesos COP a centavos para Stripe.
 * acentavos(50000) → 5000000
 */
export const aCentavos = (pesos) => Math.round(pesos * 100)

// ─── Fechas ────────────────────────────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato legible en español.
 * formatearFecha('2024-03-15') → "15 de marzo de 2024"
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return ''
  try {
    const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
    return format(d, "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return ''
  }
}

/**
 * Fecha corta: "15/03/2024"
 */
export const formatearFechaCorta = (fecha) => {
  if (!fecha) return ''
  try {
    const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
    return format(d, 'dd/MM/yyyy')
  } catch {
    return ''
  }
}

/**
 * Tiempo relativo: "hace 2 horas", "hace 3 días"
 */
export const formatearTiempoRelativo = (fecha) => {
  if (!fecha) return ''
  try {
    const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
    return formatDistanceToNow(d, { addSuffix: true, locale: es })
  } catch {
    return ''
  }
}

/**
 * Fecha + hora: "15 de marzo de 2024, 3:45 p. m."
 */
export const formatearFechaHora = (fecha) => {
  if (!fecha) return ''
  try {
    const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
    return format(d, "d 'de' MMMM 'de' yyyy, h:mm a", { locale: es })
  } catch {
    return ''
  }
}

// ─── Teléfonos ─────────────────────────────────────────────────────────────

/**
 * Formatea un número colombiano con espacios.
 * formatearTelefono('3001234567') → "300 123 4567"
 */
export const formatearTelefono = (tel) => {
  if (!tel) return ''
  const limpio = tel.replace(/\D/g, '')
  if (limpio.length === 10) {
    return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`
  }
  return tel
}

// ─── Estados de orden ─────────────────────────────────────────────────────

const CONFIG_ESTADO = {
  [ESTADOS_ORDEN.PENDIENTE]:  { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700', emoji: '⏳' },
  [ESTADOS_ORDEN.PAGADO]:     { label: 'Pagado',      color: 'bg-blue-100 text-blue-700',     emoji: '💳' },
  [ESTADOS_ORDEN.PREPARANDO]: { label: 'Preparando',  color: 'bg-orange-100 text-orange-700', emoji: '📦' },
  [ESTADOS_ORDEN.ENVIADO]:    { label: 'Enviado',     color: 'bg-purple-100 text-purple-700', emoji: '🚚' },
  [ESTADOS_ORDEN.ENTREGADO]:  { label: 'Entregado',   color: 'bg-green-100 text-green-700',   emoji: '✅' },
  [ESTADOS_ORDEN.CANCELADO]:  { label: 'Cancelado',   color: 'bg-red-100 text-red-700',       emoji: '❌' },
}

/**
 * Retorna label, clases de color y emoji para un estado de orden.
 * formatearEstadoOrden('enviado') → { label: 'Enviado', color: '...', emoji: '🚚' }
 */
export const formatearEstadoOrden = (estado) => {
  return CONFIG_ESTADO[estado] ?? { label: estado, color: 'bg-gray-100 text-gray-600', emoji: '❓' }
}

// ─── Texto ─────────────────────────────────────────────────────────────────

/**
 * Trunca un texto a N caracteres y agrega "…"
 * truncar('Texto muy largo', 10) → "Texto muy…"
 */
export const truncar = (texto, max = 100) => {
  if (!texto) return ''
  return texto.length > max ? `${texto.slice(0, max)}…` : texto
}

/**
 * Capitaliza la primera letra de una cadena.
 * capitalizar('nike') → "Nike"
 */
export const capitalizar = (texto) => {
  if (!texto) return ''
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}

/**
 * Formatea la cantidad de productos en el carrito.
 * formatearCantidadItems(1) → "1 producto"
 * formatearCantidadItems(3) → "3 productos"
 */
export const formatearCantidadItems = (cantidad) => {
  return `${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}`
}
