import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as ctrl from '../controllers/patrocinador.controller';

// ════════════════════════════════════════════════════════════
// /api/patrocinadores
// ════════════════════════════════════════════════════════════
const router = Router();

// Públicas — para landing y uso general
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtener);

// Protegidas — solo adminGral administra patrocinadores
router.post  ('/',           authMiddleware, soloAdminGral, ctrl.crear);
router.put   ('/:id',        authMiddleware, soloAdminGral, ctrl.actualizar);
router.delete('/:id',        authMiddleware, soloAdminGral, ctrl.eliminar);
router.patch ('/:id/toggle', authMiddleware, soloAdminGral, ctrl.toggle);

export default router;
