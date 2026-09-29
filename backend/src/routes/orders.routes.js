// ─── orders.routes.js ─────────────────────────────────────────────────────────
// Rutas de órdenes — cliente y admin.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { verificarToken, soloAdmin } from '../middleware/auth.middleware.js'
import {
  validarCrearOrden,
  validarActualizarEstadoOrden,
  validarPaginacion,
  validarParamId,
} from '../middleware/validation.middleware.js'

const router = Router()

// ── Cliente (autenticado) ─────────────────────────────────────────────────────
router.get  ('/',            verificarToken, validarPaginacion, getOrders)
router.get  ('/:id',         verificarToken, validarParamId,    getOrderById)
router.post ('/',            verificarToken, validarCrearOrden, createOrder)
router.patch('/:id/cancelar',verificarToken, validarParamId,    cancelOrder)

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get  ('/admin/all',          verificarToken, soloAdmin, validarPaginacion,         getAllOrders)
router.get  ('/admin/:id',          verificarToken, soloAdmin, validarParamId,            getOrderByIdAdmin)
router.patch('/admin/:id/estado',   verificarToken, soloAdmin, validarActualizarEstadoOrden, updateOrderStatus)

export default router
