import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import WhatsAppButton from './components/common/WhatsAppButton'

// Páginas públicas
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetailPage from './pages/ProductDetailPage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'

// Páginas de autenticación
import Login from './components/auth/Login'
import Register from './components/auth/Register'

function App() {
  return (
    <Router>
      <Header />
      <main className="min-h-screen">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/productos/:id" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contacto" element={<Contact />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </Router>
  )
}

export default App
