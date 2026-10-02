import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { verificarAccesoTorneoResuelto, resolverIdTorneoDesdeFolio } from '../middleware/torneo-admin.middleware';
import * as ctrl from '../controllers/inscripcion-admin.controller';

const router = Router();

router.use(authMiddleware);

router.post('/',                           ctrl.crear);
router.get('/buscar-jugador',              ctrl.buscarJugador);
router.get('/eventos-activos',             ctrl.getEventosActivos);
router.get('/torneo/:idTorneo/categorias', ctrl.getCategoriasByTorneo);
router.get('/liga/:idLiga/grupos',         ctrl.getGruposByLiga);
// Un adminTorneo solo puede reemitir comprobantes de inscripciones de SUS torneos
router.get('/folio/:folio/comprobante',    verificarAccesoTorneoResuelto(resolverIdTorneoDesdeFolio), ctrl.getComprobante);

export default router;