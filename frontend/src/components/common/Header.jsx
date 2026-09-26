import { Link } from 'react-router-dom'
import Navbar from './Navbar'

export default function Header() {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <span className="text-xl font-bold text-gray-800">
            Mi Tienda <span className="text-green-600">Cleats</span>
          </span>
        </Link>

        {/* Navbar */}
        <Navbar />
      </div>
    </header>
  )
}
