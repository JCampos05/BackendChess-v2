import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as ctrl from '../controllers/comprobantes.controller';

const router = Router();

// Gestión de comprobantes: listado unificado de torneos y ligas (datos personales de todos los
// eventos), por eso es exclusivo de adminGral. Un adminTorneo reemite el comprobante de las
// inscripciones de SU torneo desde Inscripciones (GET /inscripciones-admin/folio/:folio/comprobante).
router.use(authMiddleware, soloAdminGral);

router.get('/',        ctrl.listar);
router.get('/resumen', ctrl.resumen);
router.post('/emitir', ctrl.emitir);

export default router;
