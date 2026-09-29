import { useState, useEffect } from 'react'
import { getTodasLasOrdenes } from '../../services/order.service'
import { getProducts } from '../../services/product.service'

// ─── Tarjeta de estadística ────────────────────────────────────────────────
function StatCard({ titulo, valor, icono, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-6 flex items-center gap-4 border-l-4 ${color}`}>
      <span className="text-4xl">{icono}</span>
      <div>
        <p className="text-sm text-gray-500">{titulo}</p>
        <p className="text-2xl font-bold text-gray-800">{valor}</p>
      </div>
    </div>
  )
}

// ─── Tabla de órdenes recientes ────────────────────────────────────────────
function OrdenesRecientes({ ordenes }) {
  const ESTADO_BADGE = {
    pendiente:  'bg-yellow-100 text-yellow-800',
    pagado:     'bg-blue-100 text-blue-800',
    enviado:    'bg-purple-100 text-purple-800',
    entregado:  'bg-green-100 text-green-800',
    cancelado:  'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Órdenes recientes</h2>
      {ordenes.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay órdenes registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.slice(0, 8).map((orden) => (
                <tr key={orden.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs text-gray-500">
                    #{String(orden.id).slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3 text-gray-700">
                    {orden.usuario?.email ?? orden.userId ?? '—'}
                  </td>
                  <td className="py-3 text-gray-700 font-medium">
                    ${Number(orden.total ?? 0).toLocaleString('es-CO')}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ESTADO_BADGE[orden.estado] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {orden.estado ?? 'desconocido'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-xs">
                    {orden.createdAt
                      ? new Date(orden.createdAt).toLocaleDateString('es-CO')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function Dashboard() {
  const [ordenes, setOrdenes]     = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        const [dataOrdenes, dataProductos] = await Promise.all([
          getTodasLasOrdenes({ limite: 50 }),
          getProducts({ limite: 100 }),
        ])
        setOrdenes(dataOrdenes?.ordenes ?? [])
        setProductos(dataProductos?.productos ?? [])
      } catch (err) {
        setError('No se pudieron cargar los datos del panel.')
        console.error(err)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  // ── Métricas derivadas ─────────────────────────────────────────────────
  const totalVentas = ordenes
    .filter((o) => o.estado !== 'cancelado')
    .reduce((acc, o) => acc + Number(o.total ?? 0), 0)

  const ordenesPendientes = ordenes.filter((o) => o.estado === 'pendiente').length
  const ordenesHoy = ordenes.filter((o) => {
    if (!o.createdAt) return false
    const hoy = new Date().toDateString()
    return new Date(o.createdAt).toDateString() === hoy
  }).length

  const stockBajo = productos.filter(
    (p) => Number(p.stock ?? p.cantidad ?? 0) < 5
  ).length

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
        {error}
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Panel de administración</h1>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          titulo="Ventas totales"
          valor={`$${totalVentas.toLocaleString('es-CO')}`}
          icono="💰"
          color="border-green-400"
        />
        <StatCard
          titulo="Órdenes hoy"
          valor={ordenesHoy}
          icono="📦"
          color="border-blue-400"
        />
        <StatCard
          titulo="Órdenes pendientes"
          valor={ordenesPendientes}
          icono="⏳"
          color="border-yellow-400"
        />
        <StatCard
          titulo="Productos con stock bajo"
          valor={stockBajo}
          icono="⚠️"
          color="border-red-400"
        />
      </div>

      {/* Tabla de órdenes recientes */}
      <OrdenesRecientes ordenes={ordenes} />
    </section>
  )
}
