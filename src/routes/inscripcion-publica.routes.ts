import { Router } from 'express';
import * as ctrl from '../controllers/inscripcion-publica.controller';

// ════════════════════════════════════════════════════════════
// /api/inscripciones-publicas — 100% pública, sin authMiddleware.
// Es el flujo real que usa /inscripcion/:slug (landing pública).
// ════════════════════════════════════════════════════════════
const router = Router();

router.get('/torneo/:idTorneo/categorias', ctrl.obtenerCategorias);
router.get('/buscar-jugador', ctrl.buscarJugador);
router.post('/', ctrl.crear);

export default router;
