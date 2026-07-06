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
exports.getTorneosSelector = exports.getDistribucionCategoria = exports.getInscripcionesPorTorneo = exports.getResumenTorneos = exports.getEvolucionTemporal = exports.getResumenGeneral = void 0;
const service = __importStar(require("../services/inscripciones-generales.service"));
const PERIODOS = ['dia', 'semana', 'mes', 'anio'];
const parsePeriodo = (valor) => {
    return PERIODOS.includes(valor) ? valor : 'mes';
};
const getResumenGeneral = async (req, res, next) => {
    try {
        const periodo = parsePeriodo(req.query.periodo);
        const resumen = await service.obtenerResumenGeneral(periodo);
        res.json({ ok: true, data: resumen });
    }
    catch (err) {
        next(err);
    }
};
exports.getResumenGeneral = getResumenGeneral;
const getEvolucionTemporal = async (req, res, next) => {
    try {
        const periodo = parsePeriodo(req.query.periodo);
        const fechaInicio = typeof req.query.fechaInicio === 'string' ? req.query.fechaInicio : undefined;
        const fechaFin = typeof req.query.fechaFin === 'string' ? req.query.fechaFin : undefined;
        const evolucion = await service.obtenerEvolucionTemporal(periodo, fechaInicio, fechaFin);
        res.json({ ok: true, data: evolucion });
    }
    catch (err) {
        next(err);
    }
};
exports.getEvolucionTemporal = getEvolucionTemporal;
const getResumenTorneos = async (_req, res, next) => {
    try {
        const resumen = await service.obtenerResumenTorneos();
        res.json({ ok: true, data: resumen });
    }
    catch (err) {
        next(err);
    }
};
exports.getResumenTorneos = getResumenTorneos;
const getInscripcionesPorTorneo = async (req, res, next) => {
    try {
        const limite = req.query.limite ? Number(req.query.limite) : 10;
        const datos = await service.obtenerInscripcionesPorTorneo(limite);
        res.json({ ok: true, data: datos });
    }
    catch (err) {
        next(err);
    }
};
exports.getInscripcionesPorTorneo = getInscripcionesPorTorneo;
const getDistribucionCategoria = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const datos = await service.obtenerDistribucionCategoria(idTorneo);
        res.json({ ok: true, data: datos });
    }
    catch (err) {
        next(err);
    }
};
exports.getDistribucionCategoria = getDistribucionCategoria;
const getTorneosSelector = async (_req, res, next) => {
    try {
        const torneos = await service.obtenerTorneosParaSelector();
        res.json({ ok: true, data: torneos });
    }
    catch (err) {
        next(err);
    }
};
exports.getTorneosSelector = getTorneosSelector;
//# sourceMappingURL=inscripciones-generales.controller.js.map