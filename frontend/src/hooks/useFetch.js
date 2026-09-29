import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook genérico para llamadas asíncronas con manejo de estado.
 *
 * @param {Function} fn        — función async que retorna los datos
 * @param {Object}   opciones
 *   @param {boolean}  opciones.inmediato   — ejecutar al montar (default: true)
 *   @param {any[]}    opciones.deps        — dependencias extra que re-ejecutan el fetch
 *   @param {any}      opciones.inicial     — valor inicial del estado `datos` (default: null)
 *
 * Retorna:
 *   - datos      → resultado de fn() o `inicial`
 *   - cargando   → true mientras la llamada está en curso
 *   - error      → mensaje de error (string) o null
 *   - ejecutar   → función para lanzar la llamada manualmente (acepta args)
 *   - reiniciar  → limpia datos y error, vuelve al estado inicial
 *
 * Uso básico (auto-ejecuta al montar):
 *   const { datos, cargando, error } = useFetch(() => getProducts())
 *
 * Uso manual (no auto-ejecuta):
 *   const { datos, cargando, ejecutar } = useFetch(crearOrden, { inmediato: false })
 *   // ...
 *   await ejecutar({ items, envio })
 *
 * Con dependencias (re-ejecuta cuando cambia el id):
 *   const { datos } = useFetch(() => getProductById(id), { deps: [id] })
 */
export function useFetch(fn, { inmediato = true, deps = [], inicial = null } = {}) {
  const [datos, setDatos]       = useState(inicial)
  const [cargando, setCargando] = useState(inmediato)
  const [error, setError]       = useState(null)

  // Ref para evitar actualizar estado en componentes desmontados
  const montado = useRef(true)
  useEffect(() => {
    montado.current = true
    return () => { montado.current = false }
  }, [])

  const ejecutar = useCallback(async (...args) => {
    try {
      if (montado.current) { setCargando(true); setError(null) }
      const resultado = await fn(...args)
      if (montado.current) setDatos(resultado)
      return resultado
    } catch (err) {
      const mensaje = err?.response?.data?.message ?? err?.message ?? 'Error inesperado.'
      if (montado.current) setError(mensaje)
      throw err
    } finally {
      if (montado.current) setCargando(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (inmediato) ejecutar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejecutar])

  const reiniciar = useCallback(() => {
    setDatos(inicial)
    setError(null)
    setCargando(false)
  }, [inicial])

  return { datos, cargando, error, ejecutar, reiniciar }
}

// ─── Variante para paginación ──────────────────────────────────────────────
/**
 * Extiende useFetch con soporte de paginación.
 *
 * @param {Function} fn  — recibe { pagina, ...filtros } y retorna { items, totalPaginas }
 * @param {Object}   filtrosIniciales
 *
 * Retorna todo lo de useFetch más:
 *   - pagina          → número de página actual
 *   - totalPaginas    → total de páginas
 *   - irAPagina(n)    → cambia a la página n
 *   - filtros         → filtros activos
 *   - setFiltros(f)   → actualiza filtros y vuelve a página 1
 *
 * Uso:
 *   const { datos, cargando, pagina, irAPagina, setFiltros } =
 *     useFetchPaginado((params) => getProducts(params), { categoria: 'deportivas' })
 */
export function useFetchPaginado(fn, filtrosIniciales = {}) {
  const [pagina, setPagina]           = useState(1)
  const [totalPaginas, setTotalPags]  = useState(1)
  const [filtros, setFiltrosState]    = useState(filtrosIniciales)

  const { datos, cargando, error, ejecutar, reiniciar } = useFetch(
    () => fn({ pagina, ...filtros }),
    { inmediato: true, deps: [pagina, filtros], inicial: [] }
  )

  // Extraer totalPaginas si el resultado lo trae
  useEffect(() => {
    if (datos?.totalPaginas != null) setTotalPags(datos.totalPaginas)
  }, [datos])

  const irAPagina = useCallback((n) => {
    setPagina(n)
  }, [])

  const setFiltros = useCallback((nuevosFiltros) => {
    setFiltrosState(nuevosFiltros)
    setPagina(1) // volver a la primera página al filtrar
  }, [])

  // Los items pueden venir como array directo o como datos.items/datos.productos
  const items = Array.isArray(datos)
    ? datos
    : datos?.items ?? datos?.productos ?? []

  return {
    datos: items,
    cargando,
    error,
    ejecutar,
    reiniciar,
    pagina,
    totalPaginas,
    irAPagina,
    filtros,
    setFiltros,
  }
}
