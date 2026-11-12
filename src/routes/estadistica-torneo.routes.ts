import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { cualquierAdmin, soloAdminGral } from '../middleware/roles.middleware';
import {
    verificarAccesoTorneo, verificarAccesoTorneoResuelto,
    resolverIdTorneoDesdeCuerpo, resolverIdTorneoDesdeEstadistica,
} from '../middleware/torneo-admin.middleware';
import * as ctrl from '../controllers/estadisticas-torneo.controller';

const router = Router();

// ── Públicas — sin auth ──────────────────────────────────────
router.get('/lista-inicial/:idTorneo/:idTorneoCategoria', ctrl.getListaInicialPublica);
router.get('/ranking-final/:idTorneo/:idTorneoCategoria', ctrl.getRankingFinalPublico);

// ── Protegidas ───────────────────────────────────────────────
router.use(authMiddleware, cualquierAdmin);

// Listado global de todos los torneos → solo adminGral
router.get('/', soloAdminGral, ctrl.getAllEstadisticas);
router.get('/torneo/:idTorneo', verificarAccesoTorneo('idTorneo'), ctrl.getEstadisticasByTorneo);
router.get('/torneo/:idTorneo/categoria/:idTorneoCategoria', verificarAccesoTorneo('idTorneo'), ctrl.getEstadisticasByTorneoCategoria);
router.get('/torneo/:idTorneo/categoria/:idTorneoCategoria/ronda/:numeroRonda', verificarAccesoTorneo('idTorneo'), ctrl.getEstadisticasByTorneoCategoriaHastaRonda);
router.get('/jugador/:idJugador/torneo/:idTorneo', verificarAccesoTorneo('idTorneo'), ctrl.getEstadisticaByJugador);

router.post('/', verificarAccesoTorneoResuelto(resolverIdTorneoDesdeCuerpo()), ctrl.createEstadistica);
router.put('/:id', verificarAccesoTorneoResuelto(resolverIdTorneoDesdeEstadistica), ctrl.updateEstadistica);
// Borrar → solo adminGral (igual que rondas, mesas y partidas)
router.delete('/:id', soloAdminGral, ctrl.deleteEstadistica);
router.put('/recalcular/:idTorneo/:idTorneoCategoria', verificarAccesoTorneo('idTorneo'), ctrl.recalcularPosiciones);
router.post('/cargar-ranking', verificarAccesoTorneoResuelto(resolverIdTorneoDesdeCuerpo()), ctrl.cargarRankingFinal);

export default router;