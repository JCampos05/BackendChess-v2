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
exports.cargarRankingFinal = exports.recalcularPosiciones = exports.deleteEstadistica = exports.updateEstadistica = exports.createEstadistica = exports.getEstadisticaByJugador = exports.getEstadisticasByTorneoCategoriaHastaRonda = exports.getEstadisticasByTorneoCategoria = exports.getEstadisticasByTorneo = exports.getAllEstadisticas = exports.getRankingFinalPublico = exports.getListaInicialPublica = void 0;
const service = __importStar(require("../services/estadisticas-torneo.service"));
// ── Públicas ─────────────────────────────────────────────────
const getListaInicialPublica = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const data = await service.getListaInicialPublica(idTorneo, idTorneoCategoria);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getListaInicialPublica = getListaInicialPublica;
const getRankingFinalPublico = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const result = await service.getRankingFinalPublico(idTorneo, idTorneoCategoria);
        res.json({ ok: true, data: result.ranking, sistemasDesempate: result.sistemasDesempate });
    }
    catch (err) {
        next(err);
    }
};
exports.getRankingFinalPublico = getRankingFinalPublico;
// ── Protegidas ───────────────────────────────────────────────
const getAllEstadisticas = async (req, res, next) => {
    try {
        const data = await service.getAllEstadisticas();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllEstadisticas = getAllEstadisticas;
const getEstadisticasByTorneo = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const data = await service.getEstadisticasByTorneo(idTorneo);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEstadisticasByTorneo = getEstadisticasByTorneo;
const getEstadisticasByTorneoCategoria = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const data = await service.getEstadisticasByTorneoCategoria(idTorneo, idTorneoCategoria);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEstadisticasByTorneoCategoria = getEstadisticasByTorneoCategoria;
const getEstadisticasByTorneoCategoriaHastaRonda = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const numeroRonda = Number(req.params.numeroRonda);
        const data = await service.getEstadisticasHastaRonda(idTorneo, idTorneoCategoria, numeroRonda);
        res.json({ ok: true, data, numeroRonda });
    }
    catch (err) {
        next(err);
    }
};
exports.getEstadisticasByTorneoCategoriaHastaRonda = getEstadisticasByTorneoCategoriaHastaRonda;
const getEstadisticaByJugador = async (req, res, next) => {
    try {
        const idJugador = Number(req.params.idJugador);
        const idTorneo = Number(req.params.idTorneo);
        const data = await service.getEstadisticaByJugador(idJugador, idTorneo);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getEstadisticaByJugador = getEstadisticaByJugador;
const createEstadistica = async (req, res, next) => {
    try {
        const { idJugador, idTorneo, idTorneoCategoria } = req.body;
        if (!idJugador || !idTorneo || !idTorneoCategoria) {
            res.status(400).json({ ok: false, mensaje: 'Faltan campos: idJugador, idTorneo, idTorneoCategoria' });
            return;
        }
        const data = await service.createEstadistica(req.body);
        res.status(201).json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.createEstadistica = createEstadistica;
const updateEstadistica = async (req, res, next) => {
    try {
        const idEstadistica = Number(req.params.id);
        const data = await service.updateEstadistica(idEstadistica, req.body);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.updateEstadistica = updateEstadistica;
const deleteEstadistica = async (req, res, next) => {
    try {
        const idEstadistica = Number(req.params.id);
        const data = await service.deleteEstadistica(idEstadistica);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEstadistica = deleteEstadistica;
const recalcularPosiciones = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const data = await service.recalcularPosiciones(idTorneo, idTorneoCategoria);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.recalcularPosiciones = recalcularPosiciones;
const cargarRankingFinal = async (req, res, next) => {
    try {
        const { idTorneo, idTorneoCategoria, jugadores } = req.body;
        if (!idTorneo || !idTorneoCategoria || !Array.isArray(jugadores)) {
            res.status(400).json({ ok: false, mensaje: 'Faltan: idTorneo, idTorneoCategoria, jugadores[]' });
            return;
        }
        const data = await service.cargarRankingFinal(idTorneo, idTorneoCategoria, jugadores);
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.cargarRankingFinal = cargarRankingFinal;
//# sourceMappingURL=estadisticas-torneo.controller.js.map