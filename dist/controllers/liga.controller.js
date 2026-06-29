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
exports.tablaPosiciones = exports.registrarPartida = exports.generarMesas = exports.listarMesas = exports.cambiarEstadoRonda = exports.crearRonda = exports.listarRondas = exports.cancelarInscripcionLiga = exports.confirmarPagoLiga = exports.inscribirJugador = exports.listarJugadoresLiga = exports.actualizarGrupo = exports.crearGrupo = exports.listarGrupos = exports.toggleActivo = exports.actualizarLiga = exports.crearLiga = exports.obtenerLiga = exports.listarLigasPublicas = exports.listarLigas = void 0;
const ligaService = __importStar(require("../services/liga.service"));
const liga_validations_1 = require("../validations/liga.validations");
const zodFail = (res, error) => {
    const errores = error.errors.map(e => e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message);
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};
// ── Liga ─────────────────────────────────────────────────────
const listarLigas = async (req, res, next) => {
    try {
        const parse = liga_validations_1.filtrosLigaSchema.safeParse(req.query);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await ligaService.listarLigas(parse.data);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.listarLigas = listarLigas;
// GET público para la landing
const listarLigasPublicas = async (_req, res, next) => {
    try {
        const resultado = await ligaService.listarLigas({ pagina: 1, limite: 10, activo: true });
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    }
    catch (err) {
        next(err);
    }
};
exports.listarLigasPublicas = listarLigasPublicas;
const obtenerLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const liga = await ligaService.obtenerLigaPorId(idLiga);
        res.json({ ok: true, data: liga });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerLiga = obtenerLiga;
const crearLiga = async (req, res, next) => {
    try {
        const parse = liga_validations_1.crearLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const liga = await ligaService.crearLiga(parse.data);
        res.status(201).json({ ok: true, data: liga });
    }
    catch (err) {
        next(err);
    }
};
exports.crearLiga = crearLiga;
const actualizarLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const parse = liga_validations_1.actualizarLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const liga = await ligaService.actualizarLiga(idLiga, parse.data);
        res.json({ ok: true, data: liga });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarLiga = actualizarLiga;
const toggleActivo = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const activo = Boolean(req.body.activo);
        const resultado = await ligaService.toggleActivoLiga(idLiga, activo);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleActivo = toggleActivo;
// ── Grupos ────────────────────────────────────────────────────
const listarGrupos = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const grupos = await ligaService.listarGrupos(idLiga);
        res.json({ ok: true, data: grupos });
    }
    catch (err) {
        next(err);
    }
};
exports.listarGrupos = listarGrupos;
const crearGrupo = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const parse = liga_validations_1.crearGrupoSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const grupo = await ligaService.crearGrupo(idLiga, parse.data);
        res.status(201).json({ ok: true, data: grupo });
    }
    catch (err) {
        next(err);
    }
};
exports.crearGrupo = crearGrupo;
const actualizarGrupo = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const idGrupoLiga = Number(req.params.idGrupo);
        const parse = liga_validations_1.actualizarGrupoSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const grupo = await ligaService.actualizarGrupo(idLiga, idGrupoLiga, parse.data);
        res.json({ ok: true, data: grupo });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarGrupo = actualizarGrupo;
// ── Jugadores de liga ─────────────────────────────────────────
const listarJugadoresLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const idGrupoLiga = req.query.idGrupo ? Number(req.query.idGrupo) : undefined;
        const jugadores = await ligaService.listarJugadoresLiga(idLiga, idGrupoLiga);
        res.json({ ok: true, data: jugadores, total: jugadores.length });
    }
    catch (err) {
        next(err);
    }
};
exports.listarJugadoresLiga = listarJugadoresLiga;
const inscribirJugador = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const parse = liga_validations_1.inscribirJugadorLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await ligaService.inscribirJugadorLiga(idLiga, parse.data);
        res.status(201).json({ ok: true, mensaje: 'Jugador inscrito en la liga', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.inscribirJugador = inscribirJugador;
const confirmarPagoLiga = async (req, res, next) => {
    try {
        const idJugadorLiga = Number(req.params.idJugadorLiga);
        const parse = liga_validations_1.confirmarPagoLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await ligaService.confirmarPagoLiga(idJugadorLiga, parse.data);
        res.json({ ok: true, mensaje: 'Pago confirmado', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.confirmarPagoLiga = confirmarPagoLiga;
const cancelarInscripcionLiga = async (req, res, next) => {
    try {
        const idJugadorLiga = Number(req.params.idJugadorLiga);
        const resultado = await ligaService.cancelarInscripcionLiga(idJugadorLiga);
        res.json({ ok: true, mensaje: 'Inscripción cancelada', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.cancelarInscripcionLiga = cancelarInscripcionLiga;
// ── Rondas ────────────────────────────────────────────────────
const listarRondas = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const idGrupoLiga = req.query.idGrupo ? Number(req.query.idGrupo) : undefined;
        const rondas = await ligaService.listarRondasLiga(idLiga, idGrupoLiga);
        res.json({ ok: true, data: rondas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarRondas = listarRondas;
const crearRonda = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const parse = liga_validations_1.crearRondaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const ronda = await ligaService.crearRondaLiga(idLiga, parse.data);
        res.status(201).json({ ok: true, data: ronda });
    }
    catch (err) {
        next(err);
    }
};
exports.crearRonda = crearRonda;
const cambiarEstadoRonda = async (req, res, next) => {
    try {
        const idRondaLiga = Number(req.params.idRonda);
        const parse = liga_validations_1.cambiarEstadoRondaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const ronda = await ligaService.cambiarEstadoRondaLiga(idRondaLiga, parse.data);
        res.json({ ok: true, data: ronda });
    }
    catch (err) {
        next(err);
    }
};
exports.cambiarEstadoRonda = cambiarEstadoRonda;
// ── Mesas ─────────────────────────────────────────────────────
const listarMesas = async (req, res, next) => {
    try {
        const idRondaLiga = Number(req.params.idRonda);
        const mesas = await ligaService.listarMesasLiga(idRondaLiga);
        res.json({ ok: true, data: mesas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarMesas = listarMesas;
const generarMesas = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const idRondaLiga = Number(req.params.idRonda);
        const mesas = await ligaService.generarMesasLiga(idLiga, idRondaLiga);
        res.status(201).json({ ok: true, data: mesas, total: mesas.length });
    }
    catch (err) {
        next(err);
    }
};
exports.generarMesas = generarMesas;
// ── Partidas ──────────────────────────────────────────────────
const registrarPartida = async (req, res, next) => {
    try {
        const idMesaLiga = Number(req.params.idMesa);
        const parse = liga_validations_1.registrarPartidaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const partida = await ligaService.registrarPartidaLiga(idMesaLiga, parse.data);
        res.status(201).json({ ok: true, mensaje: 'Partida registrada', data: partida });
    }
    catch (err) {
        next(err);
    }
};
exports.registrarPartida = registrarPartida;
// ── Tabla de posiciones ───────────────────────────────────────
const tablaPosiciones = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const idGrupoLiga = req.query.idGrupo ? Number(req.query.idGrupo) : undefined;
        const tabla = await ligaService.obtenerTablaPosiciones(idLiga, idGrupoLiga);
        res.json({ ok: true, data: tabla });
    }
    catch (err) {
        next(err);
    }
};
exports.tablaPosiciones = tablaPosiciones;
//# sourceMappingURL=liga.controller.js.map