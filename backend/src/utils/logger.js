// ─── logger.js ────────────────────────────────────────────────────────────────
// Logger centralizado con Winston.
// · En desarrollo muestra colores en consola con timestamp legible.
// · En producción escribe JSON estructurado en archivos rotativos.
// ─────────────────────────────────────────────────────────────────────────────

import winston from 'winston'
import { env } from '../config/env.js'

const { combine, timestamp, colorize, printf, json, errors } = winston.format

// ── Formato para consola (desarrollo) ────────────────────────────────────────
const formatoConsola = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `${timestamp} [${level}]: ${message}\n${stack}`
      : `${timestamp} [${level}]: ${message}`
  })
)

// ── Formato para archivos (producción) ───────────────────────────────────────
const formatoArchivo = combine(
  timestamp(),
  errors({ stack: true }),
  json()
)

// ── Transportes ───────────────────────────────────────────────────────────────
const transportes = [
  new winston.transports.Console({
    format: formatoConsola,
  }),
]

// En producción también guardamos en archivos
if (env.NODE_ENV === 'production') {
  transportes.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: formatoArchivo,
      maxsize: 5 * 1024 * 1024,  // 5 MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: formatoArchivo,
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 10,
    })
  )
}

// ── Instancia principal ───────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  transports: transportes,
  // No detener el proceso ante excepciones no capturadas
  exitOnError: false,
})

// ── Atajos de uso ─────────────────────────────────────────────────────────────
// logger.info('Servidor iniciado')
// logger.warn('Stock bajo en producto X')
// logger.error('Fallo al procesar pago', { ordenId, error })
// logger.debug('Payload recibido', { body })

export default logger
