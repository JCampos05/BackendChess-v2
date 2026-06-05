import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/inscripcion-admin.controller';

const router = Router();

router.use(authMiddleware);

router.post('/',                           ctrl.crear);
router.get('/buscar-jugador',              ctrl.buscarJugador);
router.get('/eventos-activos',             ctrl.getEventosActivos);
router.get('/torneo/:idTorneo/categorias', ctrl.getCategoriasByTorneo);
router.get('/liga/:idLiga/grupos',         ctrl.getGruposByLiga);

export default router;