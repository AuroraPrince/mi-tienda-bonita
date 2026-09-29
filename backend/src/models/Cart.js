// ─── Cart.js ──────────────────────────────────────────────────────────────────
// Model de Carrito de compras.
// Cada usuario tiene un único carrito activo. Los items se almacenan en una
// tabla separada con referencia al carrito.
//
// Estructura esperada en Supabase:
// tabla: carts
//   id          uuid        PK default gen_random_uuid()
//   user_id     uuid        FK → profiles.id  unique (un carrito por usuario)
//   created_at  timestamptz default now()
//   updated_at  timestamptz default now()
//
// tabla: cart_items
//   id          uuid        PK default gen_random_uuid()
//   cart_id     uuid        FK → carts.id  on delete cascade
//   product_id  uuid        FK → products.id
//   cantidad    integer     not null  check (cantidad > 0)
//   talla       text        nullable
//   created_at  timestamptz default now()
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from '../config/supabase.js'
import { calcularTotal } from '../utils/helpers.js'

const TABLA_CARRITO = 'carts'
const TABLA_ITEMS   = 'cart_items'

// ─────────────────────────────────────────────────────────────────────────────
// CARRITO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene el carrito activo del usuario con sus items y datos del producto.
 * Si no existe lo crea automáticamente.
 * @param {string} userId
 */
export const obtenerOCrearCarrito = async (userId) => {
  // Intentar obtener carrito existente
  let { data: carrito, error } = await supabaseAdmin
    .from(TABLA_CARRITO)
    .select('*')
    .eq('user_id', userId)
    .single()

  // Si no existe, crearlo
  if (error?.code === 'PGRST116') {
    const { data: nuevo, error: errCrear } = await supabaseAdmin
      .from(TABLA_CARRITO)
      .insert({ user_id: userId })
      .select()
      .single()

    if (errCrear) throw new Error(errCrear.message)
    carrito = nuevo
  } else if (error) {
    throw new Error(error.message)
  }

  return carrito
}

/**
 * Obtiene el carrito completo con items + datos del producto anidados.
 * @param {string} userId
 */
export const obtenerCarritoCompleto = async (userId) => {
  const carrito = await obtenerOCrearCarrito(userId)

  const { data: items, error } = await supabaseAdmin
    .from(TABLA_ITEMS)
    .select(`
      id,
      cantidad,
      talla,
      created_at,
      producto:product_id (
        id,
        nombre,
        precio,
        imagen_url,
        stock,
        marca,
        categoria
      )
    `)
    .eq('cart_id', carrito.id)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  const itemsFormateados = (items ?? []).map((item) => ({
    id:         item.id,
    cantidad:   item.cantidad,
    talla:      item.talla,
    producto:   item.producto,
    subtotal:   Number(item.producto?.precio ?? 0) * item.cantidad,
  }))

  return {
    carritoId: carrito.id,
    userId,
    items:     itemsFormateados,
    total:     calcularTotal(
      itemsFormateados.map((i) => ({ precio: i.producto?.precio ?? 0, cantidad: i.cantidad }))
    ),
    totalItems: itemsFormateados.reduce((acc, i) => acc + i.cantidad, 0),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ITEMS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agrega un producto al carrito.
 * Si el producto+talla ya existe, suma la cantidad.
 * @param {string} userId
 * @param {object} item
 * @param {string} item.productoId
 * @param {number} item.cantidad
 * @param {string} [item.talla]
 */
export const agregarItem = async (userId, { productoId, cantidad, talla }) => {
  const carrito = await obtenerOCrearCarrito(userId)

  // Verificar si ya existe el mismo producto+talla en el carrito
  let query = supabaseAdmin
    .from(TABLA_ITEMS)
    .select('*')
    .eq('cart_id', carrito.id)
    .eq('product_id', productoId)

  if (talla) query = query.eq('talla', talla)
  else       query = query.is('talla', null)

  const { data: existente } = await query.maybeSingle()

  if (existente) {
    // Sumar cantidad al item existente
    const { data, error } = await supabaseAdmin
      .from(TABLA_ITEMS)
      .update({ cantidad: existente.cantidad + cantidad })
      .eq('id', existente.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  // Insertar nuevo item
  const { data, error } = await supabaseAdmin
    .from(TABLA_ITEMS)
    .insert({
      cart_id:    carrito.id,
      product_id: productoId,
      cantidad,
      talla:      talla ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Actualizar timestamp del carrito
  await supabaseAdmin
    .from(TABLA_CARRITO)
    .update({ updated_at: new Date().toISOString() })
    .eq('id', carrito.id)

  return data
}

/**
 * Actualiza la cantidad de un item del carrito.
 * Si la cantidad es 0 o menos, elimina el item.
 * @param {string} itemId   - ID de cart_items
 * @param {number} cantidad
 */
export const actualizarCantidadItem = async (itemId, cantidad) => {
  if (cantidad <= 0) return eliminarItem(itemId)

  const { data, error } = await supabaseAdmin
    .from(TABLA_ITEMS)
    .update({ cantidad })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Elimina un item del carrito por su ID.
 * @param {string} itemId
 */
export const eliminarItem = async (itemId) => {
  const { error } = await supabaseAdmin
    .from(TABLA_ITEMS)
    .delete()
    .eq('id', itemId)

  if (error) throw new Error(error.message)
  return { eliminado: true }
}

/**
 * Vacía completamente el carrito de un usuario.
 * Se usa tras confirmar una orden.
 * @param {string} userId
 */
export const vaciarCarrito = async (userId) => {
  const carrito = await obtenerOCrearCarrito(userId)

  const { error } = await supabaseAdmin
    .from(TABLA_ITEMS)
    .delete()
    .eq('cart_id', carrito.id)

  if (error) throw new Error(error.message)

  await supabaseAdmin
    .from(TABLA_CARRITO)
    .update({ updated_at: new Date().toISOString() })
    .eq('id', carrito.id)

  return { vaciado: true }
}

/**
 * Devuelve la cantidad total de items en el carrito (suma de cantidades).
 * @param {string} userId
 */
export const contarItems = async (userId) => {
  const carrito = await obtenerOCrearCarrito(userId)

  const { data, error } = await supabaseAdmin
    .from(TABLA_ITEMS)
    .select('cantidad')
    .eq('cart_id', carrito.id)

  if (error) throw new Error(error.message)

  return (data ?? []).reduce((acc, item) => acc + item.cantidad, 0)
}
