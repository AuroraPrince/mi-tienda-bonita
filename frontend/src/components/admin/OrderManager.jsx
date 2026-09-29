import { useState, useEffect } from 'react'
import {
  getTodasLasOrdenes,
  actualizarEstadoOrden,
} from '../../services/order.service'

// ─── Constantes ────────────────────────────────────────────────────────────
const ESTADOS = ['todos', 'pendiente', 'pagado', 'enviado', 'entregado', 'cancelado']

const ESTADO_BADGE = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagado:    'bg-blue-100 text-blue-800',
  enviado:   'bg-purple-100 text-purple-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

const TRANSICIONES = {
  pendiente: ['pagado', 'cancelado'],
  pagado:    ['enviado', 'cancelado'],
  enviado:   ['entregado'],
  entregado: [],
  cancelado: [],
}

// ─── Badge de estado ──────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
        ESTADO_BADGE[estado] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {estado ?? 'desconocido'}
    </span>
  )
}

// ─── Modal de detalle de orden ────────────────────────────────────────────
function ModalDetalle({ orden, onCerrar, onCambiarEstado, actualizando }) {
  const siguientes = TRANSICIONES[orden.estado] ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de orden"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Orden #{String(orden.id).slice(-8).toUpperCase()}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {orden.createdAt
                ? new Date(orden.createdAt).toLocaleString('es-CO')
                : '—'}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Estado actual */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Estado:</span>
            <EstadoBadge estado={orden.estado} />
          </div>

          {/* Datos del cliente */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
            <p className="font-medium text-gray-700 mb-2">Cliente</p>
            <p className="text-gray-600">
              {orden.usuario?.nombre ?? orden.envio?.nombre ?? '—'}
            </p>
            <p className="text-gray-500">
              {orden.usuario?.email ?? orden.email ?? '—'}
            </p>
            {orden.envio?.direccion && (
              <p className="text-gray-500">{orden.envio.direccion}</p>
            )}
            {orden.envio?.ciudad && (
              <p className="text-gray-500">
                {orden.envio.ciudad}
                {orden.envio.departamento ? `, ${orden.envio.departamento}` : ''}
              </p>
            )}
          </div>

          {/* Productos */}
          {Array.isArray(orden.items) && orden.items.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 text-sm mb-2">Productos</p>
              <ul className="divide-y text-sm">
                {orden.items.map((item, i) => (
                  <li key={i} className="py-2 flex justify-between text-gray-600">
                    <span>
                      {item.nombre ?? item.productId}
                      {item.talla ? ` — Talla ${item.talla}` : ''}
                      <span className="text-gray-400"> × {item.cantidad}</span>
                    </span>
                    <span className="font-medium text-gray-700">
                      ${Number((item.precio ?? 0) * (item.cantidad ?? 1)).toLocaleString('es-CO')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center border-t pt-3 text-sm">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-lg font-bold text-gray-800">
              ${Number(orden.total ?? 0).toLocaleString('es-CO')}
            </span>
          </div>

          {/* Cambiar estado */}
          {siguientes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {siguientes.map((sig) => (
                  <button
                    key={sig}
                    onClick={() => onCambiarEstado(orden.id, sig)}
                    disabled={actualizando}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white transition-colors capitalize"
                  >
                    {actualizando ? 'Actualizando…' : `Marcar como ${sig}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {siguientes.length === 0 && (
            <p className="text-xs text-gray-400">
              Esta orden no admite más cambios de estado.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function OrderManager() {
  const [ordenes, setOrdenes]         = useState([])
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda]       = useState('')
  const [pagina, setPagina]           = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)
  const [ordenDetalle, setOrdenDetalle] = useState(null)
  const [actualizando, setActualizando] = useState(false)
  const [feedback, setFeedback]       = useState(null)

  const LIMITE = 15

  // ── Cargar órdenes ───────────────────────────────────────────────────────
  const cargarOrdenes = async (pag = pagina) => {
    try {
      setCargando(true)
      const params = { pagina: pag, limite: LIMITE }
      if (filtroEstado !== 'todos') params.estado = filtroEstado
      const data = await getTodasLasOrdenes(params)
      setOrdenes(data?.ordenes ?? [])
      setTotalPaginas(data?.totalPaginas ?? 1)
    } catch (err) {
      setError('No se pudieron cargar las órdenes.')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    setPagina(1)
    cargarOrdenes(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado])

  // ── Feedback temporal ────────────────────────────────────────────────────
  const mostrarFeedback = (tipo, msg) => {
    setFeedback({ tipo, msg })
    setTimeout(() => setFeedback(null), 3500)
  }

  // ── Cambiar estado de orden ──────────────────────────────────────────────
  const handleCambiarEstado = async (ordenId, nuevoEstado) => {
    try {
      setActualizando(true)
      await actualizarEstadoOrden(ordenId, nuevoEstado)
      mostrarFeedback('ok', `Orden marcada como "${nuevoEstado}".`)
      setOrdenDetalle(null)
      await cargarOrdenes(pagina)
    } catch (err) {
      mostrarFeedback('error', err?.response?.data?.mensaje ?? 'Error al actualizar la orden.')
    } finally {
      setActualizando(false)
    }
  }

  // ── Filtro local por búsqueda ────────────────────────────────────────────
  const ordenesFiltradas = ordenes.filter((o) => {
    const q = busqueda.toLowerCase()
    return (
      String(o.id).toLowerCase().includes(q) ||
      (o.usuario?.email ?? '').toLowerCase().includes(q) ||
      (o.usuario?.nombre ?? '').toLowerCase().includes(q) ||
      (o.envio?.nombre ?? '').toLowerCase().includes(q)
    )
  })

  // ── Paginación ───────────────────────────────────────────────────────────
  const irAPagina = (nueva) => {
    if (nueva < 1 || nueva > totalPaginas) return
    setPagina(nueva)
    cargarOrdenes(nueva)
  }

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <h1 className="text-2xl font-bold text-gray-800">Gestión de órdenes</h1>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.tipo === 'ok'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
          role="alert"
        >
          {feedback.msg}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filtro por estado */}
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filtroEstado === est
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {est}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <input
          type="search"
          placeholder="Buscar por ID, cliente…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:ml-auto border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 w-full sm:w-64"
          aria-label="Buscar orden"
        />
      </div>

      {/* Tabla */}
      {cargando ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>
      ) : ordenesFiltradas.length === 0 ? (
        <p className="text-gray-400 text-sm">No se encontraron órdenes.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b">
                {['ID', 'Cliente', 'Total', 'Estado', 'Fecha', 'Acciones'].map((col) => (
                  <th key={col} className="py-3 px-3 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-3 font-mono text-xs text-gray-500">
                    #{String(orden.id).slice(-8).toUpperCase()}
                  </td>
                  <td className="py-3 px-3 text-gray-700">
                    {orden.usuario?.nombre ?? orden.envio?.nombre ?? orden.usuario?.email ?? '—'}
                  </td>
                  <td className="py-3 px-3 text-gray-700 font-medium">
                    ${Number(orden.total ?? 0).toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-3">
                    <EstadoBadge estado={orden.estado} />
                  </td>
                  <td className="py-3 px-3 text-gray-400 text-xs">
                    {orden.createdAt
                      ? new Date(orden.createdAt).toLocaleDateString('es-CO')
                      : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setOrdenDetalle(orden)}
                      className="text-pink-500 hover:text-pink-700 text-sm font-medium"
                      aria-label={`Ver detalle de orden ${orden.id}`}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 py-4 border-t text-sm">
              <button
                onClick={() => irAPagina(pagina - 1)}
                disabled={pagina === 1}
                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                aria-label="Página anterior"
              >
                ←
              </button>
              <span className="text-gray-500">
                Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong>
              </span>
              <button
                onClick={() => irAPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                aria-label="Página siguiente"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal detalle */}
      {ordenDetalle && (
        <ModalDetalle
          orden={ordenDetalle}
          onCerrar={() => setOrdenDetalle(null)}
          onCambiarEstado={handleCambiarEstado}
          actualizando={actualizando}
        />
      )}
    </section>
  )
}
