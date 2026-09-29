import { ENVIO, PAGINACION } from './constants'

// ─── Carrito / Precios ─────────────────────────────────────────────────────

/**
 * Calcula el costo de envío según el subtotal del carrito.
 * calcularEnvio(180000) → 15000
 * calcularEnvio(250000) → 0
 */
export const calcularEnvio = (subtotal) =>
  subtotal >= ENVIO.GRATIS_DESDE ? 0 : ENVIO.COSTO_ESTANDAR

/**
 * Calcula el total final (subtotal + envío).
 */
export const calcularTotal = (subtotal) => subtotal + calcularEnvio(subtotal)

/**
 * Indica cuánto le falta al usuario para obtener envío gratis.
 * faltaParaEnvioGratis(160000) → 40000
 * faltaParaEnvioGratis(250000) → 0
 */
export const faltaParaEnvioGratis = (subtotal) =>
  Math.max(0, ENVIO.GRATIS_DESDE - subtotal)

// ─── Paginación ────────────────────────────────────────────────────────────

/**
 * Calcula el rango de items para la página actual.
 * rangoPagina(2, 12) → { desde: 12, hasta: 24 }
 */
export const rangoPagina = (pagina, porPagina = PAGINACION.PRODUCTOS_POR_PAGINA) => ({
  desde: (pagina - 1) * porPagina,
  hasta: pagina * porPagina,
})

/**
 * Calcula el total de páginas dado un total de items.
 * totalPaginas(50, 12) → 5
 */
export const totalPaginas = (totalItems, porPagina = PAGINACION.PRODUCTOS_POR_PAGINA) =>
  Math.max(1, Math.ceil(totalItems / porPagina))

/**
 * Genera un array de números de página para mostrar en el paginador.
 * Siempre muestra primera, última y las páginas cercanas a la actual.
 * generarPaginas(5, 10) → [1, '...', 3, 4, 5, 6, 7, '...', 10]
 */
export const generarPaginas = (paginaActual, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const paginas = new Set([1, total, paginaActual])
  for (let d = -2; d <= 2; d++) {
    const p = paginaActual + d
    if (p > 1 && p < total) paginas.add(p)
  }

  const ordenadas = [...paginas].sort((a, b) => a - b)
  const resultado = []
  for (let i = 0; i < ordenadas.length; i++) {
    if (i > 0 && ordenadas[i] - ordenadas[i - 1] > 1) resultado.push('...')
    resultado.push(ordenadas[i])
  }
  return resultado
}

// ─── Arrays / Objetos ──────────────────────────────────────────────────────

/**
 * Agrupa un array de objetos por una clave.
 * agruparPor([{cat:'A',...},{cat:'B',...},{cat:'A',...}], 'cat')
 * → { A: [...], B: [...] }
 */
export const agruparPor = (array, clave) =>
  array.reduce((acc, item) => {
    const key = item[clave]
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

/**
 * Elimina duplicados de un array por una clave.
 * unicosPor([{id:1},{id:2},{id:1}], 'id') → [{id:1},{id:2}]
 */
export const unicosPor = (array, clave) => {
  const vistos = new Set()
  return array.filter((item) => {
    if (vistos.has(item[clave])) return false
    vistos.add(item[clave])
    return true
  })
}

/**
 * Ordena un array de objetos por una clave de forma ascendente o descendente.
 * ordenarPor(productos, 'precio', 'asc')
 */
export const ordenarPor = (array, clave, direccion = 'asc') =>
  [...array].sort((a, b) => {
    if (a[clave] < b[clave]) return direccion === 'asc' ? -1 : 1
    if (a[clave] > b[clave]) return direccion === 'asc' ? 1 : -1
    return 0
  })

// ─── Strings ───────────────────────────────────────────────────────────────

/**
 * Convierte un texto a slug URL-amigable.
 * toSlug('Tenis Hombre Nike') → 'tenis-hombre-nike'
 */
export const toSlug = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

/**
 * Genera las iniciales de un nombre (máx. 2 letras).
 * iniciales('Juan Pérez') → 'JP'
 * iniciales('Ana')        → 'A'
 */
export const iniciales = (nombre) => {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

// ─── Async / Red ───────────────────────────────────────────────────────────

/**
 * Retraso asíncrono (útil para tests y skeleton loaders).
 * await esperar(500)
 */
export const esperar = (ms) => new Promise((res) => setTimeout(res, ms))

/**
 * Reintenta una función async hasta N veces si lanza error.
 * const data = await reintentar(() => fetchDatos(), 3)
 */
export const reintentar = async (fn, intentos = 3, delayMs = 500) => {
  for (let i = 0; i < intentos; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === intentos - 1) throw err
      await esperar(delayMs * (i + 1))
    }
  }
}

// ─── Almacenamiento local ──────────────────────────────────────────────────

/**
 * Guarda un valor en localStorage serializando a JSON.
 * Falla silenciosamente si localStorage no está disponible.
 */
export const guardarLocal = (clave, valor) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Safari en modo privado puede bloquear localStorage
  }
}

/**
 * Lee y deserializa un valor de localStorage.
 * Retorna `porDefecto` si no existe o falla el parseo.
 */
export const leerLocal = (clave, porDefecto = null) => {
  try {
    const item = localStorage.getItem(clave)
    return item ? JSON.parse(item) : porDefecto
  } catch {
    return porDefecto
  }
}

/**
 * Elimina una clave de localStorage.
 */
export const eliminarLocal = (clave) => {
  try {
    localStorage.removeItem(clave)
  } catch {
    // silencioso
  }
}

// ─── Miscelánea ────────────────────────────────────────────────────────────

/**
 * Genera un ID único simple (no criptográfico).
 * Útil para keys de listas cuando no hay ID del servidor.
 */
export const generarId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Detecta si el dispositivo es móvil por ancho de pantalla.
 */
export const esMobil = () =>
  typeof window !== 'undefined' && window.innerWidth < 768

/**
 * Hace scroll suave al top de la página.
 */
export const scrollAlTop = () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
