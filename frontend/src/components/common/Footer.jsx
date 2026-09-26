import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Marca */}
        <div>
          <h3 className="text-white text-lg font-bold mb-2">⚽ Mi Tienda Cleats</h3>
          <p className="text-sm text-gray-400">
            Los mejores botines y zapatillas deportivas con envío a domicilio.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-semibold mb-2">Navegación</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link to="/productos" className="hover:text-white transition-colors">Productos</Link></li>
            <li><Link to="/carrito" className="hover:text-white transition-colors">Carrito</Link></li>
            <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-white font-semibold mb-2">Contacto</h4>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            <li>📧 tienda@cleats.com</li>
            <li>📱 WhatsApp disponible</li>
            <li>🕐 Lun - Sáb: 9am - 6pm</li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Mi Tienda Cleats. Todos los derechos reservados.
      </div>
    </footer>
  )
}
