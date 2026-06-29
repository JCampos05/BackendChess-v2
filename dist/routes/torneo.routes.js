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
const ctrl = __importStar(require("../controllers/torneo.controller"));
const router = (0, express_1.Router)();
// ── Públicas — sin autenticación ─────────────────────────────
// El frontend público usa estas rutas para la landing
router.get('/publicos', ctrl.listarTorneosPublicos);
router.get('/activos', ctrl.listarTorneosActivos);
router.get('/proximos', ctrl.listarTorneosProximos);
router.get('/todos', ctrl.listarTodosTorneos);
// ── Autenticadas ──────────────────────────────────────────────
router.use(auth_middleware_1.authMiddleware);
router.get('/', roles_middleware_1.cualquierAdmin, ctrl.listarTorneos);
router.get('/:id', roles_middleware_1.cualquierAdmin, ctrl.obtenerTorneo);
// ── CRUD exclusivo adminGral ──────────────────────────────────
router.post('/', roles_middleware_1.soloAdminGral, ctrl.crearTorneo);
router.put('/:id', roles_middleware_1.soloAdminGral, ctrl.actualizarTorneo);
router.delete('/:id', roles_middleware_1.soloAdminGral, ctrl.eliminarTorneo);
// ── Estado ────────────────────────────────────────────────────
router.patch('/:id/estado', roles_middleware_1.soloAdminGral, ctrl.cambiarEstado);
router.patch('/:id/activo', roles_middleware_1.soloAdminGral, ctrl.toggleActivo);
router.patch('/:id/es-actual', roles_middleware_1.soloAdminGral, ctrl.toggleEsActual);
// ── Categorías (adminGral o adminTorneo asignado) ─────────────
router.post('/:id/categorias', (0, torneo_admin_middleware_1.verificarAccesoTorneo)(), ctrl.asignarCategoria);
router.put('/:id/categorias/:idCategoria', (0, torneo_admin_middleware_1.verificarAccesoTorneo)(), ctrl.actualizarCategoria);
router.delete('/:id/categorias/:idCategoria', (0, torneo_admin_middleware_1.verificarAccesoTorneo)(), ctrl.desasignarCategoria);
// ── Patrocinadores ────────────────────────────────────────────
router.get('/:id/patrocinadores', roles_middleware_1.soloAdminGral, ctrl.listarPatrocinadores);
router.post('/:id/patrocinadores', roles_middleware_1.soloAdminGral, ctrl.asignarPatrocinador);
router.delete('/:id/patrocinadores/:idPatrocinador', roles_middleware_1.soloAdminGral, ctrl.removerPatrocinador);
// ── Admins asignados ──────────────────────────────────────────
router.post('/:id/admins', roles_middleware_1.soloAdminGral, ctrl.asignarAdmin);
router.delete('/:id/admins/:idUsuario', roles_middleware_1.soloAdminGral, ctrl.removerAdmin);
exports.default = router;
//# sourceMappingURL=torneo.routes.js.map