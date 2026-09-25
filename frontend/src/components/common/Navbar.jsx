import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">Mi Tienda</Link>
        <ul className="flex gap-6">
          <li><Link to="/productos" className="hover:text-accent">Productos</Link></li>
          <li><Link to="/carrito" className="hover:text-accent">🛒 Carrito</Link></li>
          <li><Link to="/contacto" className="hover:text-accent">Contacto</Link></li>
        </ul>
      </div>
    </nav>
  )
}
