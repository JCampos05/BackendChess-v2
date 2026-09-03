import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import { verificarAccesoTorneo, verificarAccesoTorneoResuelto, resolverIdTorneoDesdePartida } from '../middleware/torneo-admin.middleware';
import * as Ops from '../controllers/torneo-ops.controller';

// ════════════════════════════════════════════════════════════
// /api/partidas
// ════════════════════════════════════════════════════════════
const partidaRouter = Router();

// Rutas compuestas antes que dinámicas /:id
partidaRouter.get('/', authMiddleware, cualquierAdmin, Ops.getAllPartidas);
partidaRouter.get(
    '/jugador/:idJugador/torneo/:idTorneo',
    authMiddleware, cualquierAdmin, verificarAccesoTorneo('idTorneo'),
    Ops.getPartidasByJugadorTorneo,
);
partidaRouter.get('/:id', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdePartida), Ops.getPartidaById);
partidaRouter.post('/', authMiddleware, cualquierAdmin, Ops.createPartida);
partidaRouter.put('/:id', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdePartida), Ops.updatePartida);
// Borrar partida → solo adminGral
partidaRouter.delete('/:id', authMiddleware, soloAdminGral, Ops.deletePartida);

export default partidaRouter;
