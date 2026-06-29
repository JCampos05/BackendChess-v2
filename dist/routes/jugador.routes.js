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
const jugadorController = __importStar(require("../controllers/jugador.controller"));
const router = (0, express_1.Router)();
// ── Públicas — sin autenticación ─────────────────────────────
// GET /api/jugadores/buscar?q=termino — el frontend público usa esto para inscripciones
// IMPORTANTE: antes de /:id para que /buscar no se interprete como ID
router.get('/buscar', jugadorController.buscar);
// ── Autenticadas ──────────────────────────────────────────────
// GET /api/jugadores
router.get('/', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, jugadorController.listar);
// GET /api/jugadores/:id
router.get('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, jugadorController.obtenerUno);
// POST /api/jugadores — pública: inscripción sin cuenta
router.post('/', jugadorController.crear);
// ── Solo admins ───────────────────────────────────────────────
// PATCH /api/jugadores/:id
router.patch('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, jugadorController.actualizar);
// PATCH /api/jugadores/:id/estado
router.patch('/:id/estado', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, jugadorController.cambiarEstado);
// PATCH /api/jugadores/:id/confirmar-pago
router.patch('/:id/confirmar-pago', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, jugadorController.confirmarPago);
// GET /api/jugadores/:id/elegibilidad?idTorneo=&idCategoria=
router.get('/:id/elegibilidad', jugadorController.verificarElegibilidad);
exports.default = router;
//# sourceMappingURL=jugador.routes.js.map