import { Router } from 'express';
import * as ctrl from '../controllers/inscripcion-publica.controller';
import { limitadorInscripcionPublica, limitadorBusquedaPublica } from '../middleware/rate-limit.middleware';

// ════════════════════════════════════════════════════════════
// /api/inscripciones-publicas — 100% pública, sin authMiddleware.
// Es el flujo real que usa /inscripcion/:slug (landing pública).
// ════════════════════════════════════════════════════════════
const router = Router();

router.get('/torneo/:idTorneo/categorias', ctrl.obtenerCategorias);
router.get('/buscar-jugador', limitadorBusquedaPublica, ctrl.buscarJugador);
router.post('/', limitadorInscripcionPublica, ctrl.crear);

// Ligas
router.get('/liga/slug/:slug', ctrl.obtenerLigaPorSlug);
router.post('/liga', limitadorInscripcionPublica, ctrl.crearLiga);

export default router;
