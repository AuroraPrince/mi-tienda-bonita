// ─── cart.routes.js ───────────────────────────────────────────────────────────
// Rutas del carrito — todas requieren autenticación.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import {
  getCarrito,
  getConteo,
  addItem,
  updateItem,
  removeItem,
  clearCarrito,
  syncCarrito,
} from '../controllers/cartController.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import {
  validarAgregarAlCarrito,
  validarActualizarCarrito,
} from '../middleware/validation.middleware.js'

const router = Router()

// Todas las rutas del carrito requieren usuario autenticado
router.use(verificarToken)

router.get   ('/',          getCarrito)
router.get   ('/count',     getConteo)
router.post  ('/',          validarAgregarAlCarrito,  addItem)
router.post  ('/sync',                                syncCarrito)
router.patch ('/:itemId',   validarActualizarCarrito, updateItem)
router.delete('/',          clearCarrito)
router.delete('/:itemId',   removeItem)

export default router
