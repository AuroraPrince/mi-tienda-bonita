import { useState, useEffect, useCallback } from 'react'
import { getProducts, getProductById } from '../services/product.service'

// Hook para listar productos con filtros
export function useProducts(filtrosIniciales = {}) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState(filtrosIniciales)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [paginaActual, setPaginaActual] = useState(1)

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await getProducts({ ...filtros, pagina: paginaActual })
      setProductos(data.productos ?? data)
      setTotalPaginas(data.totalPaginas ?? 1)
    } catch (err) {
      setError('No se pudieron cargar los productos. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [filtros, paginaActual])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros)
    setPaginaActual(1) // Volver a la primera página al filtrar
  }

  return {
    productos,
    cargando,
    error,
    filtros,
    actualizarFiltros,
    totalPaginas,
    paginaActual,
    setPaginaActual,
    recargar: cargarProductos,
  }
}

// Hook para obtener un solo producto por ID
export function useProductoDetalle(id) {
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      try {
        setCargando(true)
        setError(null)
        const data = await getProductById(id)
        setProducto(data)
      } catch (err) {
        setError('No se encontró el producto.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  return { producto, cargando, error }
}
