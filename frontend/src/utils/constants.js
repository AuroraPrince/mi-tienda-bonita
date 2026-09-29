// ─── Rutas de la aplicación ────────────────────────────────────────────────
export const RUTAS = {
  HOME:               '/',
  PRODUCTOS:          '/productos',
  PRODUCTO_DETALLE:   '/productos/:id',
  CARRITO:            '/carrito',
  CHECKOUT:           '/checkout',
  ORDEN_CONFIRMACION: '/orden-confirmacion',
  CONTACTO:           '/contacto',
  LOGIN:              '/login',
  REGISTRO:           '/registro',
  MI_CUENTA:          '/mi-cuenta',
  MIS_PEDIDOS:        '/mis-pedidos',
  ADMIN:              '/admin',
  ADMIN_INVENTARIO:   '/admin/inventario',
  ADMIN_PEDIDOS:      '/admin/pedidos',
  NOT_FOUND:          '*',
}

// ─── Configuración de envío ────────────────────────────────────────────────
export const ENVIO = {
  GRATIS_DESDE:   200000,   // COP — envío gratis si el pedido supera este valor
  COSTO_ESTANDAR: 15000,    // COP — costo de envío estándar
  DIAS_HABILES:   { MIN: 3, MAX: 5 },
}

// ─── Moneda ────────────────────────────────────────────────────────────────
export const MONEDA = {
  CODIGO:   'COP',
  LOCALE:   'es-CO',
  SIMBOLO:  '$',
}

// ─── Stripe ───────────────────────────────────────────────────────────────
export const STRIPE = {
  MONEDA:            'cop',
  FACTOR_CENTAVOS:   100, // Stripe trabaja en centavos
}

// ─── Paginación ────────────────────────────────────────────────────────────
export const PAGINACION = {
  PRODUCTOS_POR_PAGINA: 12,
}

// ─── Tallas disponibles ────────────────────────────────────────────────────
export const TALLAS = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']

// ─── Categorías de calzado ─────────────────────────────────────────────────
export const CATEGORIAS = [
  { value: 'deportivas',  label: 'Deportivas' },
  { value: 'casuales',    label: 'Casuales' },
  { value: 'formales',    label: 'Formales' },
  { value: 'botas',       label: 'Botas' },
  { value: 'sandalias',   label: 'Sandalias' },
  { value: 'infantiles',  label: 'Infantiles' },
]

// ─── Marcas ────────────────────────────────────────────────────────────────
export const MARCAS = [
  'Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance',
  'Vans', 'Converse', 'Skechers', 'Under Armour', 'Otras',
]

// ─── Departamentos de Colombia ─────────────────────────────────────────────
export const DEPARTAMENTOS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada',
]

// ─── Estados de una orden ──────────────────────────────────────────────────
export const ESTADOS_ORDEN = {
  PENDIENTE:   'pendiente',
  PAGADO:      'pagado',
  PREPARANDO:  'preparando',
  ENVIADO:     'enviado',
  ENTREGADO:   'entregado',
  CANCELADO:   'cancelado',
}

// ─── Roles de usuario ──────────────────────────────────────────────────────
export const ROLES = {
  CLIENTE: 'cliente',
  ADMIN:   'admin',
}

// ─── Rangos de precio para filtros ────────────────────────────────────────
export const RANGOS_PRECIO = [
  { label: 'Menos de $100.000',         min: 0,      max: 99999  },
  { label: '$100.000 – $200.000',        min: 100000, max: 200000 },
  { label: '$200.000 – $350.000',        min: 200001, max: 350000 },
  { label: 'Más de $350.000',            min: 350001, max: null   },
]

// ─── Mensajes de error genéricos ──────────────────────────────────────────
export const ERRORES = {
  CAMPO_REQUERIDO:  'Este campo es obligatorio.',
  RED:              'Error de conexión. Intenta de nuevo.',
  SESION_EXPIRADA:  'Tu sesión expiró. Inicia sesión nuevamente.',
  NO_AUTORIZADO:    'No tienes permisos para realizar esta acción.',
}
