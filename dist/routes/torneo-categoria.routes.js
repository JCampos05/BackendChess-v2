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
const Ops = __importStar(require("../controllers/torneo-ops.controller"));
// ════════════════════════════════════════════════════════════
// /api/torneo-categorias
// ════════════════════════════════════════════════════════════
const torneoCategoriaRouter = (0, express_1.Router)();
// Públicas (lectura) — params alineados con el service: idTorneo / idCategoria
torneoCategoriaRouter.get('/torneo/:idTorneo', Ops.getCategoriasByTorneo);
torneoCategoriaRouter.get('/torneo/:idTorneo/categoria/:idCategoria', Ops.getTorneoCategoria);
// Protegidas
torneoCategoriaRouter.post('/', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, Ops.upsertTorneoCategoria);
torneoCategoriaRouter.put('/', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, Ops.upsertTorneoCategoria);
torneoCategoriaRouter.delete('/torneo/:idTorneo/categoria/:idCategoria', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, Ops.deleteTorneoCategoria);
torneoCategoriaRouter.patch('/torneo/:idTorneo/categoria/:idCategoria/toggle', auth_middleware_1.authMiddleware, roles_middleware_1.cualquierAdmin, Ops.toggleActiveTorneoCategoria);
exports.default = torneoCategoriaRouter;
//# sourceMappingURL=torneo-categoria.routes.js.map