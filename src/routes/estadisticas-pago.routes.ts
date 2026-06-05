import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/estadistica-pago.controller';

const router = Router();

router.use(authMiddleware);

router.get('/generales',        ctrl.getEstadisticasGenerales);
router.get('/por-categoria',    ctrl.getEstadisticasPorCategoria);
router.get('/por-torneo',       ctrl.getEstadisticasPorTorneo);
router.get('/evolucion',        ctrl.getEvolucionTemporal);
router.get('/comparativa-anual', ctrl.getComparativaAnual);

export default router;