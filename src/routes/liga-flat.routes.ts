import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import * as ctrl from '../controllers/liga-flat.controller';

// ── /api/liga/info ──────────────────────────────────────────────
export const infoLigaRouter = Router();

infoLigaRouter.get('/activas', ctrl.listarLigasActivasPublico);
infoLigaRouter.get('/todas',   ctrl.listarTodasLigasPublico);
infoLigaRouter.get('/:id/publico', ctrl.obtenerInfoLiga);

infoLigaRouter.use(authMiddleware);
infoLigaRouter.get   ('/',          cualquierAdmin, ctrl.listarInfoLiga);
infoLigaRouter.get   ('/:id',       cualquierAdmin, ctrl.obtenerInfoLiga);
infoLigaRouter.get   ('/:id/stats', cualquierAdmin, ctrl.obtenerStatsLiga);
infoLigaRouter.post  ('/',          soloAdminGral,  ctrl.crearInfoLiga);
infoLigaRouter.put   ('/:id',       soloAdminGral,  ctrl.actualizarInfoLiga);
infoLigaRouter.delete('/:id',       soloAdminGral,  ctrl.eliminarInfoLiga);

// ── /api/liga/grupos ─────────────────────────────────────────────
export const grupoLigaRouter = Router();

grupoLigaRouter.get('/liga/:idLiga/publico', ctrl.listarGruposPorLiga);
grupoLigaRouter.get('/:id/tabla/publico',    ctrl.obtenerTablaGrupo);

grupoLigaRouter.use(authMiddleware);
grupoLigaRouter.get   ('/',             cualquierAdmin, ctrl.listarGrupos);
grupoLigaRouter.get   ('/liga/:idLiga', cualquierAdmin, ctrl.listarGruposPorLiga);
grupoLigaRouter.get   ('/:id',          cualquierAdmin, ctrl.obtenerGrupo);
grupoLigaRouter.get   ('/:id/tabla',    cualquierAdmin, ctrl.obtenerTablaGrupo);
grupoLigaRouter.post  ('/',             soloAdminGral,  ctrl.crearGrupo);
grupoLigaRouter.put   ('/:id',          soloAdminGral,  ctrl.actualizarGrupo);
grupoLigaRouter.delete('/:id',          soloAdminGral,  ctrl.eliminarGrupo);

// ── /api/liga/rondas ─────────────────────────────────────────────
export const rondaLigaRouter = Router();

rondaLigaRouter.get('/liga/:idLiga/publico',   ctrl.listarRondasPorLiga);
rondaLigaRouter.get('/grupo/:idGrupo/publico', ctrl.listarRondasPorGrupo);

rondaLigaRouter.use(authMiddleware);
rondaLigaRouter.get   ('/',               cualquierAdmin, ctrl.listarRondas);
rondaLigaRouter.get   ('/liga/:idLiga',   cualquierAdmin, ctrl.listarRondasPorLiga);
rondaLigaRouter.get   ('/grupo/:idGrupo', cualquierAdmin, ctrl.listarRondasPorGrupo);
rondaLigaRouter.get   ('/:id',            cualquierAdmin, ctrl.obtenerRonda);
rondaLigaRouter.post  ('/',               soloAdminGral,  ctrl.crearRonda);
rondaLigaRouter.put   ('/:id',            soloAdminGral,  ctrl.actualizarRonda);
rondaLigaRouter.put   ('/:id/iniciar',    cualquierAdmin, ctrl.iniciarRonda);
rondaLigaRouter.put   ('/:id/finalizar',  cualquierAdmin, ctrl.finalizarRonda);
rondaLigaRouter.delete('/:id',            soloAdminGral,  ctrl.eliminarRonda);

// ── /api/liga/mesas ──────────────────────────────────────────────
export const mesaLigaRouter = Router();

mesaLigaRouter.get('/ronda/:idRonda/publico', ctrl.listarMesasPorRonda);

mesaLigaRouter.use(authMiddleware);
mesaLigaRouter.get   ('/',               cualquierAdmin, ctrl.listarMesas);
mesaLigaRouter.get   ('/ronda/:idRonda', cualquierAdmin, ctrl.listarMesasPorRonda);
mesaLigaRouter.get   ('/:id',            cualquierAdmin, ctrl.obtenerMesa);
mesaLigaRouter.post  ('/',               soloAdminGral,  ctrl.crearMesa);
mesaLigaRouter.put   ('/:id',            soloAdminGral,  ctrl.actualizarMesa);
mesaLigaRouter.post  ('/:id/finalizar',  cualquierAdmin, ctrl.finalizarMesa);
mesaLigaRouter.delete('/:id',            soloAdminGral,  ctrl.eliminarMesa);

// ── /api/liga/jugadores ──────────────────────────────────────────
export const jugadorLigaRouter = Router();

jugadorLigaRouter.use(authMiddleware);
jugadorLigaRouter.get   ('/',               cualquierAdmin, ctrl.listarJugadoresLiga);
jugadorLigaRouter.get   ('/liga/:idLiga',   cualquierAdmin, ctrl.listarJugadoresPorLiga);
jugadorLigaRouter.get   ('/grupo/:idGrupo', cualquierAdmin, ctrl.listarJugadoresPorGrupo);
jugadorLigaRouter.get   ('/:id',            cualquierAdmin, ctrl.obtenerJugadorLiga);
jugadorLigaRouter.post  ('/',               cualquierAdmin, ctrl.crearJugadorLiga);
jugadorLigaRouter.put   ('/:id',            cualquierAdmin, ctrl.actualizarJugadorLiga);
jugadorLigaRouter.put   ('/:id/confirmar-pago', cualquierAdmin, ctrl.confirmarPagoJugadorLiga);
jugadorLigaRouter.delete('/:id',            soloAdminGral,  ctrl.eliminarJugadorLiga);

// ── /api/liga/partidas ───────────────────────────────────────────
export const partidaLigaRouter = Router();

partidaLigaRouter.use(authMiddleware);
partidaLigaRouter.get   ('/',    cualquierAdmin, ctrl.listarPartidas);
partidaLigaRouter.get   ('/:id', cualquierAdmin, ctrl.obtenerPartida);
partidaLigaRouter.post  ('/',    cualquierAdmin, ctrl.crearPartida);
partidaLigaRouter.put   ('/:id', cualquierAdmin, ctrl.actualizarPartida);
partidaLigaRouter.delete('/:id', soloAdminGral,  ctrl.eliminarPartida);
