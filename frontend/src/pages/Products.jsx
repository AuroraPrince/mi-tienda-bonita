export default function Products() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Nuestros Productos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Aquí irán los productos del backend */}
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    </div>
  )
}
