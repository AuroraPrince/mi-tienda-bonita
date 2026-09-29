// ─── Product.js ───────────────────────────────────────────────────────────────
// Model de Producto.
//
// Estructura esperada en Supabase:
// tabla: products
//   id          uuid        PK default gen_random_uuid()
//   nombre      text        not null
//   descripcion text        nullable
//   precio      numeric     not null  (en COP)
//   stock       integer     not null  default 0
//   marca       text        nullable
//   categoria   text        nullable
//   talla       text        nullable
//   imagen_url  text        nullable
//   slug        text        unique nullable
//   activo      boolean     default true
//   created_at  timestamptz default now()
//   updated_at  timestamptz default now()
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from '../config/supabase.js'
import { limpiarObjeto, generarSlug } from '../utils/helpers.js'

const TABLA = 'products'

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lista productos con filtros y paginación.
 * @param {object} opciones
 * @param {string}  [opciones.categoria]
 * @param {string}  [opciones.marca]
 * @param {number}  [opciones.precioMin]
 * @param {number}  [opciones.precioMax]
 * @param {string}  [opciones.talla]
 * @param {boolean} [opciones.soloActivos]  - true por defecto
 * @param {number}  [opciones.pagina]
 * @param {number}  [opciones.limite]
 */
export const listarProductos = async ({
  categoria,
  marca,
  precioMin,
  precioMax,
  talla,
  soloActivos = true,
  pagina = 1,
  limite = 20,
} = {}) => {
  const desde = (pagina - 1) * limite
  const hasta = desde + limite - 1

  let query = supabaseAdmin
    .from(TABLA)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(desde, hasta)

  if (soloActivos)  query = query.eq('activo', true)
  if (categoria)    query = query.eq('categoria', categoria)
  if (marca)        query = query.eq('marca', marca)
  if (talla)        query = query.eq('talla', talla)
  if (precioMin)    query = query.gte('precio', precioMin)
  if (precioMax)    query = query.lte('precio', precioMax)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    productos: data,
    total: count ?? 0,
    totalPaginas: Math.ceil((count ?? 0) / limite),
    pagina,
  }
}

/**
 * Obtiene un producto por su ID.
 * @param {string} id
 */
export const obtenerProductoPorId = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Obtiene un producto por su slug.
 * @param {string} slug
 */
export const obtenerProductoPorSlug = async (slug) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Devuelve las categorías únicas de productos activos.
 */
export const obtenerCategorias = async () => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .select('categoria')
    .eq('activo', true)
    .not('categoria', 'is', null)

  if (error) throw new Error(error.message)

  const unicas = [...new Set(data.map((p) => p.categoria))].sort()
  return unicas
}

/**
 * Devuelve las marcas únicas de productos activos.
 */
export const obtenerMarcas = async () => {
  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .select('marca')
    .eq('activo', true)
    .not('marca', 'is', null)

  if (error) throw new Error(error.message)

  const unicas = [...new Set(data.map((p) => p.marca))].sort()
  return unicas
}

// ─────────────────────────────────────────────────────────────────────────────
// ESCRITURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea un nuevo producto.
 * @param {object} datos
 */
export const crearProducto = async (datos) => {
  const payload = limpiarObjeto({
    ...datos,
    slug:       datos.slug ?? generarSlug(datos.nombre),
    activo:     datos.activo ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Actualiza un producto de forma parcial.
 * @param {string} id
 * @param {object} campos
 */
export const actualizarProducto = async (id, campos) => {
  const datos = limpiarObjeto({
    ...campos,
    // Si cambia el nombre regeneramos el slug automáticamente
    ...(campos.nombre && !campos.slug && { slug: generarSlug(campos.nombre) }),
    updated_at: new Date().toISOString(),
  })

  const { data, error } = await supabaseAdmin
    .from(TABLA)
    .update(datos)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Desactiva un producto (soft delete).
 * @param {string} id
 */
export const desactivarProducto = async (id) => {
  return actualizarProducto(id, { activo: false })
}

/**
 * Elimina un producto permanentemente (hard delete).
 * Preferir desactivarProducto() para mantener historial en órdenes.
 * @param {string} id
 */
export const eliminarProducto = async (id) => {
  const { error } = await supabaseAdmin
    .from(TABLA)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { eliminado: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reduce el stock de un producto tras una compra confirmada.
 * Lanza error si el stock resultante sería negativo.
 * @param {string} id
 * @param {number} cantidad
 */
export const reducirStock = async (id, cantidad) => {
  const producto = await obtenerProductoPorId(id)

  if (producto.stock < cantidad) {
    throw new Error(
      `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`
    )
  }

  return actualizarProducto(id, { stock: producto.stock - cantidad })
}

/**
 * Restaura stock de un producto (ej: al cancelar una orden).
 * @param {string} id
 * @param {number} cantidad
 */
export const restaurarStock = async (id, cantidad) => {
  const producto = await obtenerProductoPorId(id)
  return actualizarProducto(id, { stock: producto.stock + cantidad })
}

/**
 * Verifica si hay stock suficiente para un array de items.
 * @param {Array<{productoId: string, cantidad: number}>} items
 * @returns {Promise<{ok: boolean, faltantes: Array}>}
 */
export const verificarStock = async (items) => {
  const faltantes = []

  for (const item of items) {
    const producto = await obtenerProductoPorId(item.productoId)
    if (!producto || producto.stock < item.cantidad) {
      faltantes.push({
        productoId: item.productoId,
        nombre:     producto?.nombre ?? 'Desconocido',
        solicitado: item.cantidad,
        disponible: producto?.stock ?? 0,
      })
    }
  }

  return { ok: faltantes.length === 0, faltantes }
}
