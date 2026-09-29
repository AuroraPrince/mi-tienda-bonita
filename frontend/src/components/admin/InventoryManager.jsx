import { useState, useEffect, useRef } from 'react'
import {
  getProducts,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../../services/product.service'

// ─── Estado inicial del formulario ────────────────────────────────────────
const FORM_VACIO = {
  nombre: '',
  marca: '',
  categoria: '',
  precio: '',
  stock: '',
  talla: '',
  descripcion: '',
  imagen: null,
}

// ─── Fila de producto en la tabla ─────────────────────────────────────────
function FilaProducto({ producto, onEditar, onEliminar }) {
  const stockNum = Number(producto.stock ?? producto.cantidad ?? 0)
  const stockColor =
    stockNum === 0
      ? 'text-red-600 font-bold'
      : stockNum < 5
      ? 'text-yellow-600 font-semibold'
      : 'text-green-600'

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">
      <td className="py-3 px-2">
        {producto.imagenUrl ? (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xl">
            👟
          </div>
        )}
      </td>
      <td className="py-3 px-2 text-gray-800 font-medium">{producto.nombre}</td>
      <td className="py-3 px-2 text-gray-500">{producto.marca ?? '—'}</td>
      <td className="py-3 px-2 text-gray-500">{producto.categoria ?? '—'}</td>
      <td className="py-3 px-2 text-gray-700 font-medium">
        ${Number(producto.precio ?? 0).toLocaleString('es-CO')}
      </td>
      <td className={`py-3 px-2 ${stockColor}`}>{stockNum}</td>
      <td className="py-3 px-2 text-gray-500">{producto.talla ?? '—'}</td>
      <td className="py-3 px-2">
        <div className="flex gap-2">
          <button
            onClick={() => onEditar(producto)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            aria-label={`Editar ${producto.nombre}`}
          >
            Editar
          </button>
          <button
            onClick={() => onEliminar(producto)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
            aria-label={`Eliminar ${producto.nombre}`}
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Modal de formulario (crear / editar) ─────────────────────────────────
function ModalProducto({ producto, onGuardar, onCerrar, guardando }) {
  const [form, setForm]       = useState(producto ? { ...producto, imagen: null } : FORM_VACIO)
  const [preview, setPreview] = useState(producto?.imagenUrl ?? null)
  const fileRef               = useRef(null)
  const esEdicion             = !!producto

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImagen = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm((prev) => ({ ...prev, imagen: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') fd.append(key, val)
    })
    onGuardar(fd, esEdicion ? producto.id : null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={esEdicion ? 'Editar producto' : 'Nuevo producto'}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Imagen del producto
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-pink-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Vista previa" className="h-32 object-contain rounded-lg" />
              ) : (
                <span className="text-gray-300 text-5xl">🖼️</span>
              )}
              <span className="text-xs text-gray-400">
                {form.imagen ? form.imagen.name : 'Haz clic para seleccionar'}
              </span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImagen}
              className="hidden"
            />
          </div>

          {/* Campos de texto */}
          {[
            { name: 'nombre',      label: 'Nombre',      type: 'text',   required: true },
            { name: 'marca',       label: 'Marca',       type: 'text',   required: false },
            { name: 'categoria',   label: 'Categoría',   type: 'text',   required: false },
            { name: 'talla',       label: 'Talla',       type: 'text',   required: false },
            { name: 'precio',      label: 'Precio (COP)', type: 'number', required: true },
            { name: 'stock',       label: 'Stock',       type: 'number', required: true },
          ].map(({ name, label, type, required }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">
                {label} {required && <span className="text-pink-500">*</span>}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={form[name] ?? ''}
                onChange={handleChange}
                required={required}
                min={type === 'number' ? 0 : undefined}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          ))}

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-600 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion ?? ''}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white rounded-xl py-2 text-sm font-medium transition-colors"
            >
              {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Confirmación de eliminación ──────────────────────────────────────────
function ModalConfirmar({ producto, onConfirmar, onCancelar, eliminando }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">¿Eliminar producto?</h2>
        <p className="text-sm text-gray-500">
          Se eliminará permanentemente <strong>{producto.nombre}</strong>. Esta acción no se puede
          deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={eliminando}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl py-2 text-sm font-medium transition-colors"
          >
            {eliminando ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function InventoryManager() {
  const [productos, setProductos]       = useState([])
  const [busqueda, setBusqueda]         = useState('')
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState(null)
  const [modalForm, setModalForm]       = useState(null)   // null | undefined (nuevo) | objeto (editar)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [guardando, setGuardando]       = useState(false)
  const [eliminando, setEliminando]     = useState(false)
  const [feedback, setFeedback]         = useState(null)   // { tipo: 'ok'|'error', msg }

  // ── Cargar productos ─────────────────────────────────────────────────────
  const cargarProductos = async () => {
    try {
      setCargando(true)
      const data = await getProducts({ limite: 200 })
      setProductos(data?.productos ?? [])
    } catch (err) {
      setError('No se pudieron cargar los productos.')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarProductos() }, [])

  // ── Feedback temporal ────────────────────────────────────────────────────
  const mostrarFeedback = (tipo, msg) => {
    setFeedback({ tipo, msg })
    setTimeout(() => setFeedback(null), 3500)
  }

  // ── Guardar (crear o editar) ─────────────────────────────────────────────
  const handleGuardar = async (formData, id) => {
    try {
      setGuardando(true)
      if (id) {
        await actualizarProducto(id, formData)
        mostrarFeedback('ok', 'Producto actualizado correctamente.')
      } else {
        await crearProducto(formData)
        mostrarFeedback('ok', 'Producto creado correctamente.')
      }
      setModalForm(null)
      await cargarProductos()
    } catch (err) {
      mostrarFeedback('error', err?.response?.data?.mensaje ?? 'Error al guardar el producto.')
    } finally {
      setGuardando(false)
    }
  }

  // ── Eliminar ─────────────────────────────────────────────────────────────
  const handleEliminar = async () => {
    if (!productoAEliminar) return
    try {
      setEliminando(true)
      await eliminarProducto(productoAEliminar.id)
      mostrarFeedback('ok', 'Producto eliminado.')
      setProductoAEliminar(null)
      await cargarProductos()
    } catch (err) {
      mostrarFeedback('error', err?.response?.data?.mensaje ?? 'Error al eliminar el producto.')
      setProductoAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }

  // ── Filtro por búsqueda ──────────────────────────────────────────────────
  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.toLowerCase()
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.marca?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q)
    )
  })

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <button
          onClick={() => setModalForm(undefined)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

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

      {/* Buscador */}
      <input
        type="search"
        placeholder="Buscar por nombre, marca o categoría…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full sm:max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        aria-label="Buscar producto"
      />

      {/* Tabla */}
      {cargando ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>
      ) : productosFiltrados.length === 0 ? (
        <p className="text-gray-400 text-sm">No se encontraron productos.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b">
                {['Imagen', 'Nombre', 'Marca', 'Categoría', 'Precio', 'Stock', 'Talla', 'Acciones'].map(
                  (col) => (
                    <th key={col} className="py-3 px-2 font-medium">
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <FilaProducto
                  key={p.id}
                  producto={p}
                  onEditar={(prod) => setModalForm(prod)}
                  onEliminar={(prod) => setProductoAEliminar(prod)}
                />
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 px-4 py-3">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Modal crear / editar */}
      {modalForm !== null && (
        <ModalProducto
          producto={modalForm === undefined ? null : modalForm}
          onGuardar={handleGuardar}
          onCerrar={() => setModalForm(null)}
          guardando={guardando}
        />
      )}

      {/* Modal confirmar eliminación */}
      {productoAEliminar && (
        <ModalConfirmar
          producto={productoAEliminar}
          onConfirmar={handleEliminar}
          onCancelar={() => setProductoAEliminar(null)}
          eliminando={eliminando}
        />
      )}
    </section>
  )
}
