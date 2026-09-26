import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Obtener el carrito del usuario autenticado
export const obtenerCarrito = async (userId) => {
  const { data, error } = await supabase
    .from('carrito_items')
    .select(`
      id,
      cantidad,
      talla,
      productos (
        id,
        nombre,
        precio,
        imagen,
        marca,
        stock
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// Agregar un producto al carrito
export const agregarAlCarrito = async ({ userId, productoId, talla, cantidad = 1 }) => {
  // Verificar si ya existe ese producto+talla en el carrito
  const { data: existente } = await supabase
    .from('carrito_items')
    .select('id, cantidad')
    .eq('user_id', userId)
    .eq('producto_id', productoId)
    .eq('talla', talla)
    .single()

  if (existente) {
    // Si existe, sumar la cantidad
    const { data, error } = await supabase
      .from('carrito_items')
      .update({ cantidad: existente.cantidad + cantidad })
      .eq('id', existente.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Si no existe, crear nuevo item
  const { data, error } = await supabase
    .from('carrito_items')
    .insert({ user_id: userId, producto_id: productoId, talla, cantidad })
    .select()
    .single()

  if (error) throw error
  return data
}

// Actualizar cantidad de un item
export const actualizarCantidad = async ({ itemId, cantidad }) => {
  if (cantidad <= 0) return eliminarDelCarrito(itemId)

  const { data, error } = await supabase
    .from('carrito_items')
    .update({ cantidad })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Eliminar un item del carrito
export const eliminarDelCarrito = async (itemId) => {
  const { error } = await supabase
    .from('carrito_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

// Vaciar todo el carrito del usuario
export const vaciarCarrito = async (userId) => {
  const { error } = await supabase
    .from('carrito_items')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}
