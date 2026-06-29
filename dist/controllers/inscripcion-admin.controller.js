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
exports.buscarJugador = exports.getGruposByLiga = exports.getCategoriasByTorneo = exports.getEventosActivos = exports.crear = void 0;
const service = __importStar(require("../services/inscripcion-admin.service"));
const crear = async (req, res, next) => {
    try {
        const { tipo, ...datos } = req.body;
        if (!tipo || (tipo !== 'torneo' && tipo !== 'liga')) {
            res.status(400).json({ ok: false, mensaje: 'El tipo debe ser "torneo" o "liga"' });
            return;
        }
        if (tipo === 'torneo') {
            const data = await service.inscribirEnTorneo(datos);
            res.status(201).json({ ok: true, tipo: 'torneo', data });
        }
        else {
            const data = await service.inscribirEnLiga(datos);
            res.status(201).json({ ok: true, tipo: 'liga', data });
        }
    }
    catch (err) {
        next(err);
    }
};
exports.crear = crear;
const getEventosActivos = async (req, res, next) => {
    try {
        const data = await service.getEventosActivos();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEventosActivos = getEventosActivos;
const getCategoriasByTorneo = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        if (isNaN(idTorneo)) {
            res.status(400).json({ ok: false, mensaje: 'ID de torneo inválido' });
            return;
        }
        const data = await service.getCategoriasByTorneo(idTorneo);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getCategoriasByTorneo = getCategoriasByTorneo;
const getGruposByLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.idLiga);
        if (isNaN(idLiga)) {
            res.status(400).json({ ok: false, mensaje: 'ID de liga inválido' });
            return;
        }
        const data = await service.getGruposByLiga(idLiga);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getGruposByLiga = getGruposByLiga;
const buscarJugador = async (req, res, next) => {
    try {
        const q = String(req.query.q ?? '').trim();
        if (q.length < 2) {
            res.status(400).json({ ok: false, mensaje: 'El parámetro q debe tener al menos 2 caracteres' });
            return;
        }
        const data = await service.buscarJugadorSimilar(q);
        res.json({ ok: true, total: data.length, data });
    }
    catch (err) {
        next(err);
    }
};
exports.buscarJugador = buscarJugador;
//# sourceMappingURL=inscripcion-admin.controller.js.map