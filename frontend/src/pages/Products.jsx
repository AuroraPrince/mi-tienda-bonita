import { useProducts } from '../hooks/useProducts'
import ProductList from '../components/products/ProductList'
import ProductFilter from '../components/products/ProductFilter'

export default function Products() {
  const {
    productos,
    cargando,
    error,
    filtros,
    actualizarFiltros,
    totalPaginas,
    paginaActual,
    setPaginaActual,
  } = useProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Nuestros Productos</h1>
        <p className="text-gray-500 mt-1">
          Encuentra los mejores botines y zapatillas deportivas
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filtros */}
        <aside className="w-full md:w-64 shrink-0">
          <ProductFilter filtros={filtros} onFiltrar={actualizarFiltros} />
        </aside>

        {/* Contenido principal */}
        <div className="flex-1">
          {/* Contador de resultados */}
          {!cargando && !error && (
            <p className="text-sm text-gray-400 mb-4">
              {productos.length} producto{productos.length !== 1 ? 's' : ''} encontrado{productos.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Lista */}
          <ProductList
            productos={productos}
            cargando={cargando}
            error={error}
          />

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPaginaActual(num)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    num === paginaActual
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
