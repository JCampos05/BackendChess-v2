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
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roles_middleware_1 = require("../middleware/roles.middleware");
const ligaCtrl = __importStar(require("../controllers/liga.controller"));
const router = (0, express_1.Router)();
// ── Públicas ──────────────────────────────────────────────────
router.get('/publicas', ligaCtrl.listarLigasPublicas);
router.get('/:id/posiciones', ligaCtrl.tablaPosiciones); // tabla pública
// ── Autenticadas ──────────────────────────────────────────────
router.use(auth_middleware_1.authMiddleware);
// Liga CRUD
router.get('/', roles_middleware_1.cualquierAdmin, ligaCtrl.listarLigas);
router.get('/:id', roles_middleware_1.cualquierAdmin, ligaCtrl.obtenerLiga);
router.post('/', roles_middleware_1.soloAdminGral, ligaCtrl.crearLiga);
router.put('/:id', roles_middleware_1.soloAdminGral, ligaCtrl.actualizarLiga);
router.patch('/:id/activo', roles_middleware_1.soloAdminGral, ligaCtrl.toggleActivo);
// Grupos
router.get('/:id/grupos', roles_middleware_1.cualquierAdmin, ligaCtrl.listarGrupos);
router.post('/:id/grupos', roles_middleware_1.soloAdminGral, ligaCtrl.crearGrupo);
router.put('/:id/grupos/:idGrupo', roles_middleware_1.soloAdminGral, ligaCtrl.actualizarGrupo);
// Jugadores de liga
router.get('/:id/jugadores', roles_middleware_1.cualquierAdmin, ligaCtrl.listarJugadoresLiga);
router.post('/:id/jugadores', roles_middleware_1.cualquierAdmin, ligaCtrl.inscribirJugador);
router.patch('/:id/jugadores/:idJugadorLiga/confirmar-pago', roles_middleware_1.cualquierAdmin, ligaCtrl.confirmarPagoLiga);
router.delete('/:id/jugadores/:idJugadorLiga', roles_middleware_1.soloAdminGral, ligaCtrl.cancelarInscripcionLiga);
// Rondas
router.get('/:id/rondas', roles_middleware_1.cualquierAdmin, ligaCtrl.listarRondas);
router.post('/:id/rondas', roles_middleware_1.soloAdminGral, ligaCtrl.crearRonda);
router.patch('/:id/rondas/:idRonda/estado', roles_middleware_1.cualquierAdmin, ligaCtrl.cambiarEstadoRonda);
// Mesas
router.get('/:id/rondas/:idRonda/mesas', roles_middleware_1.cualquierAdmin, ligaCtrl.listarMesas);
router.post('/:id/rondas/:idRonda/mesas/generar', roles_middleware_1.soloAdminGral, ligaCtrl.generarMesas);
// Partidas
router.post('/:id/mesas/:idMesa/partida', roles_middleware_1.cualquierAdmin, ligaCtrl.registrarPartida);
exports.default = router;
//# sourceMappingURL=liga.routes.js.map