// ─── products.routes.js ───────────────────────────────────────────────────────
// Rutas de productos — públicas y admin.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import multer from 'multer'
import {
  getProducts,
  getFiltros,
  getProductById,
  getProductBySlug,
  verificarStock,
  createProduct,
  updateProduct,
  deactivateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { verificarToken, soloAdmin } from '../middleware/auth.middleware.js'
import {
  validarFiltrosProductos,
  validarCrearProducto,
  validarActualizarProducto,
  validarParamId,
} from '../middleware/validation.middleware.js'

const router = Router()

// Multer — almacena en memoria para enviar a Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },  // 5 MB máximo
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true)
    cb(new Error('Solo se permiten imágenes.'))
  },
})

// ── Públicas ──────────────────────────────────────────────────────────────────
router.get ('/',                   validarFiltrosProductos,  getProducts)
router.get ('/filtros',                                       getFiltros)
router.get ('/slug/:slug',                                    getProductBySlug)
router.get ('/:id',                validarParamId,            getProductById)
router.post('/verificar-stock',                               verificarStock)

// ── Solo Admin ────────────────────────────────────────────────────────────────
router.post  ('/',       verificarToken, soloAdmin, upload.single('imagen'), validarCrearProducto,     createProduct)
router.put   ('/:id',    verificarToken, soloAdmin, upload.single('imagen'), validarActualizarProducto, updateProduct)
router.patch ('/:id/desactivar', verificarToken, soloAdmin, validarParamId,  deactivateProduct)
router.delete('/:id',            verificarToken, soloAdmin, validarParamId,  deleteProduct)

export default router
