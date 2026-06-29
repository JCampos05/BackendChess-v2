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
exports.getComparativaAnual = exports.getEvolucionTemporal = exports.getEstadisticasPorTorneo = exports.getEstadisticasPorCategoria = exports.getEstadisticasGenerales = void 0;
const service = __importStar(require("../services/estadisticas-pago.service"));
const parseIdTorneo = (val) => {
    const n = Number(val);
    return val && val !== 'null' && !isNaN(n) ? n : undefined;
};
const getEstadisticasGenerales = async (req, res, next) => {
    try {
        const data = await service.getEstadisticasGenerales({
            idTorneo: parseIdTorneo(req.query.idTorneo),
            fechaInicio: req.query.fecha_inicio,
            fechaFin: req.query.fecha_fin,
        });
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEstadisticasGenerales = getEstadisticasGenerales;
const getEstadisticasPorCategoria = async (req, res, next) => {
    try {
        const data = await service.getEstadisticasPorCategoria({
            idTorneo: parseIdTorneo(req.query.idTorneo),
            fechaInicio: req.query.fecha_inicio,
            fechaFin: req.query.fecha_fin,
        });
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEstadisticasPorCategoria = getEstadisticasPorCategoria;
const getEstadisticasPorTorneo = async (req, res, next) => {
    try {
        const data = await service.getEstadisticasPorTorneo({
            idTorneo: parseIdTorneo(req.query.idTorneo),
            fechaInicio: req.query.fecha_inicio,
            fechaFin: req.query.fecha_fin,
        });
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEstadisticasPorTorneo = getEstadisticasPorTorneo;
const getEvolucionTemporal = async (req, res, next) => {
    try {
        const data = await service.getEvolucionTemporal({
            idTorneo: parseIdTorneo(req.query.idTorneo),
            fechaInicio: req.query.fecha_inicio,
            fechaFin: req.query.fecha_fin,
            agrupacion: req.query.agrupacion,
        });
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEvolucionTemporal = getEvolucionTemporal;
const getComparativaAnual = async (req, res, next) => {
    try {
        const data = await service.getComparativaAnual({
            idTorneo: parseIdTorneo(req.query.idTorneo),
        });
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getComparativaAnual = getComparativaAnual;
//# sourceMappingURL=estadistica-pago.controller.js.map