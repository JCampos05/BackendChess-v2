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
exports.sistemaPagoRouter = exports.sistemaDesempateRouter = exports.sistemaCompetenciaRouter = exports.ritmoJuegoRouter = exports.categoriaRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roles_middleware_1 = require("../middleware/roles.middleware");
const Cat = __importStar(require("../controllers/catalogo.controller"));
// ════════════════════════════════════════════════════════════
// /api/categorias
// ════════════════════════════════════════════════════════════
exports.categoriaRouter = (0, express_1.Router)();
exports.categoriaRouter.get('/', Cat.getAllCategorias);
exports.categoriaRouter.get('/:id', Cat.getCategoriaById);
exports.categoriaRouter.post('/', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.createCategoria);
exports.categoriaRouter.put('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.updateCategoria);
exports.categoriaRouter.delete('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.deleteCategoria);
// ════════════════════════════════════════════════════════════
// /api/ritmos-juego
// ════════════════════════════════════════════════════════════
exports.ritmoJuegoRouter = (0, express_1.Router)();
exports.ritmoJuegoRouter.get('/', Cat.getAllRitmos);
exports.ritmoJuegoRouter.get('/:id', Cat.getRitmoById);
exports.ritmoJuegoRouter.post('/', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.createRitmo);
exports.ritmoJuegoRouter.put('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.updateRitmo);
exports.ritmoJuegoRouter.delete('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.deleteRitmo);
// ════════════════════════════════════════════════════════════
// /api/sistemas-competencia
// ════════════════════════════════════════════════════════════
exports.sistemaCompetenciaRouter = (0, express_1.Router)();
exports.sistemaCompetenciaRouter.get('/', Cat.getAllSistemasCompetencia);
exports.sistemaCompetenciaRouter.get('/:id', Cat.getSistemaCompetenciaById);
exports.sistemaCompetenciaRouter.post('/', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.createSistemaCompetencia);
exports.sistemaCompetenciaRouter.put('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.updateSistemaCompetencia);
exports.sistemaCompetenciaRouter.delete('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.deleteSistemaCompetencia);
// ════════════════════════════════════════════════════════════
// /api/sistemas-desempate
// ════════════════════════════════════════════════════════════
exports.sistemaDesempateRouter = (0, express_1.Router)();
exports.sistemaDesempateRouter.get('/', Cat.getAllSistemasDesempate);
exports.sistemaDesempateRouter.get('/:id', Cat.getSistemaDesempateById);
exports.sistemaDesempateRouter.post('/', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.createSistemaDesempate);
exports.sistemaDesempateRouter.put('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.updateSistemaDesempate);
exports.sistemaDesempateRouter.delete('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.deleteSistemaDesempate);
// ════════════════════════════════════════════════════════════
// /api/sistema-pago
// ════════════════════════════════════════════════════════════
exports.sistemaPagoRouter = (0, express_1.Router)();
// Públicas — orden: rutas estáticas antes que dinámicas
exports.sistemaPagoRouter.get('/activos', Cat.getSistemasPagoActivos);
// Protegidas — solo adminGral gestiona cuentas de pago
exports.sistemaPagoRouter.get('/', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.getAllSistemasPago);
exports.sistemaPagoRouter.post('/', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.createSistemaPago);
exports.sistemaPagoRouter.put('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.updateSistemaPago);
exports.sistemaPagoRouter.delete('/:id', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.deleteSistemaPago);
exports.sistemaPagoRouter.patch('/:id/toggle', auth_middleware_1.authMiddleware, roles_middleware_1.soloAdminGral, Cat.toggleActiveSistemaPago);
// Pública dinámica — al final para no colisionar con /activos
exports.sistemaPagoRouter.get('/:id', Cat.getSistemaPagoById);
//# sourceMappingURL=catalogo.routes.js.map