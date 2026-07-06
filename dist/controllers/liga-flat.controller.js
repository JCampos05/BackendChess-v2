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
exports.eliminarPartida = exports.actualizarPartida = exports.crearPartida = exports.obtenerPartida = exports.listarPartidas = exports.eliminarJugadorLiga = exports.confirmarPagoJugadorLiga = exports.actualizarJugadorLiga = exports.crearJugadorLiga = exports.obtenerJugadorLiga = exports.listarJugadoresPorGrupo = exports.listarJugadoresPorLiga = exports.listarJugadoresLiga = exports.eliminarMesa = exports.finalizarMesa = exports.actualizarMesa = exports.crearMesa = exports.obtenerMesa = exports.listarMesasPorRonda = exports.listarMesas = exports.eliminarRonda = exports.finalizarRonda = exports.iniciarRonda = exports.actualizarRonda = exports.crearRonda = exports.obtenerRonda = exports.listarRondasPorGrupo = exports.listarRondasPorLiga = exports.listarRondas = exports.eliminarGrupo = exports.actualizarGrupo = exports.crearGrupo = exports.obtenerTablaGrupo = exports.obtenerGrupo = exports.listarGruposPorLiga = exports.listarGrupos = exports.eliminarInfoLiga = exports.actualizarInfoLiga = exports.crearInfoLiga = exports.obtenerStatsLiga = exports.obtenerInfoLiga = exports.listarLigasActivasPublico = exports.listarTodasLigasPublico = exports.listarInfoLiga = void 0;
const ligaService = __importStar(require("../services/liga.service"));
const flatService = __importStar(require("../services/liga-flat.service"));
const liga_validations_1 = require("../validations/liga.validations");
const zodFail = (res, error) => {
    const errores = error.errors.map(e => e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message);
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};
// ============================================================
// INFO LIGA  (/api/liga/info)
// ============================================================
const listarInfoLiga = async (req, res, next) => {
    try {
        const parse = liga_validations_1.filtrosLigaSchema.safeParse(req.query);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await ligaService.listarLigas(parse.data);
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    }
    catch (err) {
        next(err);
    }
};
exports.listarInfoLiga = listarInfoLiga;
const listarTodasLigasPublico = async (_req, res, next) => {
    try {
        const ligas = await flatService.listarTodasLigas();
        res.json({ ok: true, data: ligas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarTodasLigasPublico = listarTodasLigasPublico;
const listarLigasActivasPublico = async (_req, res, next) => {
    try {
        const ligas = await flatService.listarLigasActivas();
        res.json({ ok: true, data: ligas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarLigasActivasPublico = listarLigasActivasPublico;
const obtenerInfoLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const liga = await ligaService.obtenerLigaPorId(idLiga);
        res.json({ ok: true, data: liga });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerInfoLiga = obtenerInfoLiga;
const obtenerStatsLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const stats = await flatService.obtenerStatsLiga(idLiga);
        res.json({ ok: true, data: stats });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerStatsLiga = obtenerStatsLiga;
const crearInfoLiga = async (req, res, next) => {
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
exports.crearInfoLiga = crearInfoLiga;
const actualizarInfoLiga = async (req, res, next) => {
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
exports.actualizarInfoLiga = actualizarInfoLiga;
const eliminarInfoLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.id);
        const liga = await flatService.eliminarLiga(idLiga);
        res.json({ ok: true, mensaje: 'Liga desactivada', data: liga });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarInfoLiga = eliminarInfoLiga;
// ============================================================
// GRUPOS  (/api/liga/grupos)
// ============================================================
const listarGrupos = async (req, res, next) => {
    try {
        const idLiga = req.query.idLiga ? Number(req.query.idLiga) : undefined;
        const grupos = await flatService.listarGruposFlat(idLiga);
        res.json({ ok: true, data: grupos });
    }
    catch (err) {
        next(err);
    }
};
exports.listarGrupos = listarGrupos;
const listarGruposPorLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.idLiga);
        const grupos = await flatService.listarGruposFlat(idLiga);
        res.json({ ok: true, data: grupos });
    }
    catch (err) {
        next(err);
    }
};
exports.listarGruposPorLiga = listarGruposPorLiga;
const obtenerGrupo = async (req, res, next) => {
    try {
        const idGrupoLiga = Number(req.params.id);
        const grupo = await flatService.obtenerGrupoPorId(idGrupoLiga);
        res.json({ ok: true, data: grupo });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerGrupo = obtenerGrupo;
const obtenerTablaGrupo = async (req, res, next) => {
    try {
        const idGrupoLiga = Number(req.params.id);
        const tabla = await flatService.obtenerTablaGrupo(idGrupoLiga);
        res.json({ ok: true, data: tabla });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerTablaGrupo = obtenerTablaGrupo;
const crearGrupo = async (req, res, next) => {
    try {
        const parse = liga_validations_1.crearGrupoFlatSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const grupo = await flatService.crearGrupoFlat(parse.data);
        res.status(201).json({ ok: true, data: grupo });
    }
    catch (err) {
        next(err);
    }
};
exports.crearGrupo = crearGrupo;
const actualizarGrupo = async (req, res, next) => {
    try {
        const idGrupoLiga = Number(req.params.id);
        const parse = liga_validations_1.actualizarGrupoSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const grupo = await flatService.actualizarGrupoFlat(idGrupoLiga, parse.data);
        res.json({ ok: true, data: grupo });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarGrupo = actualizarGrupo;
const eliminarGrupo = async (req, res, next) => {
    try {
        const idGrupoLiga = Number(req.params.id);
        const grupo = await flatService.eliminarGrupoFlat(idGrupoLiga);
        res.json({ ok: true, mensaje: 'Grupo eliminado', data: grupo });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarGrupo = eliminarGrupo;
// ============================================================
// RONDAS  (/api/liga/rondas)
// ============================================================
const listarRondas = async (req, res, next) => {
    try {
        const idLiga = req.query.idLiga ? Number(req.query.idLiga) : undefined;
        const idGrupoLiga = req.query.idGrupoLiga ? Number(req.query.idGrupoLiga) : undefined;
        const rondas = await flatService.listarRondasFlat(idLiga, idGrupoLiga);
        res.json({ ok: true, data: rondas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarRondas = listarRondas;
const listarRondasPorLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.idLiga);
        const rondas = await flatService.listarRondasFlat(idLiga);
        res.json({ ok: true, data: rondas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarRondasPorLiga = listarRondasPorLiga;
const listarRondasPorGrupo = async (req, res, next) => {
    try {
        const idGrupoLiga = Number(req.params.idGrupo);
        const rondas = await flatService.listarRondasFlat(undefined, idGrupoLiga);
        res.json({ ok: true, data: rondas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarRondasPorGrupo = listarRondasPorGrupo;
const obtenerRonda = async (req, res, next) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const ronda = await flatService.obtenerRondaPorId(idRondaLiga);
        res.json({ ok: true, data: ronda });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerRonda = obtenerRonda;
const crearRonda = async (req, res, next) => {
    try {
        const parse = liga_validations_1.crearRondaLigaFlatSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const ronda = await flatService.crearRondaFlat(parse.data);
        res.status(201).json({ ok: true, data: ronda });
    }
    catch (err) {
        next(err);
    }
};
exports.crearRonda = crearRonda;
const actualizarRonda = async (req, res, next) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const parse = liga_validations_1.actualizarRondaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const ronda = await flatService.actualizarRondaFlat(idRondaLiga, parse.data);
        res.json({ ok: true, data: ronda });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarRonda = actualizarRonda;
const iniciarRonda = async (req, res, next) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const ronda = await flatService.iniciarRondaFlat(idRondaLiga);
        res.json({ ok: true, data: ronda });
    }
    catch (err) {
        next(err);
    }
};
exports.iniciarRonda = iniciarRonda;
const finalizarRonda = async (req, res, next) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const ronda = await flatService.finalizarRondaFlat(idRondaLiga);
        res.json({ ok: true, data: ronda });
    }
    catch (err) {
        next(err);
    }
};
exports.finalizarRonda = finalizarRonda;
const eliminarRonda = async (req, res, next) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const resultado = await flatService.eliminarRondaFlat(idRondaLiga);
        res.json({ ok: true, mensaje: 'Ronda eliminada', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarRonda = eliminarRonda;
// ============================================================
// MESAS  (/api/liga/mesas)
// ============================================================
const listarMesas = async (req, res, next) => {
    try {
        const idRondaLiga = req.query.idRondaLiga ? Number(req.query.idRondaLiga) : undefined;
        const mesas = await flatService.listarMesasFlat(idRondaLiga);
        res.json({ ok: true, data: mesas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarMesas = listarMesas;
const listarMesasPorRonda = async (req, res, next) => {
    try {
        const idRondaLiga = Number(req.params.idRonda);
        const mesas = await flatService.listarMesasFlat(idRondaLiga);
        res.json({ ok: true, data: mesas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarMesasPorRonda = listarMesasPorRonda;
const obtenerMesa = async (req, res, next) => {
    try {
        const idMesaLiga = Number(req.params.id);
        const mesa = await flatService.obtenerMesaPorId(idMesaLiga);
        res.json({ ok: true, data: mesa });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerMesa = obtenerMesa;
const crearMesa = async (req, res, next) => {
    try {
        const parse = liga_validations_1.crearMesaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const mesa = await flatService.crearMesaFlat(parse.data);
        res.status(201).json({ ok: true, data: mesa });
    }
    catch (err) {
        next(err);
    }
};
exports.crearMesa = crearMesa;
const actualizarMesa = async (req, res, next) => {
    try {
        const idMesaLiga = Number(req.params.id);
        const parse = liga_validations_1.actualizarMesaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const mesa = await flatService.actualizarMesaFlat(idMesaLiga, parse.data);
        res.json({ ok: true, data: mesa });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarMesa = actualizarMesa;
const finalizarMesa = async (req, res, next) => {
    try {
        const idMesaLiga = Number(req.params.id);
        const parse = liga_validations_1.registrarPartidaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const partida = await flatService.finalizarMesaFlat(idMesaLiga, parse.data);
        res.status(201).json({ ok: true, mensaje: 'Partida registrada', data: partida });
    }
    catch (err) {
        next(err);
    }
};
exports.finalizarMesa = finalizarMesa;
const eliminarMesa = async (req, res, next) => {
    try {
        const idMesaLiga = Number(req.params.id);
        const resultado = await flatService.eliminarMesaFlat(idMesaLiga);
        res.json({ ok: true, mensaje: 'Mesa eliminada', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarMesa = eliminarMesa;
// ============================================================
// JUGADORES DE LIGA  (/api/liga/jugadores)
// ============================================================
const listarJugadoresLiga = async (req, res, next) => {
    try {
        const idLiga = req.query.idLiga ? Number(req.query.idLiga) : undefined;
        const idGrupoLiga = req.query.idGrupoLiga ? Number(req.query.idGrupoLiga) : undefined;
        const jugadores = await flatService.listarJugadoresLigaFlat(idLiga, idGrupoLiga);
        res.json({ ok: true, data: jugadores, total: jugadores.length });
    }
    catch (err) {
        next(err);
    }
};
exports.listarJugadoresLiga = listarJugadoresLiga;
const listarJugadoresPorLiga = async (req, res, next) => {
    try {
        const idLiga = Number(req.params.idLiga);
        const jugadores = await flatService.listarJugadoresLigaFlat(idLiga);
        res.json({ ok: true, data: jugadores, total: jugadores.length });
    }
    catch (err) {
        next(err);
    }
};
exports.listarJugadoresPorLiga = listarJugadoresPorLiga;
const listarJugadoresPorGrupo = async (req, res, next) => {
    try {
        const idGrupoLiga = Number(req.params.idGrupo);
        const jugadores = await flatService.listarJugadoresLigaFlat(undefined, idGrupoLiga);
        res.json({ ok: true, data: jugadores, total: jugadores.length });
    }
    catch (err) {
        next(err);
    }
};
exports.listarJugadoresPorGrupo = listarJugadoresPorGrupo;
const obtenerJugadorLiga = async (req, res, next) => {
    try {
        const idJugadorLiga = Number(req.params.id);
        const jugadorLiga = await flatService.obtenerJugadorLigaPorId(idJugadorLiga);
        res.json({ ok: true, data: jugadorLiga });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerJugadorLiga = obtenerJugadorLiga;
const crearJugadorLiga = async (req, res, next) => {
    try {
        const parse = liga_validations_1.inscribirJugadorLigaFlatSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await flatService.crearJugadorLigaFlat(parse.data);
        res.status(201).json({ ok: true, mensaje: 'Jugador inscrito en la liga', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.crearJugadorLiga = crearJugadorLiga;
const actualizarJugadorLiga = async (req, res, next) => {
    try {
        const idJugadorLiga = Number(req.params.id);
        const parse = liga_validations_1.actualizarJugadorLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await flatService.actualizarJugadorLigaFlat(idJugadorLiga, parse.data);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarJugadorLiga = actualizarJugadorLiga;
const confirmarPagoJugadorLiga = async (req, res, next) => {
    try {
        const idJugadorLiga = Number(req.params.id);
        const monto_pagado = req.body?.monto_pagado !== undefined ? Number(req.body.monto_pagado) : undefined;
        const resultado = await flatService.confirmarPagoFlat(idJugadorLiga, monto_pagado);
        res.json({ ok: true, mensaje: 'Pago confirmado', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.confirmarPagoJugadorLiga = confirmarPagoJugadorLiga;
const eliminarJugadorLiga = async (req, res, next) => {
    try {
        const idJugadorLiga = Number(req.params.id);
        const resultado = await flatService.eliminarJugadorLigaFlat(idJugadorLiga);
        res.json({ ok: true, mensaje: 'Inscripción cancelada', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarJugadorLiga = eliminarJugadorLiga;
// ============================================================
// PARTIDAS DE LIGA  (/api/liga/partidas)
// ============================================================
const listarPartidas = async (req, res, next) => {
    try {
        const idMesaLiga = req.query.idMesaLiga ? Number(req.query.idMesaLiga) : undefined;
        const partidas = await flatService.listarPartidasFlat(idMesaLiga);
        res.json({ ok: true, data: partidas });
    }
    catch (err) {
        next(err);
    }
};
exports.listarPartidas = listarPartidas;
const obtenerPartida = async (req, res, next) => {
    try {
        const idPartidaLiga = Number(req.params.id);
        const partida = await flatService.obtenerPartidaPorId(idPartidaLiga);
        res.json({ ok: true, data: partida });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerPartida = obtenerPartida;
const crearPartida = async (req, res, next) => {
    try {
        const parse = liga_validations_1.crearPartidaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const partida = await flatService.crearPartidaFlat(parse.data);
        res.status(201).json({ ok: true, mensaje: 'Partida registrada', data: partida });
    }
    catch (err) {
        next(err);
    }
};
exports.crearPartida = crearPartida;
const actualizarPartida = async (req, res, next) => {
    try {
        const idPartidaLiga = Number(req.params.id);
        const parse = liga_validations_1.actualizarPartidaLigaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const partida = await flatService.actualizarPartidaFlat(idPartidaLiga, parse.data);
        res.json({ ok: true, data: partida });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarPartida = actualizarPartida;
const eliminarPartida = async (req, res, next) => {
    try {
        const idPartidaLiga = Number(req.params.id);
        const resultado = await flatService.eliminarPartidaFlat(idPartidaLiga);
        res.json({ ok: true, mensaje: 'Partida eliminada', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarPartida = eliminarPartida;
//# sourceMappingURL=liga-flat.controller.js.map