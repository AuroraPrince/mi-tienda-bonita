import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'

const ENVIO_GRATIS_DESDE = 200000

export default function CartSummary() {
  const { totalItems, totalPrecio, vaciar } = useCart()
  const navigate = useNavigate()

  const envio = totalPrecio >= ENVIO_GRATIS_DESDE ? 0 : 15000
  const total = totalPrecio + envio
  const faltaParaEnvioGratis = ENVIO_GRATIS_DESDE - totalPrecio

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800 border-b pb-3">
        Resumen del pedido
      </h2>

      {/* Barra de envío gratis */}
      {envio > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">
            Te faltan{' '}
            <span className="font-semibold text-green-600">
              ${faltaParaEnvioGratis.toLocaleString('es-CO')}
            </span>{' '}
            para envío gratis
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalPrecio / ENVIO_GRATIS_DESDE) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {envio === 0 && (
        <p className="text-xs text-green-600 font-medium">🎉 ¡Tienes envío gratis!</p>
      )}

      {/* Desglose */}
      <div className="space-y-2 text-sm text-gray-600">
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
      </div>

      {/* Total */}
      <div className="flex justify-between items-center border-t pt-3 font-bold text-gray-800 text-base">
        <span>Total</span>
        <span className="text-xl text-green-600">${total.toLocaleString('es-CO')}</span>
      </div>

      {/* Botones */}
      <button
        onClick={() => navigate('/checkout')}
        disabled={totalItems === 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Proceder al pago →
      </button>

      <button
        onClick={() => navigate('/productos')}
        className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-xl text-sm transition-colors"
      >
        ← Seguir comprando
      </button>

      {totalItems > 0 && (
        <button
          onClick={vaciar}
          className="text-xs text-red-400 hover:text-red-600 transition-colors text-center"
        >
          Vaciar carrito
        </button>
      )}
    </div>
  )
}
