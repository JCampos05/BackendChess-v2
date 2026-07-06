"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.partidaLigaRouter = exports.jugadorLigaRouter = exports.mesaLigaRouter = exports.rondaLigaRouter = exports.grupoLigaRouter = exports.infoLigaRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roles_middleware_1 = require("../middleware/roles.middleware");
const ctrl = __importStar(require("../controllers/liga-flat.controller"));
// ── /api/liga/info ──────────────────────────────────────────────
exports.infoLigaRouter = (0, express_1.Router)();
exports.infoLigaRouter.get('/activas', ctrl.listarLigasActivasPublico);
exports.infoLigaRouter.get('/todas', ctrl.listarTodasLigasPublico);
exports.infoLigaRouter.get('/:id/publico', ctrl.obtenerInfoLiga);
exports.infoLigaRouter.use(auth_middleware_1.authMiddleware);
exports.infoLigaRouter.get('/', roles_middleware_1.cualquierAdmin, ctrl.listarInfoLiga);
exports.infoLigaRouter.get('/:id', roles_middleware_1.cualquierAdmin, ctrl.obtenerInfoLiga);
exports.infoLigaRouter.get('/:id/stats', roles_middleware_1.cualquierAdmin, ctrl.obtenerStatsLiga);
exports.infoLigaRouter.post('/', roles_middleware_1.soloAdminGral, ctrl.crearInfoLiga);
exports.infoLigaRouter.put('/:id', roles_middleware_1.soloAdminGral, ctrl.actualizarInfoLiga);
exports.infoLigaRouter.delete('/:id', roles_middleware_1.soloAdminGral, ctrl.eliminarInfoLiga);
// ── /api/liga/grupos ─────────────────────────────────────────────
exports.grupoLigaRouter = (0, express_1.Router)();
exports.grupoLigaRouter.get('/liga/:idLiga/publico', ctrl.listarGruposPorLiga);
exports.grupoLigaRouter.get('/:id/tabla/publico', ctrl.obtenerTablaGrupo);
exports.grupoLigaRouter.use(auth_middleware_1.authMiddleware);
exports.grupoLigaRouter.get('/', roles_middleware_1.cualquierAdmin, ctrl.listarGrupos);
exports.grupoLigaRouter.get('/liga/:idLiga', roles_middleware_1.cualquierAdmin, ctrl.listarGruposPorLiga);
exports.grupoLigaRouter.get('/:id', roles_middleware_1.cualquierAdmin, ctrl.obtenerGrupo);
exports.grupoLigaRouter.get('/:id/tabla', roles_middleware_1.cualquierAdmin, ctrl.obtenerTablaGrupo);
exports.grupoLigaRouter.post('/', roles_middleware_1.soloAdminGral, ctrl.crearGrupo);
exports.grupoLigaRouter.put('/:id', roles_middleware_1.soloAdminGral, ctrl.actualizarGrupo);
exports.grupoLigaRouter.delete('/:id', roles_middleware_1.soloAdminGral, ctrl.eliminarGrupo);
// ── /api/liga/rondas ─────────────────────────────────────────────
exports.rondaLigaRouter = (0, express_1.Router)();
exports.rondaLigaRouter.get('/liga/:idLiga/publico', ctrl.listarRondasPorLiga);
exports.rondaLigaRouter.get('/grupo/:idGrupo/publico', ctrl.listarRondasPorGrupo);
exports.rondaLigaRouter.use(auth_middleware_1.authMiddleware);
exports.rondaLigaRouter.get('/', roles_middleware_1.cualquierAdmin, ctrl.listarRondas);
exports.rondaLigaRouter.get('/liga/:idLiga', roles_middleware_1.cualquierAdmin, ctrl.listarRondasPorLiga);
exports.rondaLigaRouter.get('/grupo/:idGrupo', roles_middleware_1.cualquierAdmin, ctrl.listarRondasPorGrupo);
exports.rondaLigaRouter.get('/:id', roles_middleware_1.cualquierAdmin, ctrl.obtenerRonda);
exports.rondaLigaRouter.post('/', roles_middleware_1.soloAdminGral, ctrl.crearRonda);
exports.rondaLigaRouter.put('/:id', roles_middleware_1.soloAdminGral, ctrl.actualizarRonda);
exports.rondaLigaRouter.put('/:id/iniciar', roles_middleware_1.cualquierAdmin, ctrl.iniciarRonda);
exports.rondaLigaRouter.put('/:id/finalizar', roles_middleware_1.cualquierAdmin, ctrl.finalizarRonda);
exports.rondaLigaRouter.delete('/:id', roles_middleware_1.soloAdminGral, ctrl.eliminarRonda);
// ── /api/liga/mesas ──────────────────────────────────────────────
exports.mesaLigaRouter = (0, express_1.Router)();
exports.mesaLigaRouter.get('/ronda/:idRonda/publico', ctrl.listarMesasPorRonda);
exports.mesaLigaRouter.use(auth_middleware_1.authMiddleware);
exports.mesaLigaRouter.get('/', roles_middleware_1.cualquierAdmin, ctrl.listarMesas);
exports.mesaLigaRouter.get('/ronda/:idRonda', roles_middleware_1.cualquierAdmin, ctrl.listarMesasPorRonda);
exports.mesaLigaRouter.get('/:id', roles_middleware_1.cualquierAdmin, ctrl.obtenerMesa);
exports.mesaLigaRouter.post('/', roles_middleware_1.soloAdminGral, ctrl.crearMesa);
exports.mesaLigaRouter.put('/:id', roles_middleware_1.soloAdminGral, ctrl.actualizarMesa);
exports.mesaLigaRouter.post('/:id/finalizar', roles_middleware_1.cualquierAdmin, ctrl.finalizarMesa);
exports.mesaLigaRouter.delete('/:id', roles_middleware_1.soloAdminGral, ctrl.eliminarMesa);
// ── /api/liga/jugadores ──────────────────────────────────────────
exports.jugadorLigaRouter = (0, express_1.Router)();
exports.jugadorLigaRouter.use(auth_middleware_1.authMiddleware);
exports.jugadorLigaRouter.get('/', roles_middleware_1.cualquierAdmin, ctrl.listarJugadoresLiga);
exports.jugadorLigaRouter.get('/liga/:idLiga', roles_middleware_1.cualquierAdmin, ctrl.listarJugadoresPorLiga);
exports.jugadorLigaRouter.get('/grupo/:idGrupo', roles_middleware_1.cualquierAdmin, ctrl.listarJugadoresPorGrupo);
exports.jugadorLigaRouter.get('/:id', roles_middleware_1.cualquierAdmin, ctrl.obtenerJugadorLiga);
exports.jugadorLigaRouter.post('/', roles_middleware_1.cualquierAdmin, ctrl.crearJugadorLiga);
exports.jugadorLigaRouter.put('/:id', roles_middleware_1.cualquierAdmin, ctrl.actualizarJugadorLiga);
exports.jugadorLigaRouter.put('/:id/confirmar-pago', roles_middleware_1.cualquierAdmin, ctrl.confirmarPagoJugadorLiga);
exports.jugadorLigaRouter.delete('/:id', roles_middleware_1.soloAdminGral, ctrl.eliminarJugadorLiga);
// ── /api/liga/partidas ───────────────────────────────────────────
exports.partidaLigaRouter = (0, express_1.Router)();
exports.partidaLigaRouter.use(auth_middleware_1.authMiddleware);
exports.partidaLigaRouter.get('/', roles_middleware_1.cualquierAdmin, ctrl.listarPartidas);
exports.partidaLigaRouter.get('/:id', roles_middleware_1.cualquierAdmin, ctrl.obtenerPartida);
exports.partidaLigaRouter.post('/', roles_middleware_1.cualquierAdmin, ctrl.crearPartida);
exports.partidaLigaRouter.put('/:id', roles_middleware_1.cualquierAdmin, ctrl.actualizarPartida);
exports.partidaLigaRouter.delete('/:id', roles_middleware_1.soloAdminGral, ctrl.eliminarPartida);
//# sourceMappingURL=liga-flat.routes.js.map