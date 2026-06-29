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
const configController = __importStar(require("../controllers/config.controller"));
const router = (0, express_1.Router)();
// ── Públicas — sin autenticación ─────────────────────────────
// Info pública del comité (nombre, redes, contacto)
router.get('/', configController.obtenerConfig);
// Catálogos — el frontend los usa en formularios de inscripción
router.get('/zonas-horarias', configController.listarZonasHorarias);
router.get('/categorias', configController.listarCategorias);
router.get('/ritmos-juego', configController.listarRitmosJuego);
router.get('/sistemas-competencia', configController.listarSistemasCompetencia);
router.get('/sistemas-desempate', configController.listarSistemasDesempate);
router.get('/sistemas-pago', configController.listarSistemasPago);
router.get('/patrocinadores', configController.listarPatrocinadores);
// ── Solo adminGral ────────────────────────────────────────────
router.get('/completa', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, configController.obtenerConfigCompleta);
router.patch('/', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, configController.actualizarConfig);
exports.default = router;
//# sourceMappingURL=config.routes.js.map