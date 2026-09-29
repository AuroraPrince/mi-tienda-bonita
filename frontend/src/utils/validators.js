import { z } from 'zod'
import { DEPARTAMENTOS, TALLAS } from './constants'

// ─── Helpers reutilizables ─────────────────────────────────────────────────

const requerido = (campo = 'Este campo') =>
  z.string({ required_error: `${campo} es obligatorio.` }).trim()

const textoRequerido = (campo, min = 2, max = 100) =>
  requerido(campo)
    .min(min, `${campo} debe tener al menos ${min} caracteres.`)
    .max(max, `${campo} no puede superar los ${max} caracteres.`)

// ─── Registro / Login ──────────────────────────────────────────────────────

export const schemaRegistro = z
  .object({
    nombre: textoRequerido('El nombre', 2, 80),
    email: requerido('El correo')
      .email('Ingresa un correo electrónico válido.'),
    password: requerido('La contraseña')
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(64, 'La contraseña no puede superar los 64 caracteres.')
      .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula.')
      .regex(/[0-9]/, 'Debe incluir al menos un número.'),
    confirmarPassword: requerido('La confirmación de contraseña'),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmarPassword'],
  })

export const schemaLogin = z.object({
  email: requerido('El correo')
    .email('Ingresa un correo electrónico válido.'),
  password: requerido('La contraseña')
    .min(1, 'Ingresa tu contraseña.'),
})

export const schemaRecuperarPassword = z.object({
  email: requerido('El correo')
    .email('Ingresa un correo electrónico válido.'),
})

// ─── Formulario de envío ───────────────────────────────────────────────────

export const schemaEnvio = z.object({
  nombre: textoRequerido('El nombre completo', 3, 100),
  telefono: requerido('El teléfono')
    .regex(
      /^[0-9\s\-+()]{7,15}$/,
      'Ingresa un número de teléfono válido (7–15 dígitos).'
    ),
  direccion: textoRequerido('La dirección', 5, 150),
  ciudad: textoRequerido('La ciudad', 2, 80),
  departamento: z
    .string({ required_error: 'Selecciona un departamento.' })
    .refine((val) => DEPARTAMENTOS.includes(val), {
      message: 'Selecciona un departamento válido.',
    }),
  codigoPostal: z
    .string()
    .trim()
    .regex(/^[0-9]{0,6}$/, 'El código postal debe ser numérico (máx. 6 dígitos).')
    .optional()
    .or(z.literal('')),
  notas: z
    .string()
    .trim()
    .max(300, 'Las notas no pueden superar los 300 caracteres.')
    .optional()
    .or(z.literal('')),
})

// ─── Agregar producto al carrito ───────────────────────────────────────────

export const schemaAgregarCarrito = z.object({
  productoId: z.string({ required_error: 'Producto requerido.' }).uuid('ID de producto inválido.'),
  talla: z
    .string({ required_error: 'Selecciona una talla.' })
    .refine((val) => TALLAS.includes(val), { message: 'Talla no válida.' }),
  cantidad: z
    .number({ invalid_type_error: 'La cantidad debe ser un número.' })
    .int('La cantidad debe ser un número entero.')
    .min(1, 'La cantidad mínima es 1.')
    .max(10, 'Máximo 10 unidades por producto.'),
})

// ─── Formulario de contacto ────────────────────────────────────────────────

export const schemaContacto = z.object({
  nombre:  textoRequerido('El nombre', 2, 80),
  email:   requerido('El correo').email('Ingresa un correo electrónico válido.'),
  asunto:  textoRequerido('El asunto', 4, 120),
  mensaje: textoRequerido('El mensaje', 10, 1000),
})

// ─── Perfil de usuario ─────────────────────────────────────────────────────

export const schemaPerfil = z.object({
  nombre:   textoRequerido('El nombre', 2, 80),
  telefono: z
    .string()
    .trim()
    .regex(/^[0-9\s\-+()]{7,15}$/, 'Ingresa un número de teléfono válido.')
    .optional()
    .or(z.literal('')),
})

// ─── Helper: extraer errores de Zod para usar con useForm ─────────────────

/**
 * Parsea un ZodError y devuelve un objeto plano { campo: 'mensaje' }
 * útil cuando no se usa react-hook-form directamente.
 */
export const extraerErroresZod = (zodError) => {
  const errores = {}
  for (const issue of zodError.errors) {
    const campo = issue.path.join('.')
    if (!errores[campo]) errores[campo] = issue.message
  }
  return errores
}

/**
 * Valida un schema Zod y retorna { ok, datos, errores }.
 * Uso:
 *   const { ok, datos, errores } = validar(schemaEnvio, formData)
 */
export const validar = (schema, datos) => {
  const resultado = schema.safeParse(datos)
  if (resultado.success) return { ok: true, datos: resultado.data, errores: {} }
  return { ok: false, datos: null, errores: extraerErroresZod(resultado.error) }
}
