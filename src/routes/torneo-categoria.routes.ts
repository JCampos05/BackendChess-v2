import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { cualquierAdmin } from '../middleware/roles.middleware';
import { verificarAccesoTorneo } from '../middleware/torneo-admin.middleware';
import * as Ops from '../controllers/torneo-ops.controller';

// ════════════════════════════════════════════════════════════
// /api/torneo-categorias
// ════════════════════════════════════════════════════════════
const torneoCategoriaRouter = Router();

// Públicas (lectura) — usadas también por vistas públicas (ej. jugador-resultado),
// se dejan sin auth a propósito, no forman parte del blindaje de adminTorneo.
torneoCategoriaRouter.get('/torneo/:idTorneo', Ops.getCategoriasByTorneo);
torneoCategoriaRouter.get(
    '/torneo/:idTorneo/categoria/:idCategoria',
    Ops.getTorneoCategoria,
);

// Protegidas
torneoCategoriaRouter.post('/', authMiddleware, cualquierAdmin, Ops.upsertTorneoCategoria);
torneoCategoriaRouter.put('/', authMiddleware, cualquierAdmin, Ops.upsertTorneoCategoria);
torneoCategoriaRouter.delete(
    '/torneo/:idTorneo/categoria/:idCategoria',
    authMiddleware, cualquierAdmin, verificarAccesoTorneo('idTorneo'),
    Ops.deleteTorneoCategoria,
);
torneoCategoriaRouter.patch(
    '/torneo/:idTorneo/categoria/:idCategoria/toggle',
    authMiddleware, cualquierAdmin, verificarAccesoTorneo('idTorneo'),
    Ops.toggleActiveTorneoCategoria,
);

export default torneoCategoriaRouter;