import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
} from '../../services/cart.service'

export const CartContext = createContext(null)

export function CartProvider({ children, userId }) {
  const [items, setItems]       = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)

  // ── Cargar carrito desde Supabase ──────────────────────────────────────────
  const cargarCarrito = useCallback(async () => {
    if (!userId) { setItems([]); return }
    try {
      setCargando(true)
      setError(null)
      const data = await obtenerCarrito(userId)
      setItems(data)
    } catch {
      setError('No se pudo cargar el carrito.')
    } finally {
      setCargando(false)
    }
  }, [userId])

  useEffect(() => { cargarCarrito() }, [cargarCarrito])

  // ── Agregar producto ────────────────────────────────────────────────────────
  const agregar = async ({ productoId, talla, cantidad = 1 }) => {
    if (!userId) return
    try {
      await agregarAlCarrito({ userId, productoId, talla, cantidad })
      await cargarCarrito()
    } catch {
      setError('No se pudo agregar el producto.')
    }
  }

  // ── Actualizar cantidad ─────────────────────────────────────────────────────
  const actualizar = async (itemId, cantidad) => {
    try {
      await actualizarCantidad({ itemId, cantidad })
      setItems((prev) =>
        cantidad <= 0
          ? prev.filter((i) => i.id !== itemId)
          : prev.map((i) => (i.id === itemId ? { ...i, cantidad } : i))
      )
    } catch {
      setError('No se pudo actualizar la cantidad.')
    }
  }

  // ── Eliminar item ───────────────────────────────────────────────────────────
  const eliminar = async (itemId) => {
    try {
      await eliminarDelCarrito(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch {
      setError('No se pudo eliminar el producto.')
    }
  }

  // ── Vaciar carrito ──────────────────────────────────────────────────────────
  const vaciar = async () => {
    if (!userId) return
    try {
      await vaciarCarrito(userId)
      setItems([])
    } catch {
      setError('No se pudo vaciar el carrito.')
    }
  }

  // ── Totales derivados ───────────────────────────────────────────────────────
  const totalItems  = items.reduce((acc, i) => acc + i.cantidad, 0)
  const totalPrecio = items.reduce((acc, i) => acc + i.cantidad * (i.productos?.precio ?? 0), 0)

  return (
    <CartContext.Provider
      value={{
        items,
        cargando,
        error,
        totalItems,
        totalPrecio,
        agregar,
        actualizar,
        eliminar,
        vaciar,
        recargar: cargarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook directo para consumir el contexto
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
