// ─── validation.middleware.js ─────────────────────────────────────────────────
// Middleware de validación basado en esquemas Joi (definidos en utils/validators.js).
// Valida req.body, req.params y req.query antes de que lleguen al controller.
// Si la validación falla responde 422 con los errores detallados.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera un middleware que valida una parte del request con un esquema Joi.
 *
 * @param {import('joi').Schema} schema - Esquema Joi
 * @param {'body'|'params'|'query'} fuente - Parte del request a validar
 * @param {object} [opciones] - Opciones de Joi (abortEarly, stripUnknown, etc.)
 *
 * @example
 *   router.post('/login', validar(schemaLogin, 'body'), authController.login)
 *   router.get('/:id',   validar(schemaParamId, 'params'), productController.getOne)
 */
export const validar = (schema, fuente = 'body', opciones = {}) => {
  return (req, res, next) => {
    const opcionesJoi = {
      abortEarly:    false,   // Devuelve TODOS los errores, no solo el primero
      stripUnknown:  true,    // Elimina campos no definidos en el esquema
      convert:       true,    // Convierte tipos (ej: string '42' → number 42)
      ...opciones,
    }

    const { error, value } = schema.validate(req[fuente], opcionesJoi)

    if (error) {
      const errores = error.details.map((d) => ({
        campo:   d.path.join('.'),
        mensaje: d.message.replace(/['"]/g, ''),
      }))

      return res.status(422).json({
        ok:      false,
        mensaje: 'Datos de entrada inválidos.',
        errores,
      })
    }

    // Reemplazar la fuente con el valor saneado por Joi (con conversiones)
    req[fuente] = value
    return next()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDADORES PREDEFINIDOS (atajos para las rutas)
// ─────────────────────────────────────────────────────────────────────────────

import {
  schemaRegistro,
  schemaLogin,
  schemaCambiarPassword,
  schemaCrearProducto,
  schemaActualizarProducto,
  schemaFiltrosProductos,
  schemaAgregarAlCarrito,
  schemaActualizarCarrito,
  schemaCrearOrden,
  schemaActualizarEstadoOrden,
  schemaCrearPaymentIntent,
  schemaCalcularEnvio,
  schemaParamId,
  schemaPaginacion,
} from '../utils/validators.js'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const validarRegistro          = validar(schemaRegistro,         'body')
export const validarLogin             = validar(schemaLogin,            'body')
export const validarCambiarPassword   = validar(schemaCambiarPassword,  'body')

// ── Productos ─────────────────────────────────────────────────────────────────
export const validarCrearProducto     = validar(schemaCrearProducto,    'body')
export const validarActualizarProducto = validar(schemaActualizarProducto, 'body')
export const validarFiltrosProductos  = validar(schemaFiltrosProductos, 'query')

// ── Carrito ───────────────────────────────────────────────────────────────────
export const validarAgregarAlCarrito  = validar(schemaAgregarAlCarrito, 'body')
export const validarActualizarCarrito = validar(schemaActualizarCarrito,'body')

// ── Órdenes ───────────────────────────────────────────────────────────────────
export const validarCrearOrden           = validar(schemaCrearOrden,           'body')
export const validarActualizarEstadoOrden = validar(schemaActualizarEstadoOrden,'body')

// ── Pagos ─────────────────────────────────────────────────────────────────────
export const validarCrearPaymentIntent  = validar(schemaCrearPaymentIntent, 'body')

// ── Envío ─────────────────────────────────────────────────────────────────────
export const validarCalcularEnvio       = validar(schemaCalcularEnvio, 'body')

// ── Parámetros y paginación ───────────────────────────────────────────────────
export const validarParamId    = validar(schemaParamId,   'params')
export const validarPaginacion = validar(schemaPaginacion, 'query')
