import { useParams } from 'react-router-dom'
import { useProductoDetalle } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import ProductDetail from '../components/products/ProductDetail'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { producto, cargando, error } = useProductoDetalle(id)
  const { agregar } = useCart()

  const handleAgregarCarrito = ({ id: productoId, talla, cantidad }) => {
    agregar({ productoId, talla, cantidad })
  }

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
        <div className="bg-white rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
          <div className="h-80 bg-gray-200" />
          <div className="p-8 space-y-4">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-10 bg-gray-200 rounded w-full mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">😕</span>
        <p className="text-gray-600 text-lg">Producto no encontrado</p>
        <p className="text-gray-400 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return <ProductDetail producto={producto} onAgregarCarrito={handleAgregarCarrito} />
}
