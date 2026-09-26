import api from './api'

// Crear un PaymentIntent en el backend (que llama a Stripe)
export const crearPaymentIntent = async ({ monto, moneda = 'cop', metadata = {} }) => {
  const { data } = await api.post('/payments/create-intent', {
    monto,   // en centavos: $50.000 COP = 5000000
    moneda,
    metadata,
  })
  return data // { clientSecret: 'pi_xxx_secret_xxx' }
}

// Confirmar la orden una vez que Stripe confirma el pago
export const confirmarOrden = async ({ paymentIntentId, envio, items }) => {
  const { data } = await api.post('/orders', {
    paymentIntentId,
    envio,
    items,
  })
  return data // { orderId, estado, ... }
}
