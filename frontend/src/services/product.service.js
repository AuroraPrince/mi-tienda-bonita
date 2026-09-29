import api from './api'

// Obtener todos los productos (con filtros opcionales)
export const getProducts = async ({ categoria, marca, precioMin, precioMax, talla, pagina = 1 } = {}) => {
  const params = { pagina }
  if (categoria) params.categoria = categoria
  if (marca)     params.marca = marca
  if (precioMin) params.precioMin = precioMin
  if (precioMax) params.precioMax = precioMax
  if (talla)     params.talla = talla

  const { data } = await api.get('/api/products', { params })
  return data
}

// Obtener un producto por ID
export const getProductById = async (id) => {
  const { data } = await api.get(`/api/products/${id}`)
  return data
}

// Obtener categorías disponibles
export const getCategorias = async () => {
  const { data } = await api.get('/api/products/categorias')
  return data
}

// ─── [Admin] Crear producto ────────────────────────────────────────────────
export const crearProducto = async (formData) => {
  const { data } = await api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// ─── [Admin] Actualizar producto ──────────────────────────────────────────
export const actualizarProducto = async (id, formData) => {
  const { data } = await api.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// ─── [Admin] Eliminar producto ────────────────────────────────────────────
export const eliminarProducto = async (id) => {
  const { data } = await api.delete(`/admin/products/${id}`)
  return data
}
