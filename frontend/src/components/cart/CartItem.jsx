import { useCart } from '../../hooks/useCart'

export default function CartItem({ item }) {
  const { actualizar, eliminar } = useCart()
  const { id, cantidad, talla, productos } = item
  const { nombre, precio, imagen, marca } = productos ?? {}

  const subtotal = cantidad * (precio ?? 0)

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Imagen */}
      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={imagen || '/placeholder-producto.png'}
          alt={nombre}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {marca && (
          <p className="text-xs text-gray-400 uppercase tracking-wide">{marca}</p>
        )}
        <p className="text-sm font-semibold text-gray-800 truncate">{nombre}</p>
        <p className="text-xs text-gray-500 mt-0.5">Talla: {talla}</p>

        {/* Cantidad */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => actualizar(id, cantidad - 1)}
            className="w-7 h-7 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center text-lg leading-none"
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className="text-sm font-medium w-5 text-center">{cantidad}</span>
          <button
            onClick={() => actualizar(id, cantidad + 1)}
            className="w-7 h-7 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center text-lg leading-none"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>

      {/* Precio y eliminar */}
      <div className="flex flex-col items-end justify-between shrink-0">
        <button
          onClick={() => eliminar(id)}
          className="text-gray-300 hover:text-red-500 transition-colors text-lg"
          aria-label="Eliminar producto"
        >
          ✕
        </button>
        <p className="text-sm font-bold text-gray-800">
          ${subtotal.toLocaleString('es-CO')}
        </p>
      </div>
    </div>
  )
}
