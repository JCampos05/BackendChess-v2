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
const torneo_admin_middleware_1 = require("../middleware/torneo-admin.middleware");
const inscripcionController = __importStar(require("../controllers/inscripcion.controller"));
const router = (0, express_1.Router)();
// ── Autenticadas — cualquier admin ───────────────────────────
// GET /api/inscripciones/torneo/:idTorneo?estado=confirmado
router.get('/torneo/:idTorneo', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, (0, torneo_admin_middleware_1.verificarAccesoTorneo)('idTorneo'), inscripcionController.listarPorTorneo);
// GET /api/inscripciones/jugador/:idJugador
router.get('/jugador/:idJugador', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, inscripcionController.listarPorJugador);
// GET /api/inscripciones/:id
router.get('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, inscripcionController.obtenerUna);
// POST /api/inscripciones — pública: cualquier persona puede inscribirse sin auth
router.post('/', inscripcionController.crear);
// ── Solo admins ───────────────────────────────────────────────
// PATCH /api/inscripciones/:id
router.patch('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, inscripcionController.actualizar);
// PATCH /api/inscripciones/:id/confirmar-pago
router.patch('/:id/confirmar-pago', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, inscripcionController.confirmarPago);
// DELETE /api/inscripciones/:id — cancelación lógica
router.delete('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, inscripcionController.cancelar);
exports.default = router;
//# sourceMappingURL=inscripcion.routes.js.map