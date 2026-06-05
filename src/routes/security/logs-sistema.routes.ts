import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { soloAdminGral } from '../../middleware/roles.middleware';
import * as logsController from '../../controllers/security/logs-sistema.controller';

const router = Router();

// GET /api/seguridad/logs
router.get('/', authMiddleware, soloAdminGral, logsController.getAll);

// GET /api/seguridad/logs/estadisticas
// IMPORTANTE: antes de /:entidad/:idEntidad para evitar conflicto de params
router.get('/estadisticas', authMiddleware, soloAdminGral, logsController.getEstadisticas);

// GET /api/seguridad/logs/:entidad/:idEntidad
router.get('/:entidad/:idEntidad', authMiddleware, soloAdminGral, logsController.getByEntidad);

export default router;