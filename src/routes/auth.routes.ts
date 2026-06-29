import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral }  from '../middleware/roles.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

// ── Públicas — sin autenticación ─────────────────────────────
router.post('/login', authController.login);

// ── Autenticadas — cualquier admin ───────────────────────────
router.get   ('/profile',  authMiddleware, authController.obtenerProfile);
router.post  ('/logout',   authMiddleware, authController.logout);
router.patch ('/password', authMiddleware, authController.cambiarPassword);
router.get   ('/sesiones', authMiddleware, authController.misSesiones);

// ── Solo adminGral ────────────────────────────────────────────
router.post  ('/usuarios',              authMiddleware, soloAdminGral, authController.crearUsuario);
router.get   ('/usuarios',              authMiddleware, soloAdminGral, authController.listarUsuarios);
router.patch ('/usuarios/:id/toggle',   authMiddleware, soloAdminGral, authController.toggleUsuario);

export default router;