import ProductCard from './ProductCard'

export default function ProductList({ productos, cargando, error }) {
  // Estado de carga
  if (cargando) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow animate-pulse">
            <div className="h-56 bg-gray-200 rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-8 bg-gray-200 rounded w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">😕</span>
        <p className="text-gray-600 text-lg">{error}</p>
        <p className="text-gray-400 text-sm mt-1">Verifica tu conexión e intenta de nuevo.</p>
      </div>
    )
  }

  // Sin resultados
  if (!productos || productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-gray-600 text-lg">No se encontraron productos</p>
        <p className="text-gray-400 text-sm mt-1">Intenta con otros filtros.</p>
      </div>
    )
  }

  // Lista de productos
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}
