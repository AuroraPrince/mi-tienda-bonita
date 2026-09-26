import { useCart } from '../cart/CartContext'

const ENVIO_GRATIS_DESDE = 200000

export default function OrderSummary() {
  const { items, totalItems, totalPrecio } = useCart()

  const envio  = totalPrecio >= ENVIO_GRATIS_DESDE ? 0 : 15000
  const total  = totalPrecio + envio

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">
        Resumen del pedido
      </h2>

      {/* Lista de items */}
      <ul className="space-y-3 mb-4">
        {items.map((item) => {
          const { nombre, precio, imagen } = item.productos ?? {}
          const subtotal = item.cantidad * (precio ?? 0)
          return (
            <li key={item.id} className="flex items-center gap-3">
              {/* Imagen con badge de cantidad */}
              <div className="relative w-12 h-12 shrink-0">
                <img
                  src={imagen || '/placeholder-producto.png'}
                  alt={nombre}
                  className="w-full h-full object-cover rounded-lg bg-gray-100"
                />
                <span className="absolute -top-1.5 -right-1.5 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.cantidad}
                </span>
              </div>

              {/* Nombre y talla */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{nombre}</p>
                <p className="text-xs text-gray-400">Talla: {item.talla}</p>
              </div>

              {/* Subtotal */}
              <p className="text-sm font-semibold text-gray-800 shrink-0">
                ${subtotal.toLocaleString('es-CO')}
              </p>
            </li>
          )
        })}
      </ul>

      {/* Desglose de costos */}
      <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
          <span>${totalPrecio.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span className={envio === 0 ? 'text-green-600 font-medium' : ''}>
            {envio === 0 ? 'Gratis' : `$${envio.toLocaleString('es-CO')}`}
          </span>
        </div>
        <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t">
          <span>Total</span>
          <span className="text-green-600 text-lg">${total.toLocaleString('es-CO')}</span>
        </div>
      </div>
    </div>
  )
}
