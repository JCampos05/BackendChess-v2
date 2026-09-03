import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as ctrl from '../controllers/inscripciones-generales.controller';

const router = Router();

router.use(authMiddleware);

// Dashboard agregado multi-torneo (resumen, evolución, por-torneo, etc.) —
// exclusivo de adminGral. Un adminTorneo no debe ver datos agregados de
// torneos que no le pertenecen; ya tiene su propia vista scoped en
// Jugadores por Torneo y Estadísticas de Pago.
router.get('/resumen',              soloAdminGral, ctrl.getResumenGeneral);
router.get('/evolucion-temporal',   soloAdminGral, ctrl.getEvolucionTemporal);
router.get('/resumen-torneos',      soloAdminGral, ctrl.getResumenTorneos);
router.get('/por-torneo',           soloAdminGral, ctrl.getInscripcionesPorTorneo);
router.get('/torneos-selector',     soloAdminGral, ctrl.getTorneosSelector);
router.get('/distribucion/:idTorneo', soloAdminGral, ctrl.getDistribucionCategoria);

export default router;
