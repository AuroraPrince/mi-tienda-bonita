// ─── validators.js ────────────────────────────────────────────────────────────
// Esquemas Joi para validar los cuerpos de las peticiones HTTP.
// El middleware validation.middleware.js los consume para validar req.body,
// req.params y req.query antes de que lleguen al controller.
// ─────────────────────────────────────────────────────────────────────────────

import Joi from 'joi'

// ── Helpers reutilizables ─────────────────────────────────────────────────────
const id        = Joi.string().uuid().required()
const email     = Joi.string().email().lowercase().trim().required()
const password  = Joi.string().min(8).max(72).required()
const precio    = Joi.number().positive().precision(2).required()
const cantidad  = Joi.number().integer().min(1).required()

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const schemaRegistro = Joi.object({
  nombre:   Joi.string().trim().min(2).max(80).required(),
  email,
  password,
})

export const schemaLogin = Joi.object({
  email,
  password: Joi.string().required(),
})

export const schemaCambiarPassword = Joi.object({
  passwordActual: Joi.string().required(),
  passwordNueva:  password,
})

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────────────────────────────────────────

export const schemaCrearProducto = Joi.object({
  nombre:      Joi.string().trim().min(2).max(120).required(),
  descripcion: Joi.string().trim().max(1000).optional().allow(''),
  precio,
  stock:       Joi.number().integer().min(0).required(),
  marca:       Joi.string().trim().max(60).optional().allow(''),
  categoria:   Joi.string().trim().max(60).optional().allow(''),
  talla:       Joi.string().trim().max(20).optional().allow(''),
  imagenUrl:   Joi.string().uri().optional().allow(''),
})

export const schemaActualizarProducto = Joi.object({
  nombre:      Joi.string().trim().min(2).max(120),
  descripcion: Joi.string().trim().max(1000).allow(''),
  precio:      Joi.number().positive().precision(2),
  stock:       Joi.number().integer().min(0),
  marca:       Joi.string().trim().max(60).allow(''),
  categoria:   Joi.string().trim().max(60).allow(''),
  talla:       Joi.string().trim().max(20).allow(''),
  imagenUrl:   Joi.string().uri().allow(''),
}).min(1) // al menos un campo

export const schemaFiltrosProductos = Joi.object({
  categoria: Joi.string().optional(),
  marca:     Joi.string().optional(),
  precioMin: Joi.number().min(0).optional(),
  precioMax: Joi.number().min(0).optional(),
  talla:     Joi.string().optional(),
  pagina:    Joi.number().integer().min(1).default(1),
  limite:    Joi.number().integer().min(1).max(100).default(20),
})

// ─────────────────────────────────────────────────────────────────────────────
// CARRITO
// ─────────────────────────────────────────────────────────────────────────────

export const schemaAgregarAlCarrito = Joi.object({
  productoId: id,
  cantidad,
  talla: Joi.string().trim().max(20).optional().allow(''),
})

export const schemaActualizarCarrito = Joi.object({
  cantidad,
})

// ─────────────────────────────────────────────────────────────────────────────
// ÓRDENES
// ─────────────────────────────────────────────────────────────────────────────

export const schemaCrearOrden = Joi.object({
  paymentIntentId: Joi.string().required(),
  envio: Joi.object({
    nombre:       Joi.string().trim().required(),
    direccion:    Joi.string().trim().required(),
    ciudad:       Joi.string().trim().required(),
    departamento: Joi.string().trim().optional().allow(''),
    codigoPostal: Joi.string().trim().optional().allow(''),
    telefono:     Joi.string().trim().optional().allow(''),
  }).required(),
  items: Joi.array().items(
    Joi.object({
      productoId: id,
      cantidad,
      precio:    Joi.number().positive().required(),
      talla:     Joi.string().trim().optional().allow(''),
    })
  ).min(1).required(),
})

export const schemaActualizarEstadoOrden = Joi.object({
  estado: Joi.string()
    .valid('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')
    .required(),
})

// ─────────────────────────────────────────────────────────────────────────────
// PAGOS
// ─────────────────────────────────────────────────────────────────────────────

export const schemaCrearPaymentIntent = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productoId: id,
      cantidad,
      precio:    Joi.number().positive().required(),
    })
  ).min(1).required(),
  moneda: Joi.string().length(3).uppercase().default('COP'),
})

// ─────────────────────────────────────────────────────────────────────────────
// ENVÍO
// ─────────────────────────────────────────────────────────────────────────────

export const schemaCalcularEnvio = Joi.object({
  ciudad:       Joi.string().trim().required(),
  departamento: Joi.string().trim().optional().allow(''),
  peso:         Joi.number().positive().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// PARÁMETROS DE URL
// ─────────────────────────────────────────────────────────────────────────────

export const schemaParamId = Joi.object({
  id,
})

export const schemaPaginacion = Joi.object({
  pagina: Joi.number().integer().min(1).default(1),
  limite: Joi.number().integer().min(1).max(100).default(20),
  estado: Joi.string()
    .valid('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')
    .optional(),
})
