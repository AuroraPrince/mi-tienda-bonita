// ─── Order.js ─────────────────────────────────────────────────────────────────
// Model de Orden de compra.
//
// Estructura esperada en Supabase:
// tabla: orders
//   id                uuid        PK default gen_random_uuid()
//   user_id           uuid        FK → profiles.id
//   estado            text        default 'pendiente'
//                                 → 'pendiente' | 'pagado' | 'enviado'
//                                    | 'entregado' | 'cancelado'
//   total             numeric     not null
//   payment_intent_id text        nullable (Stripe)
//   envio             jsonb       nullable  { nombre, direccion, ciudad, ... }
//   created_at        timestamptz default now()
//   updated_at        timestamptz default now()
//
// tabla: order_items
//   id          uuid     PK default gen_random_uuid()
//   order_id    uuid     FK → orders.id  on delete cascade
//   product_id  uuid     FK → products.id
//   nombre      text     (snapshot del nombre al momento de la compra)
//   precio      numeric  (snapshot del precio al momento de la compra)
//   cantidad    integer
//   talla       text     nullable
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from '../config/supabase.js'
import { limpiarObjeto } from '../utils/helpers.js'

const TABLA_ORDENES = 'orders'
const TABLA_ITEMS   = 'order_items'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

export const ESTADOS_ORDEN = Object.freeze({
  PENDIENTE:  'pendiente',
  PAGADO:     'pagado',
  ENVIADO:    'enviado',
  ENTREGADO:  'entregado',
  CANCELADO:  'cancelado',
})

// Transiciones válidas de estado
export const TRANSICIONES_VALIDAS = Object.freeze({
  pendiente: ['pagado', 'cancelado'],
  pagado:    ['enviado', 'cancelado'],
  enviado:   ['entregado'],
  entregado: [],
  cancelado: [],
})

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene una orden por su ID con sus items anidados.
 * @param {string} ordenId
 */
export const obtenerOrdenPorId = async (ordenId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA_ORDENES)
    .select(`
      *,
      items:order_items (
        id,
        product_id,
        nombre,
        precio,
        cantidad,
        talla
      ),
      usuario:user_id (
        id,
        nombre,
        email
      )
    `)
    .eq('id', ordenId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Lista las órdenes de un usuario con paginación.
 * @param {string} userId
 * @param {object} opciones
 * @param {number} [opciones.pagina]
 * @param {number} [opciones.limite]
 */
export const listarOrdenesPorUsuario = async (userId, { pagina = 1, limite = 10 } = {}) => {
  const desde = (pagina - 1) * limite
  const hasta = desde + limite - 1

  const { data, error, count } = await supabaseAdmin
    .from(TABLA_ORDENES)
    .select('*, items:order_items(*)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(desde, hasta)

  if (error) throw new Error(error.message)

  return {
    ordenes: data,
    total: count ?? 0,
    totalPaginas: Math.ceil((count ?? 0) / limite),
    pagina,
  }
}

/**
 * Lista todas las órdenes (admin) con filtros opcionales.
 * @param {object} opciones
 * @param {string} [opciones.estado]
 * @param {number} [opciones.pagina]
 * @param {number} [opciones.limite]
 */
export const listarTodasLasOrdenes = async ({ estado, pagina = 1, limite = 20 } = {}) => {
  const desde = (pagina - 1) * limite
  const hasta = desde + limite - 1

  let query = supabaseAdmin
    .from(TABLA_ORDENES)
    .select(`
      *,
      items:order_items (*),
      usuario:user_id ( id, nombre, email )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(desde, hasta)

  if (estado) query = query.eq('estado', estado)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    ordenes: data,
    total: count ?? 0,
    totalPaginas: Math.ceil((count ?? 0) / limite),
    pagina,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ESCRITURA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea una nueva orden con sus items.
 * @param {object} datos
 * @param {string}  datos.userId
 * @param {number}  datos.total
 * @param {string}  [datos.paymentIntentId]
 * @param {object}  [datos.envio]
 * @param {Array}   datos.items  - [{ productoId, nombre, precio, cantidad, talla }]
 */
export const crearOrden = async ({ userId, total, paymentIntentId, envio, items }) => {
  // 1. Crear la orden
  const { data: orden, error: errOrden } = await supabaseAdmin
    .from(TABLA_ORDENES)
    .insert(limpiarObjeto({
      user_id:           userId,
      total,
      estado:            ESTADOS_ORDEN.PENDIENTE,
      payment_intent_id: paymentIntentId ?? null,
      envio:             envio ?? null,
      created_at:        new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    }))
    .select()
    .single()

  if (errOrden) throw new Error(errOrden.message)

  // 2. Insertar los items con snapshot de precio y nombre
  const itemsPayload = items.map((item) => ({
    order_id:   orden.id,
    product_id: item.productoId,
    nombre:     item.nombre,
    precio:     item.precio,
    cantidad:   item.cantidad,
    talla:      item.talla ?? null,
  }))

  const { error: errItems } = await supabaseAdmin
    .from(TABLA_ITEMS)
    .insert(itemsPayload)

  if (errItems) throw new Error(errItems.message)

  return obtenerOrdenPorId(orden.id)
}

/**
 * Actualiza el estado de una orden validando la transición.
 * @param {string} ordenId
 * @param {string} nuevoEstado
 */
export const actualizarEstadoOrden = async (ordenId, nuevoEstado) => {
  const orden = await obtenerOrdenPorId(ordenId)

  const transicionesPermitidas = TRANSICIONES_VALIDAS[orden.estado] ?? []
  if (!transicionesPermitidas.includes(nuevoEstado)) {
    throw new Error(
      `Transición inválida: "${orden.estado}" → "${nuevoEstado}". ` +
      `Permitidas: ${transicionesPermitidas.join(', ') || 'ninguna'}`
    )
  }

  const { data, error } = await supabaseAdmin
    .from(TABLA_ORDENES)
    .update({
      estado:     nuevoEstado,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ordenId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Marca una orden como pagada (tras confirmar el pago con Stripe).
 * @param {string} paymentIntentId
 */
export const marcarComoPagada = async (paymentIntentId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLA_ORDENES)
    .update({
      estado:     ESTADOS_ORDEN.PAGADO,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntentId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
