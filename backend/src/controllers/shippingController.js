// ─── shippingController.js ────────────────────────────────────────────────────
// Recibe req/res, delega en shipping.service.js y responde con helpers.
// ─────────────────────────────────────────────────────────────────────────────

import {
  calcularEnvio,
  obtenerOpcionesEnvio,
  validarDireccionEnvio,
} from '../services/shipping.service.js'
import { respuestaOk, respuestaError } from '../utils/helpers.js'

// ─────────────────────────────────────────────────────────────────────────────
// CALCULAR ENVÍO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/shipping/calcular
 * Calcula el costo de envío para una dirección y total de pedido.
 * Body: { ciudad, departamento?, totalPedido?, peso? }
 */
export const calcular = async (req, res) => {
  const { ciudad, departamento, totalPedido, peso } = req.body

  if (!ciudad) {
    return respuestaError(res, 'La ciudad es requerida para calcular el envío.')
  }

  const resultado = await calcularEnvio({
    ciudad,
    departamento,
    totalPedido: Number(totalPedido) || 0,
    peso:        Number(peso)        || undefined,
  })

  return respuestaOk(res, { envio: resultado })
}

// ─────────────────────────────────────────────────────────────────────────────
// OPCIONES DE ENVÍO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/shipping/opciones
 * Devuelve todas las opciones de envío disponibles (estándar + express).
 * Body: { ciudad, departamento?, totalPedido? }
 */
export const getOpciones = async (req, res) => {
  const { ciudad, departamento, totalPedido } = req.body

  if (!ciudad) {
    return respuestaError(res, 'La ciudad es requerida.')
  }

  const opciones = await obtenerOpcionesEnvio({
    ciudad,
    departamento,
    totalPedido: Number(totalPedido) || 0,
  })

  return respuestaOk(res, { opciones })
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDAR DIRECCIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/shipping/validar
 * Valida que una dirección de envío tenga los campos requeridos.
 * Body: { nombre, direccion, ciudad, departamento?, codigoPostal?, telefono? }
 */
export const validarDireccion = async (req, res) => {
  try {
    validarDireccionEnvio(req.body)
    return respuestaOk(res, {}, 'Dirección válida.')
  } catch (err) {
    return respuestaError(res, err.message, 422)
  }
}
