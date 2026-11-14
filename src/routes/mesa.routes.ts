import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import { verificarAccesoTorneoResuelto, resolverIdTorneoDesdeRonda, resolverIdTorneoDesdeMesa, resolverIdTorneoDesdeCuerpoRonda } from '../middleware/torneo-admin.middleware';
import * as Ops from '../controllers/torneo-ops.controller';

// ════════════════════════════════════════════════════════════
// /api/mesas
// ════════════════════════════════════════════════════════════
const mesaRouter = Router();

// Pública
mesaRouter.get('/public/ronda/:idRonda', Ops.getMesasByRondaPublico);

// Protegidas — rutas estáticas/compuestas antes que dinámicas /:id
// Listado global de todos los torneos → solo adminGral
mesaRouter.get('/', authMiddleware, soloAdminGral, Ops.getAllMesas);
mesaRouter.get('/ronda/:idRonda', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeRonda), Ops.getMesasByRonda);
mesaRouter.get('/:id/verificar-disponibilidad', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeMesa), Ops.verificarDisponibilidadMesa);
mesaRouter.get('/:id', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeMesa), Ops.getMesaById);
mesaRouter.post('/', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeCuerpoRonda), Ops.createMesa);
mesaRouter.post('/:id/bloquear', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeMesa), Ops.bloquearMesa);
mesaRouter.post('/:id/liberar', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeMesa), Ops.liberarMesa);
mesaRouter.put('/:id', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeMesa), Ops.updateMesa);
// Borrar mesa: cualquier admin del torneo, solo si la ronda sigue pendiente (lo valida el servicio)
mesaRouter.delete('/:id', authMiddleware, cualquierAdmin, verificarAccesoTorneoResuelto(resolverIdTorneoDesdeMesa), Ops.deleteMesa);

export default mesaRouter;
