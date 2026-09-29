// ─── helpers.js ───────────────────────────────────────────────────────────────
// Funciones puras y reutilizables sin dependencias internas del proyecto.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// RESPUESTAS HTTP ESTANDARIZADAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Respuesta de éxito.
 * @param {import('express').Response} res
 * @param {object} datos      - Payload a devolver
 * @param {string} [mensaje]
 * @param {number} [codigo]   - HTTP status (200 por defecto)
 */
export const respuestaOk = (res, datos = {}, mensaje = 'OK', codigo = 200) => {
  return res.status(codigo).json({ ok: true, mensaje, ...datos })
}

/**
 * Respuesta de error.
 * @param {import('express').Response} res
 * @param {string} mensaje
 * @param {number} [codigo]   - HTTP status (400 por defecto)
 * @param {object} [extras]   - Datos adicionales opcionales
 */
export const respuestaError = (res, mensaje, codigo = 400, extras = {}) => {
  return res.status(codigo).json({ ok: false, mensaje, ...extras })
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINACIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construye el objeto de paginación para incluir en la respuesta.
 */
export const paginar = ({ total, pagina, limite }) => ({
  total,
  pagina,
  limite,
  totalPaginas: Math.ceil(total / limite),
  tieneSiguiente: pagina * limite < total,
  tieneAnterior: pagina > 1,
})

// ─────────────────────────────────────────────────────────────────────────────
// PRECIOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convierte pesos colombianos a centavos (para Stripe).
 * Stripe trabaja en la unidad más pequeña de la moneda.
 */
export const aCentavos = (precioCOP) => Math.round(Number(precioCOP) * 100)

/**
 * Convierte centavos de Stripe a pesos colombianos.
 */
export const deCentavos = (centavos) => Number(centavos) / 100

/**
 * Calcula el total de un array de items { precio, cantidad }.
 */
export const calcularTotal = (items = []) =>
  items.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0)

/**
 * Formatea un número como precio en COP.
 * Ej: 125000 → "$125.000"
 */
export const formatearPrecioCOP = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(valor)

// ─────────────────────────────────────────────────────────────────────────────
// STRINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera un slug URL-friendly a partir de un texto.
 * Ej: "Tenis Hombre Nike" → "tenis-hombre-nike"
 */
export const generarSlug = (texto) =>
  texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // elimina tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

/**
 * Capitaliza la primera letra de cada palabra.
 * Ej: "tenis hombre" → "Tenis Hombre"
 */
export const capitalizarPalabras = (texto) =>
  texto.replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Trunca un texto a un máximo de caracteres añadiendo "…".
 */
export const truncar = (texto, max = 100) =>
  texto.length > max ? `${texto.slice(0, max).trimEnd()}…` : texto

// ─────────────────────────────────────────────────────────────────────────────
// FECHAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Devuelve la fecha actual en formato ISO (UTC).
 */
export const ahora = () => new Date().toISOString()

/**
 * Comprueba si una fecha ISO está dentro del rango de días indicado.
 * Ej: estaEnRango('2026-09-25T...', 7) → true si es de los últimos 7 días
 */
export const estaEnRango = (fechaISO, dias) => {
  const fecha    = new Date(fechaISO)
  const limite   = new Date()
  limite.setDate(limite.getDate() - dias)
  return fecha >= limite
}

// ─────────────────────────────────────────────────────────────────────────────
// ARRAYS / OBJETOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Elimina las claves con valor undefined, null o '' de un objeto.
 * Útil para construir queries de actualización parcial.
 */
export const limpiarObjeto = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )

/**
 * Agrupa un array de objetos por el valor de una clave.
 * Ej: agruparPor(items, 'categoria')
 */
export const agruparPor = (array, clave) =>
  array.reduce((acc, item) => {
    const grupo = item[clave] ?? 'sin_grupo'
    if (!acc[grupo]) acc[grupo] = []
    acc[grupo].push(item)
    return acc
  }, {})

// ─────────────────────────────────────────────────────────────────────────────
// SEGURIDAD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrae el Bearer token del header Authorization.
 * Devuelve null si no existe o tiene formato incorrecto.
 */
export const extraerBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  return token || null
}
