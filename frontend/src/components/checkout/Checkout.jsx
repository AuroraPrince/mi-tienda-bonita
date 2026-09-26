import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { useAuth } from '../auth/AuthContext'
import { crearPaymentIntent, confirmarOrden } from '../../services/payment.service'
import ShippingForm from './ShippingForm'
import PaymentForm from './PaymentForm'
import OrderSummary from './OrderSummary'

// Pasos del checkout
const PASOS = [
  { id: 1, label: 'Envío' },
  { id: 2, label: 'Pago' },
  { id: 3, label: 'Confirmación' },
]

const ENVIO_GRATIS_DESDE = 200000

const envioInicial = {
  nombre: '', telefono: '', direccion: '',
  ciudad: '', departamento: '', codigoPostal: '', notas: '',
}

export default function Checkout() {
  const { items, totalPrecio, vaciar } = useCart()
  const { estaAutenticado, userId } = useAuth()
  const navigate = useNavigate()

  const [pasoActual, setPasoActual]     = useState(1)
  const [datosEnvio, setDatosEnvio]     = useState(envioInicial)
  const [erroresEnvio, setErroresEnvio] = useState({})
  const [clientSecret, setClientSecret] = useState(null)
  const [errorPago, setErrorPago]       = useState(null)
  const [ordenId, setOrdenId]           = useState(null)
  const [cargando, setCargando]         = useState(false)

  // Redirigir si no está autenticado o el carrito está vacío
  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login', { state: { from: '/checkout' } })
    } else if (items.length === 0 && pasoActual !== 3) {
      navigate('/carrito')
    }
  }, [estaAutenticado, items, navigate, pasoActual])

  // ── Validar formulario de envío ──────────────────────────────────────────
  const validarEnvio = () => {
    const err = {}
    if (!datosEnvio.nombre.trim())      err.nombre      = 'Campo obligatorio.'
    if (!datosEnvio.telefono.trim())    err.telefono    = 'Campo obligatorio.'
    if (!datosEnvio.direccion.trim())   err.direccion   = 'Campo obligatorio.'
    if (!datosEnvio.ciudad.trim())      err.ciudad      = 'Campo obligatorio.'
    if (!datosEnvio.departamento)       err.departamento = 'Selecciona un departamento.'
    return err
  }

  // ── Paso 1 → 2: validar envío y crear PaymentIntent ─────────────────────
  const handleContinuarPago = async () => {
    const err = validarEnvio()
    if (Object.keys(err).length > 0) { setErroresEnvio(err); return }

    try {
      setCargando(true)
      setErroresEnvio({})
      const envio    = totalPrecio >= ENVIO_GRATIS_DESDE ? 0 : 15000
      const total    = totalPrecio + envio
      const resultado = await crearPaymentIntent({
        monto: total * 100, // Stripe usa centavos
        moneda: 'cop',
        metadata: { userId },
      })
      setClientSecret(resultado.clientSecret)
      setPasoActual(2)
    } catch {
      setErroresEnvio({ global: 'Error al preparar el pago. Intenta de nuevo.' })
    } finally {
      setCargando(false)
    }
  }

  // ── Paso 2 → 3: pago exitoso ─────────────────────────────────────────────
  const handlePagoExitoso = async (paymentIntent) => {
    try {
      const orden = await confirmarOrden({
        paymentIntentId: paymentIntent.id,
        envio: datosEnvio,
        items: items.map((i) => ({
          productoId: i.productos?.id,
          nombre:     i.productos?.nombre,
          cantidad:   i.cantidad,
          talla:      i.talla,
          precio:     i.productos?.precio,
        })),
      })
      setOrdenId(orden.orderId ?? orden.id)
      await vaciar()
      setPasoActual(3)
    } catch {
      setErrorPago('Pago recibido pero hubo un error al registrar la orden. Contacta soporte.')
    }
  }

  // ── Pantalla de confirmación ─────────────────────────────────────────────
  if (pasoActual === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-10 text-center">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido confirmado!</h2>
          {ordenId && (
            <p className="text-sm text-gray-400 mb-2">
              Orden <span className="font-mono font-semibold text-gray-600">#{ordenId}</span>
            </p>
          )}
          <p className="text-gray-500 text-sm mb-2">
            Enviamos la confirmación a tu correo. Tu pedido llegará en{' '}
            <span className="font-semibold text-gray-700">3-5 días hábiles</span>.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Dirección: {datosEnvio.direccion}, {datosEnvio.ciudad}, {datosEnvio.departamento}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/productos')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Seguir comprando
            </button>
            <button
              onClick={() => navigate('/pedidos')}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl text-sm transition-colors"
            >
              Ver mis pedidos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalizar compra</h1>

      {/* ── Indicador de pasos ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8">
        {PASOS.map((paso, idx) => (
          <div key={paso.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${paso.id === pasoActual ? 'opacity-100' : paso.id < pasoActual ? 'opacity-70' : 'opacity-40'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                paso.id < pasoActual
                  ? 'bg-green-600 text-white'
                  : paso.id === pasoActual
                  ? 'bg-green-600 text-white ring-4 ring-green-100'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {paso.id < pasoActual ? '✓' : paso.id}
              </div>
              <span className={`text-sm font-medium ${paso.id === pasoActual ? 'text-gray-800' : 'text-gray-400'}`}>
                {paso.label}
              </span>
            </div>
            {idx < PASOS.length - 1 && (
              <div className={`h-px w-8 mx-1 ${paso.id < pasoActual ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Contenido principal ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Columna izquierda: formularios */}
        <div className="flex-1 space-y-4">
          {/* Error global de envío */}
          {erroresEnvio.global && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {erroresEnvio.global}
            </div>
          )}

          {/* Paso 1: Envío */}
          {pasoActual === 1 && (
            <>
              <ShippingForm
                datos={datosEnvio}
                onChange={setDatosEnvio}
                errores={erroresEnvio}
              />
              <button
                onClick={handleContinuarPago}
                disabled={cargando}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {cargando ? 'Preparando pago...' : 'Continuar al pago →'}
              </button>
              <button
                onClick={() => navigate('/carrito')}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-xl text-sm transition-colors"
              >
                ← Volver al carrito
              </button>
            </>
          )}

          {/* Paso 2: Pago */}
          {pasoActual === 2 && (
            <>
              {/* Resumen de dirección */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Enviando a</p>
                  <p className="text-sm font-medium text-gray-700">
                    {datosEnvio.direccion}, {datosEnvio.ciudad}
                  </p>
                </div>
                <button
                  onClick={() => setPasoActual(1)}
                  className="text-green-600 text-xs hover:underline shrink-0"
                >
                  Cambiar
                </button>
              </div>

              {/* Error de pago */}
              {errorPago && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {errorPago}
                </div>
              )}

              <PaymentForm
                clientSecret={clientSecret}
                onExito={handlePagoExitoso}
                onError={(msg) => setErrorPago(msg)}
              />
            </>
          )}
        </div>

        {/* Columna derecha: resumen del pedido */}
        <div className="w-full lg:w-80 shrink-0">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
