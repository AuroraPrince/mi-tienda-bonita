// ─── email.service.js ─────────────────────────────────────────────────────────
// Envío de emails transaccionales con Nodemailer.
// Centraliza todas las plantillas HTML del negocio.
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { formatearPrecioCOP } from '../utils/helpers.js'
import { logger } from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// TRANSPORTER
// ─────────────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host:   env.EMAIL_HOST,
  port:   env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
})

// Verificar conexión al iniciar (no bloquea el servidor si falla)
transporter.verify().then(() => {
  logger.info('Servidor de email conectado correctamente.')
}).catch((err) => {
  logger.warn('No se pudo conectar al servidor de email:', { error: err.message })
})

// ─────────────────────────────────────────────────────────────────────────────
// HELPER INTERNO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Envía un email.
 * @param {object} opciones
 * @param {string}   opciones.to
 * @param {string}   opciones.subject
 * @param {string}   opciones.html
 * @param {string}   [opciones.text]
 */
const enviarEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from:    env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ''),
    })
    logger.info('Email enviado:', { to, subject, messageId: info.messageId })
    return { ok: true, messageId: info.messageId }
  } catch (err) {
    logger.error('Error al enviar email:', { to, subject, error: err.message })
    // No lanzar error — el email falla en silencio para no interrumpir el flujo
    return { ok: false, error: err.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS BASE COMPARTIDOS
// ─────────────────────────────────────────────────────────────────────────────

const estilosBase = `
  body { margin:0; padding:0; background:#f9f9f9; font-family:'Helvetica Neue',Arial,sans-serif; color:#333; }
  .wrapper { max-width:600px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
  .header  { background:#e91e8c; padding:28px 32px; text-align:center; }
  .header h1 { margin:0; color:#fff; font-size:22px; letter-spacing:.5px; }
  .body    { padding:32px; }
  .footer  { background:#f3f3f3; padding:16px 32px; text-align:center; font-size:12px; color:#999; }
  .btn     { display:inline-block; background:#e91e8c; color:#fff !important; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:bold; margin:16px 0; }
  table.items { width:100%; border-collapse:collapse; margin:16px 0; }
  table.items th,
  table.items td { padding:10px 8px; border-bottom:1px solid #eee; text-align:left; font-size:14px; }
  table.items th { background:#fafafa; font-weight:600; }
  .total   { font-size:18px; font-weight:bold; color:#e91e8c; text-align:right; margin-top:8px; }
`

const layoutEmail = (contenido) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${estilosBase}</style></head>
<body>
  <div class="wrapper">
    <div class="header"><h1>👟 Mi Tienda Bonita</h1></div>
    <div class="body">${contenido}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Mi Tienda Bonita · Todos los derechos reservados<br>
      <a href="${env.FRONTEND_URL}" style="color:#e91e8c;">mitiendabonita.com</a>
    </div>
  </div>
</body>
</html>`

// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Email de bienvenida tras el registro.
 * @param {object} datos
 * @param {string} datos.email
 * @param {string} datos.nombre
 */
export const enviarBienvenida = async ({ email, nombre }) => {
  const html = layoutEmail(`
    <h2>¡Hola, ${nombre}! 👋</h2>
    <p>Gracias por registrarte en <strong>Mi Tienda Bonita</strong>. 
    Ya puedes explorar nuestra colección de zapatillas y hacer tu primer pedido.</p>
    <a href="${env.FRONTEND_URL}/productos" class="btn">Ver productos</a>
    <p style="color:#999;font-size:13px;">Si no creaste esta cuenta, ignora este email.</p>
  `)

  return enviarEmail({
    to:      email,
    subject: '¡Bienvenido/a a Mi Tienda Bonita! 🎉',
    html,
  })
}

/**
 * Email de confirmación de orden.
 * @param {object} datos
 * @param {string} datos.email
 * @param {string} datos.nombre
 * @param {object} datos.orden
 */
export const enviarConfirmacionOrden = async ({ email, nombre, orden }) => {
  const itemsHTML = (orden.items ?? []).map((item) => `
    <tr>
      <td>${item.nombre}${item.talla ? ` — Talla ${item.talla}` : ''}</td>
      <td style="text-align:center;">${item.cantidad}</td>
      <td style="text-align:right;">${formatearPrecioCOP(item.precio)}</td>
      <td style="text-align:right;">${formatearPrecioCOP(item.precio * item.cantidad)}</td>
    </tr>
  `).join('')

  const html = layoutEmail(`
    <h2>¡Tu orden fue confirmada! 🎊</h2>
    <p>Hola <strong>${nombre}</strong>, recibimos tu pedido correctamente.</p>

    <p><strong>N.° de orden:</strong> #${String(orden.id).slice(-8).toUpperCase()}</p>

    <table class="items">
      <thead>
        <tr>
          <th>Producto</th><th style="text-align:center;">Cant.</th>
          <th style="text-align:right;">Precio</th><th style="text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>

    <p class="total">Total: ${formatearPrecioCOP(orden.total)}</p>

    ${orden.envio ? `
    <p><strong>Dirección de envío:</strong><br>
    ${orden.envio.nombre}<br>
    ${orden.envio.direccion}, ${orden.envio.ciudad}
    ${orden.envio.departamento ? `, ${orden.envio.departamento}` : ''}</p>
    ` : ''}

    <a href="${env.FRONTEND_URL}/cuenta/ordenes" class="btn">Ver mis órdenes</a>
  `)

  return enviarEmail({
    to:      email,
    subject: `Orden confirmada #${String(orden.id).slice(-8).toUpperCase()} · Mi Tienda Bonita`,
    html,
  })
}

