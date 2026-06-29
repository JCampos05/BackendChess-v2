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
const authController = __importStar(require("../controllers/auth.controller"));
const router = (0, express_1.Router)();
// ── Públicas — sin autenticación ─────────────────────────────
router.post('/login', authController.login);
// ── Autenticadas — cualquier admin ───────────────────────────
router.get('/profile', auth_middleware_1.authMiddleware, authController.obtenerProfile);
router.post('/logout', auth_middleware_1.authMiddleware, authController.logout);
router.patch('/password', auth_middleware_1.authMiddleware, authController.cambiarPassword);
router.get('/sesiones', auth_middleware_1.authMiddleware, authController.misSesiones);
// ── Solo adminGral ────────────────────────────────────────────
router.post('/usuarios', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, authController.crearUsuario);
router.get('/usuarios', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, authController.listarUsuarios);
router.patch('/usuarios/:id/toggle', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, authController.toggleUsuario);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map