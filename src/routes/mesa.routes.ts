import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import * as Ops from '../controllers/torneo-ops.controller';

// ════════════════════════════════════════════════════════════
// /api/mesas
// ════════════════════════════════════════════════════════════
const mesaRouter = Router();

// Pública
mesaRouter.get('/public/ronda/:idRonda', Ops.getMesasByRondaPublico);

// Protegidas — rutas estáticas/compuestas antes que dinámicas /:id
mesaRouter.get('/', authMiddleware, cualquierAdmin, Ops.getAllMesas);
mesaRouter.get('/ronda/:idRonda', authMiddleware, cualquierAdmin, Ops.getMesasByRonda);
mesaRouter.get('/:id/verificar-disponibilidad', authMiddleware, cualquierAdmin, Ops.verificarDisponibilidadMesa);
mesaRouter.get('/:id', authMiddleware, cualquierAdmin, Ops.getMesaById);
mesaRouter.post('/', authMiddleware, cualquierAdmin, Ops.createMesa);
mesaRouter.post('/:id/bloquear', authMiddleware, cualquierAdmin, Ops.bloquearMesa);
mesaRouter.post('/:id/liberar', authMiddleware, cualquierAdmin, Ops.liberarMesa);
mesaRouter.put('/:id', authMiddleware, cualquierAdmin, Ops.updateMesa);
// Borrar mesa → solo adminGral
mesaRouter.delete('/:id', authMiddleware, soloAdminGral, Ops.deleteMesa);

export default mesaRouter;