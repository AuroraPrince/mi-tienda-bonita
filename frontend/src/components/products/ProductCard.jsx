export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
      <h3 className="text-lg font-bold mt-4">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <button className="mt-4 w-full bg-primary text-white py-2 rounded hover:bg-blue-600">
        Agregar al carrito
      </button>
    </div>
  )
}
