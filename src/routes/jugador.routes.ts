import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import * as jugadorController from '../controllers/jugador.controller';

const router = Router();

// ── Públicas — sin autenticación ─────────────────────────────

// GET /api/jugadores/buscar?q=termino — el frontend público usa esto para inscripciones
// IMPORTANTE: antes de /:id para que /buscar no se interprete como ID
router.get('/buscar', jugadorController.buscar);

// GET /api/jugadores/search?nombre=&apellido1=&apellido2= — usada por la vista
// pública de estadísticas de jugador (formulario con 3 campos separados).
// IMPORTANTE: antes de /:id por la misma razón que /buscar.
router.get('/search', jugadorController.buscarPorCampos);

// GET /api/jugadores/:id/stats — estadísticas públicas (torneos + ligas) para /players-stats
router.get('/:id/stats', jugadorController.obtenerEstadisticasPublicas);

// ── Autenticadas ──────────────────────────────────────────────

// GET /api/jugadores
router.get('/', authMiddleware, cualquierAdmin, jugadorController.listar);

// GET /api/jugadores/:id
router.get('/:id', authMiddleware, cualquierAdmin, jugadorController.obtenerUno);

// POST /api/jugadores — pública: inscripción sin cuenta
router.post('/', jugadorController.crear);

// ── Solo admins ───────────────────────────────────────────────

// PATCH /api/jugadores/:id
router.patch('/:id', authMiddleware, cualquierAdmin, jugadorController.actualizar);

// PATCH /api/jugadores/:id/estado
router.patch('/:id/estado', authMiddleware, soloAdminGral, jugadorController.cambiarEstado);

// PATCH /api/jugadores/:id/confirmar-pago
router.patch('/:id/confirmar-pago', authMiddleware, cualquierAdmin, jugadorController.confirmarPago);

// GET /api/jugadores/:id/elegibilidad?idTorneo=&idCategoria=
router.get('/:id/elegibilidad', jugadorController.verificarElegibilidad);

export default router;