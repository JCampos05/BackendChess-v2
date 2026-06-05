import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { soloAdminGral } from '../../middleware/roles.middleware';
import * as historialController from '../../controllers/security/historial-accesos.controller';

const router = Router();

// GET /api/seguridad/historial
router.get('/', authMiddleware, soloAdminGral, historialController.getAll);

// GET /api/seguridad/historial/estadisticas
// IMPORTANTE: antes de /:entidad/:idEntidad para evitar conflicto de params
router.get('/estadisticas', authMiddleware, soloAdminGral, historialController.getEstadisticas);

export default router;