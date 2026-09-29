import { createContext, useContext, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'

// ─── Contexto ──────────────────────────────────────────────────────────────
const NotificationContext = createContext(null)

// ─── Configuración visual de los toasts ───────────────────────────────────
const ESTILOS_BASE = {
  borderRadius: '12px',
  padding:      '12px 16px',
  fontSize:     '14px',
  fontWeight:   '500',
  maxWidth:     '380px',
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function NotificationProvider({ children }) {

  /** Notificación de éxito — verde */
  const exito = useCallback((mensaje, opciones = {}) => {
    toast.success(mensaje, {
      duration: 3500,
      style: { ...ESTILOS_BASE, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
      iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
      ...opciones,
    })
  }, [])

  /** Notificación de error — rojo */
  const error = useCallback((mensaje, opciones = {}) => {
    toast.error(mensaje, {
      duration: 5000,
      style: { ...ESTILOS_BASE, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
      iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
      ...opciones,
    })
  }, [])

  /** Notificación de advertencia — amarillo */
  const advertencia = useCallback((mensaje, opciones = {}) => {
    toast(mensaje, {
      duration: 4000,
      icon: '⚠️',
      style: { ...ESTILOS_BASE, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' },
      ...opciones,
    })
  }, [])

  /** Notificación informativa — azul */
  const info = useCallback((mensaje, opciones = {}) => {
    toast(mensaje, {
      duration: 3500,
      icon: 'ℹ️',
      style: { ...ESTILOS_BASE, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
      ...opciones,
    })
  }, [])

  /**
   * Toast de promesa: muestra estados de carga / éxito / error automáticamente.
   * Uso:
   *   promesa(
   *     agregarAlCarrito(item),
   *     { cargando: 'Agregando...', exito: '¡Agregado!', error: 'No se pudo agregar.' }
   *   )
   */
  const promesa = useCallback((promiseObj, mensajes = {}) => {
    return toast.promise(promiseObj, {
      loading: mensajes.cargando ?? 'Procesando...',
      success: mensajes.exito   ?? '¡Listo!',
      error:   mensajes.error   ?? 'Algo salió mal.',
    }, {
      style: ESTILOS_BASE,
      success: {
        style: { ...ESTILOS_BASE, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
        iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
      },
      error: {
        style: { ...ESTILOS_BASE, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
        iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
      },
    })
  }, [])

  /** Descarta todos los toasts activos */
  const descartar = useCallback(() => toast.dismiss(), [])

  return (
    <NotificationContext.Provider value={{ exito, error, advertencia, info, promesa, descartar }}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 72 }} // deja espacio para el Header
        toastOptions={{ style: ESTILOS_BASE }}
      />
    </NotificationContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification debe usarse dentro de <NotificationProvider>')
  return ctx
}
