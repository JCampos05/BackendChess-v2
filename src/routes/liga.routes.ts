import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as ligaCtrl from '../controllers/liga.controller';

const router = Router();

// ── Públicas ──────────────────────────────────────────────────
router.get('/publicas',         ligaCtrl.listarLigasPublicas);
router.get('/:id/posiciones',   ligaCtrl.tablaPosiciones);      // tabla pública

// ── Autenticadas — Ligas es exclusivo de adminGral, adminTorneo no lo ve ──
router.use(authMiddleware);
router.use(soloAdminGral);

// Liga CRUD
router.get ('/',    ligaCtrl.listarLigas);
router.get ('/:id', ligaCtrl.obtenerLiga);
router.post('/',    ligaCtrl.crearLiga);
router.put ('/:id', ligaCtrl.actualizarLiga);
router.patch('/:id/activo', ligaCtrl.toggleActivo);

// Grupos
router.get ('/:id/grupos',          ligaCtrl.listarGrupos);
router.post('/:id/grupos',          ligaCtrl.crearGrupo);
router.put ('/:id/grupos/:idGrupo', ligaCtrl.actualizarGrupo);

// Jugadores de liga
router.get   ('/:id/jugadores',                         ligaCtrl.listarJugadoresLiga);
router.post  ('/:id/jugadores',                         ligaCtrl.inscribirJugador);
router.patch ('/:id/jugadores/:idJugadorLiga/confirmar-pago', ligaCtrl.confirmarPagoLiga);
router.delete('/:id/jugadores/:idJugadorLiga',          ligaCtrl.cancelarInscripcionLiga);

// Rondas
router.get  ('/:id/rondas',                ligaCtrl.listarRondas);
router.post ('/:id/rondas',                ligaCtrl.crearRonda);
router.patch('/:id/rondas/:idRonda/estado', ligaCtrl.cambiarEstadoRonda);

// Mesas
router.get ('/:id/rondas/:idRonda/mesas',          ligaCtrl.listarMesas);
router.post('/:id/rondas/:idRonda/mesas/generar',  ligaCtrl.generarMesas);

// Partidas
router.post('/:id/mesas/:idMesa/partida', ligaCtrl.registrarPartida);

export default router;
