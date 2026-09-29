import api from './api'
import { calcularEnvio } from '../utils/helpers'
import { ENVIO } from '../utils/constants'

// ─── Calcular costo de envío (local, sin llamada al backend) ───────────────
/**
 * Retorna el costo de envío basado en el subtotal del carrito.
 * No hace petición HTTP — usa la lógica local de helpers.js.
 *
 * calcularCostoEnvio(180000) → { costo: 15000, esGratis: false, falta: 20000 }
 * calcularCostoEnvio(250000) → { costo: 0,     esGratis: true,  falta: 0     }
 */
export const calcularCostoEnvio = (subtotal) => {
  const costo    = calcularEnvio(subtotal)
  const esGratis = costo === 0
  const falta    = Math.max(0, ENVIO.GRATIS_DESDE - subtotal)
  return { costo, esGratis, falta }
}

// ─── Validar dirección de envío en el backend ─────────────────────────────
/**
 * Envía los datos de envío al backend para validarlos
 * (p. ej. verificar cobertura en la ciudad/departamento).
 * Retorna { valida: true } o { valida: false, mensaje: '...' }
 */
export const validarDireccionEnvio = async (datosEnvio) => {
  const { data } = await api.post('/shipping/validate', datosEnvio)
  return data
}

// ─── Obtener opciones de envío disponibles para una dirección ─────────────
/**
 * Consulta las opciones de envío disponibles (estándar, express, etc.)
 * según la ciudad y departamento del comprador.
 *
 * Retorna un array:
 * [
 *   { id: 'estandar', label: 'Estándar (3-5 días)', costo: 15000 },
 *   { id: 'express',  label: 'Express (1-2 días)',  costo: 30000 },
 * ]
 */
export const getOpcionesEnvio = async ({ ciudad, departamento }) => {
  const { data } = await api.get('/shipping/options', {
    params: { ciudad, departamento },
  })
  return data
}

// ─── Obtener seguimiento de un envío ──────────────────────────────────────
/**
 * Devuelve el historial de estados de un envío dado el ID de la orden.
 *
 * Retorna:
 * {
 *   numero_guia: 'TCC-123456',
 *   transportadora: 'TCC',
 *   eventos: [
 *     { fecha: '2024-03-15T10:00:00Z', estado: 'En bodega', ciudad: 'Bogotá' },
 *     { fecha: '2024-03-16T08:30:00Z', estado: 'En camino', ciudad: 'Medellín' },
 *   ]
 * }
 */
export const getSeguimientoEnvio = async (ordenId) => {
  const { data } = await api.get(`/shipping/tracking/${ordenId}`)
  return data
}

// ─── Estimar fecha de entrega ──────────────────────────────────────────────
/**
 * Retorna la fecha estimada de entrega como string legible.
 * Usa los días hábiles configurados en constants.js.
 */
export const estimarFechaEntrega = () => {
  const hoy    = new Date()
  const minima = new Date(hoy)
  const maxima = new Date(hoy)

  // Sumar días hábiles (omitir sábados y domingos)
  let diasSumados = 0
  let cursor = new Date(hoy)

  while (diasSumados < ENVIO.DIAS_HABILES.MAX) {
    cursor.setDate(cursor.getDate() + 1)
    const diaSemana = cursor.getDay()
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasSumados++
      if (diasSumados === ENVIO.DIAS_HABILES.MIN) minima.setTime(cursor.getTime())
      if (diasSumados === ENVIO.DIAS_HABILES.MAX) maxima.setTime(cursor.getTime())
    }
  }

  const opciones = { day: 'numeric', month: 'long', locale: 'es-CO' }
  const fmt = (d) => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })

  return `${fmt(minima)} – ${fmt(maxima)}`
}
