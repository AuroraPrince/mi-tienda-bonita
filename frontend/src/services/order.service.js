import api from './api'

// ─── Obtener todas las órdenes del usuario autenticado ─────────────────────
export const getOrdenesUsuario = async ({ pagina = 1, limite = 10 } = {}) => {
  const { data } = await api.get('/orders', {
    params: { pagina, limite },
  })
  return data // { ordenes: [...], total, totalPaginas }
}

// ─── Obtener una orden por ID ──────────────────────────────────────────────
export const getOrdenById = async (ordenId) => {
  const { data } = await api.get(`/orders/${ordenId}`)
  return data
}

// ─── Crear una orden (post-pago con Stripe) ────────────────────────────────
// Normalmente se llama desde payment.service → confirmarOrden,
// pero se expone aquí también para uso directo si es necesario.
export const crearOrden = async ({ paymentIntentId, envio, items }) => {
  const { data } = await api.post('/orders', {
    paymentIntentId,
    envio,
    items,
  })
  return data // { orderId, estado, createdAt, ... }
}

// ─── Cancelar una orden (solo si está en estado 'pendiente') ───────────────
export const cancelarOrden = async (ordenId) => {
  const { data } = await api.patch(`/orders/${ordenId}/cancelar`)
  return data
}

// ─── [Admin] Obtener todas las órdenes ────────────────────────────────────
export const getTodasLasOrdenes = async ({ pagina = 1, limite = 20, estado } = {}) => {
  const params = { pagina, limite }
  if (estado) params.estado = estado
  const { data } = await api.get('/admin/orders', { params })
  return data // { ordenes: [...], total, totalPaginas }
}

// ─── [Admin] Actualizar estado de una orden ────────────────────────────────
export const actualizarEstadoOrden = async (ordenId, nuevoEstado) => {
  const { data } = await api.patch(`/admin/orders/${ordenId}/estado`, {
    estado: nuevoEstado,
  })
  return data
}
