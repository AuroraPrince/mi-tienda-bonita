// ─── product.service.js ───────────────────────────────────────────────────────
// Lógica de negocio de productos.
// Orquesta el model Product.js y el storage de Supabase para imágenes.
// ─────────────────────────────────────────────────────────────────────────────

import {
  listarProductos,
  obtenerProductoPorId,
  obtenerProductoPorSlug,
  obtenerCategorias,
  obtenerMarcas,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  eliminarProducto,
  verificarStock,
} from '../models/Product.js'
import { supabaseAdmin } from '../config/supabase.js'
import { paginar, limpiarObjeto } from '../utils/helpers.js'
import { logger } from '../utils/logger.js'

// Bucket de Supabase Storage para imágenes de productos
const BUCKET = 'productos'

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lista productos con filtros y paginación.
 */
export const obtenerProductos = async (filtros = {}) => {
  const { pagina = 1, limite = 20, ...resto } = filtros
  const resultado = await listarProductos({ ...resto, pagina, limite })

  return {
    productos:   resultado.productos,
    paginacion:  paginar({ total: resultado.total, pagina, limite }),
  }
}

/**
 * Obtiene un producto por ID.
 */
export const obtenerProducto = async (id) => {
  const producto = await obtenerProductoPorId(id)
  if (!producto) throw new Error(`Producto no encontrado: ${id}`)
  return producto
}

/**
 * Obtiene un producto por slug.
 */
export const obtenerProductoPorSlugService = async (slug) => {
  const producto = await obtenerProductoPorSlug(slug)
  if (!producto) throw new Error(`Producto no encontrado: ${slug}`)
  return producto
}

/**
 * Devuelve categorías y marcas disponibles para los filtros del frontend.
 */
export const obtenerFiltrosDisponibles = async () => {
  const [categorias, marcas] = await Promise.all([
    obtenerCategorias(),
    obtenerMarcas(),
  ])
  return { categorias, marcas }
}

// ─────────────────────────────────────────────────────────────────────────────
// ESCRITURA (Admin)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea un producto. Si viene una imagen (Multer file) la sube a Supabase Storage.
 * @param {object} datos    - Campos del producto
 * @param {object} [archivo] - Archivo de Multer (req.file)
 */
export const crearNuevoProducto = async (datos, archivo) => {
  let imagenUrl = datos.imagenUrl ?? null

  if (archivo) {
    imagenUrl = await subirImagen(archivo)
  }

  const producto = await crearProducto(limpiarObjeto({ ...datos, imagen_url: imagenUrl }))

  logger.info('Producto creado:', { id: producto.id, nombre: producto.nombre })
  return producto
}

/**
 * Actualiza un producto. Si viene imagen nueva la sube y reemplaza la anterior.
 * @param {string} id
 * @param {object} datos
 * @param {object} [archivo] - Archivo de Multer (req.file)
 */
export const actualizarProductoService = async (id, datos, archivo) => {
  let imagenUrl = datos.imagenUrl

  if (archivo) {
    // Obtener producto actual para eliminar imagen vieja si existe
    const productoActual = await obtenerProductoPorId(id)
    if (productoActual?.imagen_url) {
      await eliminarImagenStorage(productoActual.imagen_url)
    }
    imagenUrl = await subirImagen(archivo)
  }

  const camposActualizar = limpiarObjeto({
    ...datos,
    ...(imagenUrl !== undefined && { imagen_url: imagenUrl }),
  })

  const producto = await actualizarProducto(id, camposActualizar)

  logger.info('Producto actualizado:', { id })
  return producto
}

/**
 * Desactiva (soft delete) un producto.
 * @param {string} id
 */
export const desactivarProductoService = async (id) => {
  await obtenerProducto(id) // lanza error si no existe
  const resultado = await desactivarProducto(id)
  logger.info('Producto desactivado:', { id })
  return resultado
}

/**
 * Elimina permanentemente un producto y su imagen del storage.
 * @param {string} id
 */
export const eliminarProductoService = async (id) => {
  const producto = await obtenerProducto(id)

  if (producto.imagen_url) {
    await eliminarImagenStorage(producto.imagen_url)
  }

  await eliminarProducto(id)
  logger.info('Producto eliminado permanentemente:', { id })
  return { eliminado: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifica el stock de un array de items antes de procesar el pago.
 * @param {Array<{productoId, cantidad}>} items
 */
export const verificarDisponibilidad = async (items) => {
  return verificarStock(items)
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE — Imágenes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sube un archivo de imagen a Supabase Storage.
 * @param {object} archivo - Multer file (buffer, originalname, mimetype)
 * @returns {string} URL pública de la imagen
 */
const subirImagen = async (archivo) => {
  const extension  = archivo.originalname.split('.').pop()
  const nombreRuta = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(nombreRuta, archivo.buffer, {
      contentType: archivo.mimetype,
      upsert:      false,
    })

  if (error) throw new Error(`Error al subir imagen: ${error.message}`)

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(nombreRuta)
  return data.publicUrl
}

/**
 * Elimina una imagen del storage a partir de su URL pública.
 * @param {string} url
 */
const eliminarImagenStorage = async (url) => {
  try {
    // Extraer el path relativo del bucket de la URL
    const partes    = url.split(`/${BUCKET}/`)
    const rutaArch  = partes[1]
    if (!rutaArch) return

    await supabaseAdmin.storage.from(BUCKET).remove([rutaArch])
  } catch (err) {
    // No bloquear el flujo si falla la eliminación de imagen
    logger.warn('No se pudo eliminar imagen del storage:', { url, error: err.message })
  }
}
