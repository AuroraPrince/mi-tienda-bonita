// ─── productController.js ─────────────────────────────────────────────────────
// Recibe req/res, delega en product.service.js y responde con helpers.
// ─────────────────────────────────────────────────────────────────────────────

import {
  obtenerProductos,
  obtenerProducto,
  obtenerProductoPorSlugService,
  obtenerFiltrosDisponibles,
  crearNuevoProducto,
  actualizarProductoService,
  desactivarProductoService,
  eliminarProductoService,
  verificarDisponibilidad,
} from '../services/product.service.js'
import { respuestaOk, respuestaError } from '../utils/helpers.js'

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA — Público
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/products
 * Query: { categoria?, marca?, precioMin?, precioMax?, talla?, pagina?, limite? }
 */
export const getProducts = async (req, res) => {
  const resultado = await obtenerProductos(req.query)
  return respuestaOk(res, resultado)
}

/**
 * GET /api/products/filtros
 * Devuelve categorías y marcas disponibles para los filtros del frontend.
 */
export const getFiltros = async (req, res) => {
  const filtros = await obtenerFiltrosDisponibles()
  return respuestaOk(res, filtros)
}

/**
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  const producto = await obtenerProducto(req.params.id)
  return respuestaOk(res, { producto })
}

/**
 * GET /api/products/slug/:slug
 */
export const getProductBySlug = async (req, res) => {
  const producto = await obtenerProductoPorSlugService(req.params.slug)
  return respuestaOk(res, { producto })
}

/**
 * POST /api/products/verificar-stock
 * Body: { items: [{ productoId, cantidad }] }
 * Usado por el checkout antes de cobrar.
 */
export const verificarStock = async (req, res) => {
  const { items } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return respuestaError(res, 'Se requiere un array de items.')
  }

  const resultado = await verificarDisponibilidad(items)

  if (!resultado.ok) {
    return res.status(422).json({
      ok:        false,
      mensaje:   'Algunos productos no tienen stock suficiente.',
      faltantes: resultado.faltantes,
    })
  }

  return respuestaOk(res, {}, 'Stock disponible.')
}

// ─────────────────────────────────────────────────────────────────────────────
// ESCRITURA — Solo Admin
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/products
 * Body (multipart/form-data): campos del producto + imagen (file)
 */
export const createProduct = async (req, res) => {
  const producto = await crearNuevoProducto(req.body, req.file)
  return respuestaOk(res, { producto }, 'Producto creado correctamente.', 201)
}

/**
 * PUT /api/admin/products/:id
 * Body (multipart/form-data): campos a actualizar + imagen opcional (file)
 */
export const updateProduct = async (req, res) => {
  const producto = await actualizarProductoService(req.params.id, req.body, req.file)
  return respuestaOk(res, { producto }, 'Producto actualizado correctamente.')
}

/**
 * PATCH /api/admin/products/:id/desactivar
 * Soft delete — mantiene el historial de órdenes intacto.
 */
export const deactivateProduct = async (req, res) => {
  const resultado = await desactivarProductoService(req.params.id)
  return respuestaOk(res, resultado, 'Producto desactivado.')
}

/**
 * DELETE /api/admin/products/:id
 * Hard delete — elimina permanentemente el producto y su imagen.
 */
export const deleteProduct = async (req, res) => {
  const resultado = await eliminarProductoService(req.params.id)
  return respuestaOk(res, resultado, 'Producto eliminado permanentemente.')
}