/**
 * Email de notificación cuando la orden es enviada.
 * @param {object} datos
 * @param {string} datos.email
 * @param {string} datos.nombre
 * @param {object} datos.orden
 * @param {string} [datos.trackingUrl]
 */
export const enviarNotificacionEnvio = async ({ email, nombre, orden, trackingUrl }) => {
  const html = layoutEmail(`
    <h2>¡Tu pedido está en camino! 🚚</h2>
    <p>Hola <strong>${nombre}</strong>, tu orden 
    <strong>#${String(orden.id).slice(-8).toUpperCase()}</strong> ha sido enviada.</p>

    ${trackingUrl ? `
    <p>Puedes rastrear tu pedido en el siguiente enlace:</p>
    <a href="${trackingUrl}" class="btn">Rastrear pedido</a>
    ` : '<p>Recibirás más información de seguimiento próximamente.</p>'}

    <a href="${env.FRONTEND_URL}/cuenta/ordenes" style="color:#e91e8c;">Ver mis órdenes</a>
  `)

  return enviarEmail({
    to:      email,
    subject: `Tu pedido #${String(orden.id).slice(-8).toUpperCase()} está en camino 🚚`,
    html,
  })
}

/**
 * Email de recuperación de contraseña.
 * @param {object} datos
 * @param {string} datos.email
 * @param {string} datos.nombre
 * @param {string} datos.enlace  - URL de reseteo
 */
export const enviarRecuperacionPassword = async ({ email, nombre, enlace }) => {
  const html = layoutEmail(`
    <h2>Restablecer contraseña 🔐</h2>
    <p>Hola <strong>${nombre}</strong>, recibimos una solicitud para 
    restablecer tu contraseña.</p>
    <a href="${enlace}" class="btn">Restablecer contraseña</a>
    <p style="color:#999;font-size:13px;">Este enlace expira en 1 hora. 
    Si no solicitaste este cambio, ignora este email.</p>
  `)

  return enviarEmail({
    to:      email,
    subject: 'Restablecer contraseña · Mi Tienda Bonita',
    html,
  })
}
