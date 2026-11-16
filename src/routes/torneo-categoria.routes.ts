import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { cualquierAdmin } from '../middleware/roles.middleware';
import { verificarAccesoTorneo, verificarAccesoTorneoResuelto, resolverIdTorneoDesdeCuerpo } from '../middleware/torneo-admin.middleware';
import * as Ops from '../controllers/torneo-ops.controller';

// ════════════════════════════════════════════════════════════
// /api/torneo-categorias
// ════════════════════════════════════════════════════════════
const torneoCategoriaRouter = Router();

// Lectura por id: solo el panel (las vistas públicas usan /api/consulta/torneos/:slug/categorias).
torneoCategoriaRouter.get('/torneo/:idTorneo', authMiddleware, cualquierAdmin, Ops.getCategoriasByTorneo);
torneoCategoriaRouter.get(
    '/torneo/:idTorneo/categoria/:idCategoria',
    authMiddleware, cualquierAdmin, Ops.getTorneoCategoria,
);

// Protegidas
torneoCategoriaRouter.post('/', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeCuerpo()), Ops.upsertTorneoCategoria);
torneoCategoriaRouter.put('/', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeCuerpo()), Ops.upsertTorneoCategoria);
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