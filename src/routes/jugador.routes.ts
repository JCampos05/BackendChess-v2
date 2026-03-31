import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import * as jugadorController from '../controllers/jugador.controller';

const router = Router();

// ── Públicas — sin autenticación ─────────────────────────────

// GET /api/jugadores/buscar?q=termino — el frontend público usa esto para inscripciones
// IMPORTANTE: antes de /:id para que /buscar no se interprete como ID
router.get('/buscar', jugadorController.buscar);

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