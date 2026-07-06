import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../../middleware/roles.middleware';
import * as sesionesController from '../../controllers/security/sesiones-activas.controller';

const router = Router();

// GET  /api/sesiones/activas
router.get('/activas', authMiddleware, soloAdminGral, sesionesController.getActivas);

// GET  /api/sesiones/usuario/:idUsuario
router.get('/usuario/:idUsuario', authMiddleware, cualquierAdmin, sesionesController.getByUsuario);

// DELETE /api/sesiones/:idSesion
router.delete('/:idSesion', authMiddleware, soloAdminGral, sesionesController.cerrarSesion);

// POST /api/sesiones/usuario/:idUsuario/cerrar-todas
router.post('/usuario/:idUsuario/cerrar-todas', authMiddleware, cualquierAdmin, sesionesController.cerrarTodasUsuario);

// POST /api/sesiones/limpiar-expiradas
router.post('/limpiar-expiradas', authMiddleware, soloAdminGral, sesionesController.limpiarExpiradas);

export default router;