import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/estadisticas-torneo.controller';

const router = Router();

// ── Públicas — sin auth ──────────────────────────────────────
router.get('/lista-inicial/:idTorneo/:idTorneoCategoria', ctrl.getListaInicialPublica);
router.get('/ranking-final/:idTorneo/:idTorneoCategoria', ctrl.getRankingFinalPublico);

// ── Protegidas ───────────────────────────────────────────────
router.use(authMiddleware);

router.get('/', ctrl.getAllEstadisticas);
router.get('/torneo/:idTorneo', ctrl.getEstadisticasByTorneo);
router.get('/torneo/:idTorneo/categoria/:idTorneoCategoria', ctrl.getEstadisticasByTorneoCategoria);
router.get('/torneo/:idTorneo/categoria/:idTorneoCategoria/ronda/:numeroRonda', ctrl.getEstadisticasByTorneoCategoriaHastaRonda);
router.get('/jugador/:idJugador/torneo/:idTorneo', ctrl.getEstadisticaByJugador);

router.post('/', ctrl.createEstadistica);
router.put('/:id', ctrl.updateEstadistica);
router.delete('/:id', ctrl.deleteEstadistica);
router.put('/recalcular/:idTorneo/:idTorneoCategoria', ctrl.recalcularPosiciones);
router.post('/cargar-ranking', ctrl.cargarRankingFinal);

export default router;