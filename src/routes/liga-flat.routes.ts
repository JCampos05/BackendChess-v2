import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as ctrl from '../controllers/liga-flat.controller';

// ── /api/liga/info ──────────────────────────────────────────────
export const infoLigaRouter = Router();

infoLigaRouter.get('/activas', ctrl.listarLigasActivasPublico);
infoLigaRouter.get('/todas',   ctrl.listarTodasLigasPublico);
infoLigaRouter.get('/:id/publico', ctrl.obtenerInfoLiga);

// Autenticadas — Ligas es exclusivo de adminGral, adminTorneo no lo ve
infoLigaRouter.use(authMiddleware);
infoLigaRouter.use(soloAdminGral);
infoLigaRouter.get   ('/',          ctrl.listarInfoLiga);
infoLigaRouter.get   ('/:id',       ctrl.obtenerInfoLiga);
infoLigaRouter.get   ('/:id/stats', ctrl.obtenerStatsLiga);
infoLigaRouter.post  ('/',          ctrl.crearInfoLiga);
infoLigaRouter.put   ('/:id',       ctrl.actualizarInfoLiga);
infoLigaRouter.delete('/:id',       ctrl.eliminarInfoLiga);

// ── /api/liga/grupos ─────────────────────────────────────────────
export const grupoLigaRouter = Router();

grupoLigaRouter.get('/liga/:idLiga/publico', ctrl.listarGruposPorLiga);
grupoLigaRouter.get('/:id/tabla/publico',    ctrl.obtenerTablaGrupo);

grupoLigaRouter.use(authMiddleware);
grupoLigaRouter.use(soloAdminGral);
grupoLigaRouter.get   ('/',             ctrl.listarGrupos);
grupoLigaRouter.get   ('/liga/:idLiga', ctrl.listarGruposPorLiga);
grupoLigaRouter.get   ('/:id',          ctrl.obtenerGrupo);
grupoLigaRouter.get   ('/:id/tabla',    ctrl.obtenerTablaGrupo);
grupoLigaRouter.post  ('/',             ctrl.crearGrupo);
grupoLigaRouter.put   ('/:id',          ctrl.actualizarGrupo);
grupoLigaRouter.delete('/:id',          ctrl.eliminarGrupo);

// ── /api/liga/rondas ─────────────────────────────────────────────
export const rondaLigaRouter = Router();

rondaLigaRouter.get('/liga/:idLiga/publico',   ctrl.listarRondasPorLiga);
rondaLigaRouter.get('/grupo/:idGrupo/publico', ctrl.listarRondasPorGrupo);

rondaLigaRouter.use(authMiddleware);
rondaLigaRouter.use(soloAdminGral);
rondaLigaRouter.get   ('/',               ctrl.listarRondas);
rondaLigaRouter.get   ('/liga/:idLiga',   ctrl.listarRondasPorLiga);
rondaLigaRouter.get   ('/grupo/:idGrupo', ctrl.listarRondasPorGrupo);
rondaLigaRouter.get   ('/:id',            ctrl.obtenerRonda);
rondaLigaRouter.post  ('/',               ctrl.crearRonda);
rondaLigaRouter.put   ('/:id',            ctrl.actualizarRonda);
rondaLigaRouter.put   ('/:id/iniciar',    ctrl.iniciarRonda);
rondaLigaRouter.put   ('/:id/finalizar',  ctrl.finalizarRonda);
rondaLigaRouter.delete('/:id',            ctrl.eliminarRonda);

// ── /api/liga/mesas ──────────────────────────────────────────────
export const mesaLigaRouter = Router();

mesaLigaRouter.get('/ronda/:idRonda/publico', ctrl.listarMesasPorRonda);

mesaLigaRouter.use(authMiddleware);
mesaLigaRouter.use(soloAdminGral);
mesaLigaRouter.get   ('/',               ctrl.listarMesas);
mesaLigaRouter.get   ('/ronda/:idRonda', ctrl.listarMesasPorRonda);
mesaLigaRouter.get   ('/:id',            ctrl.obtenerMesa);
mesaLigaRouter.post  ('/',               ctrl.crearMesa);
mesaLigaRouter.put   ('/:id',            ctrl.actualizarMesa);
mesaLigaRouter.post  ('/:id/finalizar',  ctrl.finalizarMesa);
mesaLigaRouter.delete('/:id',            ctrl.eliminarMesa);

// ── /api/liga/jugadores ──────────────────────────────────────────
export const jugadorLigaRouter = Router();

jugadorLigaRouter.use(authMiddleware);
jugadorLigaRouter.use(soloAdminGral);
jugadorLigaRouter.get   ('/',               ctrl.listarJugadoresLiga);
jugadorLigaRouter.get   ('/liga/:idLiga',   ctrl.listarJugadoresPorLiga);
jugadorLigaRouter.get   ('/grupo/:idGrupo', ctrl.listarJugadoresPorGrupo);
jugadorLigaRouter.get   ('/:id',            ctrl.obtenerJugadorLiga);
jugadorLigaRouter.post  ('/',               ctrl.crearJugadorLiga);
jugadorLigaRouter.put   ('/:id',            ctrl.actualizarJugadorLiga);
jugadorLigaRouter.put   ('/:id/confirmar-pago', ctrl.confirmarPagoJugadorLiga);
jugadorLigaRouter.delete('/:id',            ctrl.eliminarJugadorLiga);

// ── /api/liga/partidas ───────────────────────────────────────────
export const partidaLigaRouter = Router();

partidaLigaRouter.use(authMiddleware);
partidaLigaRouter.use(soloAdminGral);
partidaLigaRouter.get   ('/',    ctrl.listarPartidas);
partidaLigaRouter.get   ('/:id', ctrl.obtenerPartida);
partidaLigaRouter.post  ('/',    ctrl.crearPartida);
partidaLigaRouter.put   ('/:id', ctrl.actualizarPartida);
partidaLigaRouter.delete('/:id', ctrl.eliminarPartida);
