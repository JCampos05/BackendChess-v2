import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { cualquierAdmin } from '../middleware/roles.middleware';
import * as ctrl from '../controllers/inscripciones-generales.controller';

const router = Router();

router.use(authMiddleware);

router.get('/resumen',              cualquierAdmin, ctrl.getResumenGeneral);
router.get('/evolucion-temporal',   cualquierAdmin, ctrl.getEvolucionTemporal);
router.get('/resumen-torneos',      cualquierAdmin, ctrl.getResumenTorneos);
router.get('/por-torneo',           cualquierAdmin, ctrl.getInscripcionesPorTorneo);
router.get('/torneos-selector',     cualquierAdmin, ctrl.getTorneosSelector);
router.get('/distribucion/:idTorneo', cualquierAdmin, ctrl.getDistribucionCategoria);

export default router;
