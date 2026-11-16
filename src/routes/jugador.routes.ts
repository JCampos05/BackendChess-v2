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

// Consulta pública de jugadores (/players-stats): sin ids numéricos, solo tokens opacos.
router.get('/consulta/buscar', jugadorController.buscarPublico);
router.get('/consulta/:token/stats', jugadorController.obtenerEstadisticasPublicas);

// ── Autenticadas ──────────────────────────────────────────────

// Carga masiva de ratings (solo adminGral). Antes de /:id para que 'ratings' no se tome como ID.
router.get('/ratings/todos', authMiddleware, soloAdminGral, jugadorController.listarParaRatings);
router.post('/ratings/masivo', authMiddleware, soloAdminGral, jugadorController.actualizarRatingsMasivo);

// GET /api/jugadores
router.get('/', authMiddleware, cualquierAdmin, jugadorController.listar);

// GET /api/jugadores/:id/stats — historial del jugador para gestión (solo administradores)
router.get('/:id/stats', authMiddleware, cualquierAdmin, jugadorController.obtenerEstadisticasAdmin);

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