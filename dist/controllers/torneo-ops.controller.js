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
exports.deleteHistorial = exports.createHistorialRonda = exports.createHistorial = exports.verificarEnfrentamiento = exports.getHistorialByJugador = exports.getHistorialByTorneo = exports.getAllHistorial = exports.deletePartida = exports.updatePartida = exports.createPartida = exports.getPartidasByJugadorTorneo = exports.getPartidaById = exports.getAllPartidas = exports.liberarMesa = exports.bloquearMesa = exports.verificarDisponibilidadMesa = exports.deleteMesa = exports.updateMesa = exports.createMesa = exports.getMesaById = exports.getMesasByRondaPublico = exports.getMesasByRonda = exports.getAllMesas = exports.deleteRonda = exports.updateRonda = exports.createRonda = exports.getRondasByTorneoPublico = exports.getRondaById = exports.getRondasByTorneoCategoria = exports.getRondasByTorneo = exports.getAllRondas = exports.toggleActiveTorneoCategoria = exports.deleteTorneoCategoria = exports.getTorneoCategoria = exports.getCategoriasByTorneo = exports.upsertTorneoCategoria = void 0;
const TCSvc = __importStar(require("../services/torneo-categoria.service"));
const RondaSvc = __importStar(require("../services/ronda.service"));
const MesaSvc = __importStar(require("../services/mesa.service"));
const PartidaSvc = __importStar(require("../services/partida.service"));
const HistSvc = __importStar(require("../services/historial-emparejamiento.service"));
const error_middleware_1 = require("../middleware/error.middleware");
// ════════════════════════════════════════════════════════════
// TORNEO-CATEGORÍA
// ════════════════════════════════════════════════════════════
const upsertTorneoCategoria = async (req, res, next) => {
    try {
        const { idTorneo, idCategoria, rondas, ritmo_juego, sistema_competencia, calendario, premios, desempates, activo, cierre_inscripciones, cupo_maximo, } = req.body;
        if (!idTorneo || !idCategoria)
            throw new error_middleware_1.ValidationError('Torneo y categoría son obligatorios');
        if (calendario !== undefined && !Array.isArray(calendario))
            throw new error_middleware_1.ValidationError('El campo calendario debe ser un array');
        if (desempates !== undefined && !Array.isArray(desempates))
            throw new error_middleware_1.ValidationError('El campo desempates debe ser un array');
        if (cupo_maximo !== undefined && cupo_maximo !== null && (isNaN(Number(cupo_maximo)) || Number(cupo_maximo) < 1))
            throw new error_middleware_1.ValidationError('El cupo máximo debe ser un número positivo');
        const { data, created } = await TCSvc.upsertTorneoCategoria({
            idTorneo: Number(idTorneo),
            idCategoria: Number(idCategoria),
            rondas: rondas !== undefined ? parseInt(rondas) : undefined,
            ritmo_juego,
            sistema_competencia,
            calendario,
            premios,
            desempates,
            activo: activo !== undefined ? Boolean(activo) : undefined,
            cierre_inscripciones: cierre_inscripciones ?? undefined,
            cupo_maximo: cupo_maximo !== undefined ? (cupo_maximo === null ? null : Number(cupo_maximo)) : undefined,
        });
        res.status(created ? 201 : 200).json({
            ok: true,
            mensaje: created ? 'Categoría agregada al torneo' : 'Configuración actualizada',
            data,
        });
    }
    catch (e) {
        next(e);
    }
};
exports.upsertTorneoCategoria = upsertTorneoCategoria;
const getCategoriasByTorneo = async (req, res, next) => {
    try {
        const data = await TCSvc.getCategoriasByTorneo(parseInt(req.params.torneo_id));
        res.json({ ok: true, data, total: data.length });
    }
    catch (e) {
        next(e);
    }
};
exports.getCategoriasByTorneo = getCategoriasByTorneo;
const getTorneoCategoria = async (req, res, next) => {
    try {
        const data = await TCSvc.getTorneoCategoria(parseInt(req.params.torneo_id), parseInt(req.params.categoria_id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getTorneoCategoria = getTorneoCategoria;
const deleteTorneoCategoria = async (req, res, next) => {
    try {
        await TCSvc.deleteTorneoCategoria(parseInt(req.params.torneo_id), parseInt(req.params.categoria_id));
        res.json({ ok: true, mensaje: 'Categoría eliminada del torneo' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteTorneoCategoria = deleteTorneoCategoria;
const toggleActiveTorneoCategoria = async (req, res, next) => {
    try {
        const { activo } = req.body;
        const data = await TCSvc.toggleActiveTorneoCategoria(parseInt(req.params.torneo_id), parseInt(req.params.categoria_id), activo !== undefined ? Boolean(activo) : undefined);
        res.json({
            ok: true,
            mensaje: `Categoría ${data.activo ? 'activada' : 'desactivada'} en el torneo`,
            data,
        });
    }
    catch (e) {
        next(e);
    }
};
exports.toggleActiveTorneoCategoria = toggleActiveTorneoCategoria;
// ════════════════════════════════════════════════════════════
// RONDA
// ════════════════════════════════════════════════════════════
const getAllRondas = async (_req, res, next) => {
    try {
        const data = await RondaSvc.getAllRondas();
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllRondas = getAllRondas;
const getRondasByTorneo = async (req, res, next) => {
    try {
        const data = await RondaSvc.getRondasByTorneo(parseInt(req.params.idTorneo));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getRondasByTorneo = getRondasByTorneo;
const getRondasByTorneoCategoria = async (req, res, next) => {
    try {
        const data = await RondaSvc.getRondasByTorneoCat(parseInt(req.params.idTorneo), parseInt(req.params.idTorneoCategoria));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getRondasByTorneoCategoria = getRondasByTorneoCategoria;
const getRondaById = async (req, res, next) => {
    try {
        const data = await RondaSvc.getRondaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getRondaById = getRondaById;
/** Ruta pública — no usa AuthRequest pero Express lo pasa igual */
const getRondasByTorneoPublico = async (req, res, next) => {
    try {
        const data = await RondaSvc.getRondasByTorneoPublico(parseInt(req.params.idTorneo));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getRondasByTorneoPublico = getRondasByTorneoPublico;
const createRonda = async (req, res, next) => {
    try {
        const data = await RondaSvc.createRonda(req.body);
        res.status(201).json({ ok: true, mensaje: 'Ronda creada exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createRonda = createRonda;
const updateRonda = async (req, res, next) => {
    try {
        const data = await RondaSvc.updateRonda(parseInt(req.params.id), req.body);
        res.json({ ok: true, mensaje: 'Ronda actualizada exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.updateRonda = updateRonda;
const deleteRonda = async (req, res, next) => {
    try {
        await RondaSvc.deleteRonda(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Ronda eliminada exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteRonda = deleteRonda;
// ════════════════════════════════════════════════════════════
// MESA
// ════════════════════════════════════════════════════════════
const getAllMesas = async (_req, res, next) => {
    try {
        const data = await MesaSvc.getAllMesas();
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllMesas = getAllMesas;
const getMesasByRonda = async (req, res, next) => {
    try {
        const data = await MesaSvc.getMesasByRonda(parseInt(req.params.idRonda));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getMesasByRonda = getMesasByRonda;
const getMesasByRondaPublico = async (req, res, next) => {
    try {
        const data = await MesaSvc.getMesasByRondaPublico(parseInt(req.params.idRonda));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getMesasByRondaPublico = getMesasByRondaPublico;
const getMesaById = async (req, res, next) => {
    try {
        const data = await MesaSvc.getMesaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getMesaById = getMesaById;
const createMesa = async (req, res, next) => {
    try {
        const data = await MesaSvc.createMesa(req.body);
        res.status(201).json({ ok: true, mensaje: 'Mesa creada exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createMesa = createMesa;
const updateMesa = async (req, res, next) => {
    try {
        // req.usuario viene garantizado por authMiddleware
        const data = await MesaSvc.updateMesa(parseInt(req.params.id), req.body, req.usuario.telefono);
        res.json({ ok: true, mensaje: 'Mesa actualizada exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.updateMesa = updateMesa;
const deleteMesa = async (req, res, next) => {
    try {
        await MesaSvc.deleteMesa(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Mesa eliminada exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteMesa = deleteMesa;
const verificarDisponibilidadMesa = async (req, res, next) => {
    try {
        const result = await MesaSvc.verificarDisponibilidadMesa(parseInt(req.params.id));
        res.json({ ok: true, ...result });
    }
    catch (e) {
        next(e);
    }
};
exports.verificarDisponibilidadMesa = verificarDisponibilidadMesa;
const bloquearMesa = async (req, res, next) => {
    try {
        const { modoEdicion } = req.body;
        const data = await MesaSvc.bloquearMesa(parseInt(req.params.id), req.usuario.telefono, Boolean(modoEdicion));
        res.json({ ok: true, mensaje: 'Mesa bloqueada exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.bloquearMesa = bloquearMesa;
const liberarMesa = async (req, res, next) => {
    try {
        await MesaSvc.liberarMesa(parseInt(req.params.id), req.usuario.telefono);
        res.json({ ok: true, mensaje: 'Mesa liberada exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.liberarMesa = liberarMesa;
// ════════════════════════════════════════════════════════════
// PARTIDA
// ════════════════════════════════════════════════════════════
const getAllPartidas = async (_req, res, next) => {
    try {
        const data = await PartidaSvc.getAllPartidas();
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllPartidas = getAllPartidas;
const getPartidaById = async (req, res, next) => {
    try {
        const data = await PartidaSvc.getPartidaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getPartidaById = getPartidaById;
const getPartidasByJugadorTorneo = async (req, res, next) => {
    try {
        const data = await PartidaSvc.getPartidasByJugadorTorneo(parseInt(req.params.idJugador), parseInt(req.params.idTorneo));
        res.json({ ok: true, data, total: data.length });
    }
    catch (e) {
        next(e);
    }
};
exports.getPartidasByJugadorTorneo = getPartidasByJugadorTorneo;
const createPartida = async (req, res, next) => {
    try {
        const data = await PartidaSvc.createPartida(req.body);
        res.status(201).json({ ok: true, mensaje: 'Partida registrada y estadísticas actualizadas exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createPartida = createPartida;
const updatePartida = async (req, res, next) => {
    try {
        const data = await PartidaSvc.updatePartida(parseInt(req.params.id), req.body);
        res.json({ ok: true, mensaje: 'Partida y estadísticas actualizadas exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.updatePartida = updatePartida;
const deletePartida = async (req, res, next) => {
    try {
        await PartidaSvc.deletePartida(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Partida eliminada exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deletePartida = deletePartida;
// ════════════════════════════════════════════════════════════
// HISTORIAL EMPAREJAMIENTO
// ════════════════════════════════════════════════════════════
const getAllHistorial = async (_req, res, next) => {
    try {
        const data = await HistSvc.getAllHistorial();
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllHistorial = getAllHistorial;
const getHistorialByTorneo = async (req, res, next) => {
    try {
        const data = await HistSvc.getHistorialByTorneo(parseInt(req.params.idTorneo));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getHistorialByTorneo = getHistorialByTorneo;
const getHistorialByJugador = async (req, res, next) => {
    try {
        const data = await HistSvc.getHistorialByJugador(parseInt(req.params.idJugador), parseInt(req.params.idTorneo));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getHistorialByJugador = getHistorialByJugador;
const verificarEnfrentamiento = async (req, res, next) => {
    try {
        const result = await HistSvc.verificarEnfrentamiento(parseInt(req.params.idJugador1), parseInt(req.params.idJugador2), parseInt(req.params.idTorneo));
        res.json({ ok: true, ...result });
    }
    catch (e) {
        next(e);
    }
};
exports.verificarEnfrentamiento = verificarEnfrentamiento;
const createHistorial = async (req, res, next) => {
    try {
        const data = await HistSvc.createHistorial(req.body);
        res.status(201).json({ ok: true, mensaje: 'Emparejamiento registrado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createHistorial = createHistorial;
const createHistorialRonda = async (req, res, next) => {
    try {
        const { emparejamientos } = req.body;
        const data = await HistSvc.createHistorialRonda(emparejamientos);
        res.status(201).json({
            ok: true,
            mensaje: `${data.length} emparejamientos registrados exitosamente`,
            data,
        });
    }
    catch (e) {
        next(e);
    }
};
exports.createHistorialRonda = createHistorialRonda;
const deleteHistorial = async (req, res, next) => {
    try {
        await HistSvc.deleteHistorial(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Registro de historial eliminado exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteHistorial = deleteHistorial;
//# sourceMappingURL=torneo-ops.controller.js.map