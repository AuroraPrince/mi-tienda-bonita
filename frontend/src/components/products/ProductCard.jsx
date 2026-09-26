import { Link } from 'react-router-dom'

export default function ProductCard({ producto }) {
  const { id, nombre, precio, imagen, marca, categoria, tallas = [] } = producto

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Imagen */}
      <Link to={`/productos/${id}`}>
        <div className="relative overflow-hidden h-56 bg-gray-100">
          <img
            src={imagen || '/placeholder-producto.png'}
            alt={nombre}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {categoria && (
            <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              {categoria}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {marca && (
          <span className="text-xs text-gray-400 uppercase tracking-wide">{marca}</span>
        )}
        <Link to={`/productos/${id}`}>
          <h3 className="text-gray-800 font-semibold mt-1 hover:text-green-600 transition-colors line-clamp-2">
            {nombre}
          </h3>
        </Link>

        {/* Tallas disponibles */}
        {tallas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tallas.slice(0, 5).map((talla) => (
              <span key={talla} className="text-xs border border-gray-200 rounded px-2 py-0.5 text-gray-600">
                {talla}
              </span>
            ))}
            {tallas.length > 5 && (
              <span className="text-xs text-gray-400">+{tallas.length - 5}</span>
            )}
          </div>
        )}

        {/* Precio y botón */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            ${Number(precio).toLocaleString('es-CO')}
          </span>
          <Link
            to={`/productos/${id}`}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </div>
  )
}
