import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { cualquierAdmin } from '../middleware/roles.middleware';
import * as Ops from '../controllers/torneo-ops.controller';

// ════════════════════════════════════════════════════════════
// /api/torneo-categorias
// ════════════════════════════════════════════════════════════
const torneoCategoriaRouter = Router();

// Públicas (lectura) — params alineados con el service: idTorneo / idCategoria
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
    authMiddleware, cualquierAdmin,
    Ops.deleteTorneoCategoria,
);
torneoCategoriaRouter.patch(
    '/torneo/:idTorneo/categoria/:idCategoria/toggle',
    authMiddleware, cualquierAdmin,
    Ops.toggleActiveTorneoCategoria,
);

export default torneoCategoriaRouter;