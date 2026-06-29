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
exports.getEstadisticas = exports.getAll = void 0;
const historialService = __importStar(require("../../services/security/historial-acceso.service"));
const seguridad_validations_1 = require("../../validations/security/seguridad.validations");
// GET /api/seguridad/historial
const getAll = async (req, res, next) => {
    try {
        const filtros = seguridad_validations_1.filtrosHistorialSchema.parse(req.query);
        const resultado = await historialService.listarHistorial(filtros);
        res.json({ ok: true, ...resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.getAll = getAll;
// GET /api/seguridad/historial/estadisticas
const getEstadisticas = async (req, res, next) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const data = await historialService.obtenerEstadisticas(fechaInicio, fechaFin);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEstadisticas = getEstadisticas;
//# sourceMappingURL=historial-accesos.controller.js.map