import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
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
    authMiddleware, cualquierAdmin,
    Ops.getRondasByTorneoCategoria,
);
rondaRouter.get(
    '/torneo/:idTorneo',
    authMiddleware, cualquierAdmin,
    Ops.getRondasByTorneo,
);
rondaRouter.get('/', authMiddleware, cualquierAdmin, Ops.getAllRondas);
rondaRouter.get('/:id', authMiddleware, cualquierAdmin, Ops.getRondaById);
rondaRouter.post('/', authMiddleware, cualquierAdmin, Ops.createRonda);
rondaRouter.put('/:id', authMiddleware, cualquierAdmin, Ops.updateRonda);
// Borrar ronda → solo adminGral
rondaRouter.delete('/:id', authMiddleware, soloAdminGral, Ops.deleteRonda);

export default rondaRouter;