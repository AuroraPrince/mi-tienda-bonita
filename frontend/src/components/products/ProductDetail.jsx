import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProductDetail({ producto, onAgregarCarrito }) {
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)
  const navigate = useNavigate()

  const { nombre, precio, imagen, marca, categoria, descripcion, tallas = [] } = producto

  const handleAgregar = () => {
    if (!tallaSeleccionada) return
    onAgregarCarrito({ ...producto, talla: tallaSeleccionada, cantidad })
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Volver */}
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-green-600 text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Volver a productos
      </button>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Imagen */}
        <div className="bg-gray-100 flex items-center justify-center p-8">
          <img
            src={imagen || '/placeholder-producto.png'}
            alt={nombre}
            className="max-h-80 object-contain"
          />
        </div>

        {/* Info */}
        <div className="p-8 flex flex-col gap-4">
          {/* Marca y categoría */}
          <div className="flex items-center gap-2">
            {marca && (
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {marca}
              </span>
            )}
            {categoria && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                {categoria}
              </span>
            )}
          </div>

          {/* Nombre */}
          <h1 className="text-2xl font-bold text-gray-800">{nombre}</h1>

          {/* Precio */}
          <p className="text-3xl font-bold text-green-600">
            ${Number(precio).toLocaleString('es-CO')}
          </p>

          {/* Descripción */}
          {descripcion && (
            <p className="text-gray-500 text-sm leading-relaxed">{descripcion}</p>
          )}

          {/* Tallas */}
          {tallas.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Talla: {tallaSeleccionada ? <span className="text-green-600">{tallaSeleccionada}</span> : <span className="text-red-400">Selecciona una talla</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {tallas.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTallaSeleccionada(t)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      tallaSeleccionada === t
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-200 text-gray-600 hover:border-green-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Cantidad:</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                −
              </button>
              <span className="px-4 py-1 text-gray-800 font-medium">{cantidad}</span>
              <button
                onClick={() => setCantidad((c) => c + 1)}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Botón agregar al carrito */}
          <button
            onClick={handleAgregar}
            disabled={!tallaSeleccionada}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
              agregado
                ? 'bg-green-500 scale-95'
                : tallaSeleccionada
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {agregado ? '✓ Agregado al carrito' : '🛒 Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}
