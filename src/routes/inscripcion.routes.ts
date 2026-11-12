import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { cualquierAdmin, soloAdminGral } from '../middleware/roles.middleware';
import { verificarAccesoTorneo, verificarAccesoTorneoResuelto, resolverIdTorneoDesdeInscripcion } from '../middleware/torneo-admin.middleware';
import { limitadorInscripcionPublica } from '../middleware/rate-limit.middleware';
import * as inscripcionController from '../controllers/inscripcion.controller';

const router = Router();

// ── Autenticadas — cualquier admin ───────────────────────────

// GET /api/inscripciones/torneo/:idTorneo?estado=confirmado
router.get('/torneo/:idTorneo',
    authMiddleware, cualquierAdmin,
    verificarAccesoTorneo('idTorneo'),
    inscripcionController.listarPorTorneo
);

// GET /api/inscripciones/jugador/:idJugador
router.get('/jugador/:idJugador',
    authMiddleware, cualquierAdmin,
    inscripcionController.listarPorJugador
);

// GET /api/inscripciones/:id
router.get('/:id',
    authMiddleware, cualquierAdmin,
    verificarAccesoTorneoResuelto(resolverIdTorneoDesdeInscripcion),
    inscripcionController.obtenerUna
);

// POST /api/inscripciones — pública: cualquier persona puede inscribirse sin auth
router.post('/', limitadorInscripcionPublica, inscripcionController.crear);

// ── Solo admins ───────────────────────────────────────────────

// PATCH /api/inscripciones/:id
router.patch('/:id',
    authMiddleware, cualquierAdmin,
    verificarAccesoTorneoResuelto(resolverIdTorneoDesdeInscripcion),
    inscripcionController.actualizar
);

// PATCH /api/inscripciones/:id/confirmar-pago
router.patch('/:id/confirmar-pago',
    authMiddleware, cualquierAdmin,
    verificarAccesoTorneoResuelto(resolverIdTorneoDesdeInscripcion),
    inscripcionController.confirmarPago
);

// DELETE /api/inscripciones/:id — cancelación lógica
router.delete('/:id',
    authMiddleware, soloAdminGral,
    inscripcionController.cancelar
);

export default router;