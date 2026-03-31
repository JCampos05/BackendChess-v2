import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import * as ligaCtrl from '../controllers/liga.controller';

const router = Router();

// ── Públicas ──────────────────────────────────────────────────
router.get('/publicas',         ligaCtrl.listarLigasPublicas);
router.get('/:id/posiciones',   ligaCtrl.tablaPosiciones);      // tabla pública

// ── Autenticadas ──────────────────────────────────────────────
router.use(authMiddleware);

// Liga CRUD
router.get ('/',    cualquierAdmin, ligaCtrl.listarLigas);
router.get ('/:id', cualquierAdmin, ligaCtrl.obtenerLiga);
router.post('/',    soloAdminGral,  ligaCtrl.crearLiga);
router.put ('/:id', soloAdminGral,  ligaCtrl.actualizarLiga);
router.patch('/:id/activo', soloAdminGral, ligaCtrl.toggleActivo);

// Grupos
router.get ('/:id/grupos',          cualquierAdmin, ligaCtrl.listarGrupos);
router.post('/:id/grupos',          soloAdminGral,  ligaCtrl.crearGrupo);
router.put ('/:id/grupos/:idGrupo', soloAdminGral,  ligaCtrl.actualizarGrupo);

// Jugadores de liga
router.get   ('/:id/jugadores',                         cualquierAdmin, ligaCtrl.listarJugadoresLiga);
router.post  ('/:id/jugadores',                         cualquierAdmin, ligaCtrl.inscribirJugador);
router.patch ('/:id/jugadores/:idJugadorLiga/confirmar-pago', cualquierAdmin, ligaCtrl.confirmarPagoLiga);
router.delete('/:id/jugadores/:idJugadorLiga',          soloAdminGral,  ligaCtrl.cancelarInscripcionLiga);

// Rondas
router.get  ('/:id/rondas',                cualquierAdmin, ligaCtrl.listarRondas);
router.post ('/:id/rondas',                soloAdminGral,  ligaCtrl.crearRonda);
router.patch('/:id/rondas/:idRonda/estado', cualquierAdmin, ligaCtrl.cambiarEstadoRonda);

// Mesas
router.get ('/:id/rondas/:idRonda/mesas',          cualquierAdmin, ligaCtrl.listarMesas);
router.post('/:id/rondas/:idRonda/mesas/generar',  soloAdminGral,  ligaCtrl.generarMesas);

// Partidas
router.post('/:id/mesas/:idMesa/partida', cualquierAdmin, ligaCtrl.registrarPartida);

export default router;