import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { cualquierAdmin } from '../middleware/roles.middleware';
import { verificarAccesoTorneo } from '../middleware/torneo-admin.middleware';
import * as ctrl from '../controllers/inscripciones-generales.controller';

const router = Router();

router.use(authMiddleware);

// NOTA: /resumen, /evolucion-temporal, /resumen-torneos y /por-torneo son
// dashboards agregados multi-torneo (sin un idTorneo único al que aplicar
// verificarAccesoTorneo) — quedan pendientes de una revisión aparte si se
// necesita que un adminTorneo no vea agregados de torneos ajenos ahí.
router.get('/resumen',              cualquierAdmin, ctrl.getResumenGeneral);
router.get('/evolucion-temporal',   cualquierAdmin, ctrl.getEvolucionTemporal);
router.get('/resumen-torneos',      cualquierAdmin, ctrl.getResumenTorneos);
router.get('/por-torneo',           cualquierAdmin, ctrl.getInscripcionesPorTorneo);
router.get('/torneos-selector',     cualquierAdmin, ctrl.getTorneosSelector);
router.get('/distribucion/:idTorneo', cualquierAdmin, verificarAccesoTorneo('idTorneo'), ctrl.getDistribucionCategoria);

export default router;
