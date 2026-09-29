// ─── auth.routes.js ───────────────────────────────────────────────────────────
// Rutas de autenticación y perfil de usuario.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import {
  registro,
  login,
  logout,
  getPerfil,
  updatePerfil,
  recuperarPassword,
  updatePassword,
  getMe,
} from '../controllers/authController.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import {
  validarRegistro,
  validarLogin,
  validarCambiarPassword,
} from '../middleware/validation.middleware.js'

const router = Router()

// ── Públicas ──────────────────────────────────────────────────────────────────
router.post('/registro',           validarRegistro,  registro)
router.post('/login',              validarLogin,     login)
router.post('/recuperar-password',                   recuperarPassword)

// ── Autenticadas ──────────────────────────────────────────────────────────────
router.post  ('/logout',           verificarToken,                      logout)
router.get   ('/me',               verificarToken,                      getMe)
router.get   ('/perfil',           verificarToken,                      getPerfil)
router.patch ('/perfil',           verificarToken,                      updatePerfil)
router.patch ('/cambiar-password', verificarToken, validarCambiarPassword, updatePassword)

export default router
