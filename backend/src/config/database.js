// ─── database.js ──────────────────────────────────────────────────────────────
// Helpers de acceso a la base de datos a través del cliente admin de Supabase.
// Centraliza las operaciones CRUD genéricas para que los services no repitan
// la misma lógica de manejo de errores de Supabase.
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from './supabase.js'

// ── Helper interno: lanza error si Supabase devuelve uno ─────────────────────
function verificar({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

// ── Leer ─────────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los registros de una tabla con filtros y paginación opcionales.
 * @param {string} tabla
 * @param {object} opciones
 * @param {object}  [opciones.filtros]   - { columna: valor } aplicados con .eq()
 * @param {string}  [opciones.orden]     - nombre de la columna para ordenar
 * @param {boolean} [opciones.ascendente]
 * @param {number}  [opciones.pagina]    - 1-indexed
 * @param {number}  [opciones.limite]
 * @param {string}  [opciones.seleccionar] - columnas a seleccionar (por defecto '*')
 */
export const obtenerTodos = async (tabla, {
  filtros = {},
  orden = 'created_at',
  ascendente = false,
  pagina = 1,
  limite = 20,
  seleccionar = '*',
} = {}) => {
  const desde = (pagina - 1) * limite
  const hasta = desde + limite - 1

  let query = supabaseAdmin
    .from(tabla)
    .select(seleccionar, { count: 'exact' })
    .order(orden, { ascending: ascendente })
    .range(desde, hasta)

  for (const [col, val] of Object.entries(filtros)) {
    if (val !== undefined && val !== null && val !== '') {
      query = query.eq(col, val)
    }
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    datos: data,
    total: count ?? 0,
    totalPaginas: Math.ceil((count ?? 0) / limite),
    pagina,
  }
}

/**
 * Obtiene un registro por su ID.
 * @param {string} tabla
 * @param {string|number} id
 * @param {string} [seleccionar]
 */
export const obtenerPorId = async (tabla, id, seleccionar = '*') => {
  const { data, error } = await supabaseAdmin
    .from(tabla)
    .select(seleccionar)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Escribir ──────────────────────────────────────────────────────────────────

/**
 * Inserta un registro y devuelve el registro creado.
 * @param {string} tabla
 * @param {object} datos
 */
export const insertar = async (tabla, datos) => {
  const { data, error } = await supabaseAdmin
    .from(tabla)
    .insert(datos)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Actualiza un registro por ID y devuelve el registro actualizado.
 * @param {string} tabla
 * @param {string|number} id
 * @param {object} datos
 */
export const actualizar = async (tabla, id, datos) => {
  const { data, error } = await supabaseAdmin
    .from(tabla)
    .update(datos)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Elimina un registro por ID.
 * @param {string} tabla
 * @param {string|number} id
 */
export const eliminar = async (tabla, id) => {
  const { error } = await supabaseAdmin
    .from(tabla)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { eliminado: true }
}

// ── Verificar conexión ────────────────────────────────────────────────────────
/**
 * Ping simple para comprobar que Supabase responde.
 * Útil al arrancar el servidor.
 */
export const verificarConexion = async () => {
  const { error } = await supabaseAdmin
    .from('products')
    .select('id')
    .limit(1)

  if (error) throw new Error(`Error de conexión con Supabase: ${error.message}`)
  return true
}

export default { obtenerTodos, obtenerPorId, insertar, actualizar, eliminar, verificarConexion }
