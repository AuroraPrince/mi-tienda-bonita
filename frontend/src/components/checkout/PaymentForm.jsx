import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// Inicializar Stripe una sola vez fuera del componente
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const ESTILOS_CARD = {
  style: {
    base: {
      fontSize: '15px',
      color: '#374151',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9CA3AF' },
    },
    invalid: { color: '#EF4444' },
  },
}

// ── Formulario interno (necesita estar dentro de <Elements>) ─────────────────
function FormularioPago({ clientSecret, onExito, onError, procesando, setProcesando }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [errorCard, setErrorCard] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

    setProcesando(true)
    setErrorCard(null)

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
      },
    })

    if (error) {
      setErrorCard(error.message)
      onError(error.message)
      setProcesando(false)
    } else if (paymentIntent.status === 'succeeded') {
      onExito(paymentIntent)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Número de tarjeta */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Número de tarjeta
          </label>
          <div className="border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
            <CardNumberElement options={ESTILOS_CARD} />
          </div>
        </div>

        {/* Vencimiento y CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Vencimiento
            </label>
            <div className="border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
              <CardExpiryElement options={ESTILOS_CARD} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              CVC
            </label>
            <div className="border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
              <CardCvcElement options={ESTILOS_CARD} />
            </div>
          </div>
        </div>

        {/* Error de tarjeta */}
        {errorCard && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {errorCard}
          </div>
        )}

        {/* Botón pagar */}
        <button
          type="submit"
          disabled={!stripe || procesando}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
        >
          {procesando ? (
            <>
              <span className="animate-spin text-lg">⏳</span>
              Procesando pago...
            </>
          ) : (
            '🔒 Pagar ahora'
          )}
        </button>

        {/* Seguridad */}
        <p className="text-center text-xs text-gray-400 mt-2">
          🔐 Pago seguro procesado por Stripe. No almacenamos datos de tarjetas.
        </p>
      </div>
    </form>
  )
}

// ── Componente exportado con wrapper de Elements ─────────────────────────────
export default function PaymentForm({ clientSecret, onExito, onError }) {
  const [procesando, setProcesando] = useState(false)

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center py-12">
        <div className="text-center text-gray-400">
          <span className="text-3xl block mb-2">⏳</span>
          <p className="text-sm">Preparando el pago...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">
        💳 Información de pago
      </h2>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <FormularioPago
          clientSecret={clientSecret}
          onExito={onExito}
          onError={onError}
          procesando={procesando}
          setProcesando={setProcesando}
        />
      </Elements>
    </div>
  )
}
