import { useCart } from '../../hooks/useCart'
import CartItem from './CartItem'
import CartSummary from './CartSummary'

export default function Cart() {
  const { items, cargando, error } = useCart()

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 bg-white rounded-xl p-4 shadow">
            <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">😕</span>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-400 text-sm mb-6">
          Agrega productos para comenzar tu compra
        </p>
        <a
          href="/productos"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-colors"
        >
          Ver productos
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tu Carrito</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de items */}
        <div className="flex-1 bg-white rounded-2xl shadow p-6">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Resumen */}
        <div className="w-full lg:w-80 shrink-0">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
