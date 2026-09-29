import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../common/Header'
import Footer from '../common/Footer'
import WhatsAppButton from '../common/WhatsAppButton'

/**
 * Layout principal de la aplicación.
 *
 * Envuelve las rutas con Header + Footer + WhatsAppButton y se encarga de:
 *  - Hacer scroll al top en cada cambio de ruta
 *  - Renderizar <Outlet /> para las rutas anidadas (react-router v6+)
 *
 * Uso en App.jsx con rutas anidadas:
 *
 *   <Route element={<MainLayout />}>
 *     <Route path="/"           element={<Home />} />
 *     <Route path="/productos"  element={<Products />} />
 *     <Route path="/carrito"    element={<Cart />} />
 *     ...
 *   </Route>
 *
 * También acepta children directamente si se prefiere sin Outlet:
 *
 *   <MainLayout>
 *     <Home />
 *   </MainLayout>
 */
export default function MainLayout({ children, titulo }) {
  const { pathname } = useLocation()

  // Scroll al top en cada cambio de ruta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  // Actualizar el título del documento si se pasa la prop
  useEffect(() => {
    if (titulo) {
      document.title = `${titulo} | Mi Tienda Cleats`
    }
  }, [titulo])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ── Cabecera pegajosa ──────────────────────────────────────── */}
      <Header />

      {/* ── Contenido principal ────────────────────────────────────── */}
      <main className="flex-1">
        {/* Outlet para rutas anidadas en react-router */}
        {children ?? <Outlet />}
      </main>

      {/* ── Pie de página ──────────────────────────────────────────── */}
      <Footer />

      {/* ── Botón flotante de WhatsApp ─────────────────────────────── */}
      <WhatsAppButton />
    </div>
  )
}
