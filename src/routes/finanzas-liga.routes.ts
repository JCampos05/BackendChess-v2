import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as ctrl from '../controllers/finanzas-liga.controller';

const router = Router();

// Las ligas son exclusivas de adminGral, igual que sus finanzas.
router.use(authMiddleware, soloAdminGral);

router.get('/resumen', ctrl.getResumen);
router.get('/:idLiga', ctrl.getDetalle);

export default router;
