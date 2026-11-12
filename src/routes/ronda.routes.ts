import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import { verificarAccesoTorneo, verificarAccesoTorneoResuelto, resolverIdTorneoDesdeRonda, resolverIdTorneoDesdeCuerpo } from '../middleware/torneo-admin.middleware';
import * as Ops from '../controllers/torneo-ops.controller';

// ════════════════════════════════════════════════════════════
// /api/rondas
// ════════════════════════════════════════════════════════════
const rondaRouter = Router();

// Pública — estática antes que dinámica
rondaRouter.get('/public/torneo/:idTorneo', Ops.getRondasByTorneoPublico);

// Protegidas — rutas con más segmentos antes que las genéricas para evitar colisiones
rondaRouter.get(
    '/torneo/:idTorneo/categoria/:idTorneoCategoria',
    authMiddleware, cualquierAdmin, verificarAccesoTorneo('idTorneo'),
    Ops.getRondasByTorneoCategoria,
);
rondaRouter.get(
    '/torneo/:idTorneo',
    authMiddleware, cualquierAdmin, verificarAccesoTorneo('idTorneo'),
    Ops.getRondasByTorneo,
);
// Listado global de todos los torneos → solo adminGral
rondaRouter.get('/', authMiddleware, soloAdminGral, Ops.getAllRondas);
rondaRouter.get('/:id', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeRonda), Ops.getRondaById);
rondaRouter.post('/', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeCuerpo()), Ops.createRonda);
rondaRouter.put('/:id', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeRonda), Ops.updateRonda);
// Borrar ronda → solo adminGral
rondaRouter.delete('/:id', authMiddleware, soloAdminGral, Ops.deleteRonda);

export default rondaRouter;
