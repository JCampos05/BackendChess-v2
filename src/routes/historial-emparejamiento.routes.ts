import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import * as Ops from '../controllers/torneo-ops.controller';

// ════════════════════════════════════════════════════════════
// /api/historial-emparejamiento
// ════════════════════════════════════════════════════════════
const historialRouter = Router();

// Rutas compuestas/estáticas antes que dinámicas
historialRouter.get('/', authMiddleware, cualquierAdmin, Ops.getAllHistorial);
historialRouter.get(
    '/torneo/:idTorneo',
    authMiddleware, cualquierAdmin,
    Ops.getHistorialByTorneo,
);
historialRouter.get(
    '/jugador/:idJugador/torneo/:idTorneo',
    authMiddleware, cualquierAdmin,
    Ops.getHistorialByJugador,
);
historialRouter.get(
    '/verificar/:idJugador1/:idJugador2/:idTorneo',
    authMiddleware, cualquierAdmin,
    Ops.verificarEnfrentamiento,
);
historialRouter.post('/', authMiddleware, cualquierAdmin, Ops.createHistorial);
historialRouter.post('/ronda', authMiddleware, cualquierAdmin, Ops.createHistorialRonda);
// Borrar historial → solo adminGral
historialRouter.delete('/:id', authMiddleware, soloAdminGral, Ops.deleteHistorial);

export default historialRouter;