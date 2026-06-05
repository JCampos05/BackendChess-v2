import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../../middleware/roles.middleware';
import * as sesionesController from '../../controllers/security/sesiones-activas.controller';

const router = Router();

// GET  /api/seguridad/sesiones/activas
router.get('/activas', authMiddleware, soloAdminGral, sesionesController.getActivas);

// GET  /api/seguridad/sesiones/usuario/:idUsuario
router.get('/usuario/:idUsuario', authMiddleware, cualquierAdmin, sesionesController.getByUsuario);

// DELETE /api/seguridad/sesiones/:idSesion
router.delete('/:idSesion', authMiddleware, soloAdminGral, sesionesController.cerrarSesion);

// POST /api/seguridad/sesiones/usuario/:idUsuario/cerrar-todas
router.post('/usuario/:idUsuario/cerrar-todas', authMiddleware, cualquierAdmin, sesionesController.cerrarTodasUsuario);

// POST /api/seguridad/sesiones/limpiar-expiradas
router.post('/limpiar-expiradas', authMiddleware, soloAdminGral, sesionesController.limpiarExpiradas);

export default router;