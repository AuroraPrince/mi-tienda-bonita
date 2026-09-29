// ─── shipping.service.js ──────────────────────────────────────────────────────
// Lógica de cálculo y gestión de envíos.
// Implementa tarifas fijas por ciudad/departamento de Colombia.
// Preparado para conectar con un proveedor externo (Servientrega, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// TARIFAS (COP)
// ─────────────────────────────────────────────────────────────────────────────

// Ciudades con envío gratuito (capital + ciudades principales)
const CIUDADES_ENVIO_GRATIS = new Set([
  'bogota', 'bogotá',
])

// Tarifas por departamento (ciudades no listadas = tarifa por defecto)
const TARIFAS_DEPARTAMENTO = {
  'cundinamarca':     8000,
  'antioquia':       10000,
  'valle del cauca': 10000,
  'atlantico':       12000,
  'atlántico':       12000,
  'bolivar':         13000,
  'bolívar':         13000,
  'santander':       11000,
  'norte de santander': 12000,
  'tolima':          11000,
  'huila':           11000,
  'nariño':          14000,
  'cauca':           13000,
  'boyaca':          10000,
  'boyacá':          10000,
  'meta':            12000,
  'casanare':        13000,
}

const TARIFA_POR_DEFECTO  = 15000   // Resto del país
const MONTO_ENVIO_GRATIS  = 200000  // Compras > $200.000 COP → envío gratis

// Tiempo estimado de entrega (días hábiles)
const DIAS_ENTREGA = {
  bogota:   1,
  bogotá:   1,
  default:  3,
}

// ─────────────────────────────────────────────────────────────────────────────
// CÁLCULO DE ENVÍO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el costo de envío según la dirección y el total del pedido.
 * @param {object} datos
 * @param {string} datos.ciudad
 * @param {string} [datos.departamento]
 * @param {number} [datos.totalPedido]  - Si supera MONTO_ENVIO_GRATIS → gratis
 * @param {number} [datos.peso]         - Peso en kg (para integración futura)
 * @returns {{ costo, gratis, diasEntrega, descripcion }}
 */
export const calcularEnvio = async ({ ciudad, departamento, totalPedido = 0, peso }) => {
  const ciudadNorm       = ciudad?.toLowerCase().trim() ?? ''
  const departamentoNorm = departamento?.toLowerCase().trim() ?? ''

  // ── Envío gratuito por monto ──────────────────────────────────────────────
  if (totalPedido >= MONTO_ENVIO_GRATIS) {
    return _respuestaEnvio({
      costo:       0,
      gratis:      true,
      ciudadNorm,
      razon:       `Envío gratis en compras mayores a ${_formatCOP(MONTO_ENVIO_GRATIS)}`,
    })
  }

  // ── Envío gratuito por ciudad ─────────────────────────────────────────────
  if (CIUDADES_ENVIO_GRATIS.has(ciudadNorm)) {
    return _respuestaEnvio({
      costo:       0,
      gratis:      true,
      ciudadNorm,
      razon:       `Envío gratis en ${_capitalizar(ciudadNorm)}`,
    })
  }

  // ── Tarifa por departamento ───────────────────────────────────────────────
  const costo = TARIFAS_DEPARTAMENTO[departamentoNorm] ?? TARIFA_POR_DEFECTO

  return _respuestaEnvio({ costo, gratis: false, ciudadNorm })
}

/**
 * Devuelve todas las opciones de envío disponibles para una dirección.
 * Útil para mostrar al usuario varias opciones (estándar, express, etc.).
 * @param {object} datos
 * @param {string} datos.ciudad
 * @param {string} [datos.departamento]
 * @param {number} [datos.totalPedido]
 */
export const obtenerOpcionesEnvio = async ({ ciudad, departamento, totalPedido = 0 }) => {
  const estandar = await calcularEnvio({ ciudad, departamento, totalPedido })

  // Opción express (2x el precio, mitad de tiempo)
  const express = {
    ...estandar,
    tipo:         'express',
    nombre:       'Envío express',
    costo:        estandar.gratis ? 0 : estandar.costo * 2,
    diasEntrega:  Math.max(1, Math.floor(estandar.diasEntrega / 2)),
    descripcion:  `Entrega en ${Math.max(1, Math.floor(estandar.diasEntrega / 2))} día(s) hábil(es)`,
  }

  return [
    { tipo: 'estandar', nombre: 'Envío estándar', ...estandar },
    express,
  ]
}

/**
 * Valida que la dirección de envío tenga los campos mínimos requeridos.
 * @param {object} envio
 */
export const validarDireccionEnvio = (envio) => {
  const requeridos = ['nombre', 'direccion', 'ciudad']
  const faltantes  = requeridos.filter((campo) => !envio?.[campo])

  if (faltantes.length > 0) {
    throw new Error(`Campos de envío requeridos: ${faltantes.join(', ')}`)
  }

  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

function _respuestaEnvio({ costo, gratis, ciudadNorm, razon }) {
  const dias = DIAS_ENTREGA[ciudadNorm] ?? DIAS_ENTREGA.default

  return {
    costo,
    gratis,
    diasEntrega:  dias,
    descripcion:  razon ?? `Entrega en ${dias} día(s) hábil(es)`,
    moneda:       'COP',
  }
}

function _formatCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(valor)
}

function _capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
