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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarPartidaFlat = exports.actualizarPartidaFlat = exports.crearPartidaFlat = exports.obtenerPartidaPorId = exports.listarPartidasFlat = exports.eliminarJugadorLigaFlat = exports.confirmarPagoFlat = exports.actualizarJugadorLigaFlat = exports.crearJugadorLigaFlat = exports.obtenerJugadorLigaPorId = exports.listarJugadoresLigaFlat = exports.eliminarMesaFlat = exports.finalizarMesaFlat = exports.actualizarMesaFlat = exports.crearMesaFlat = exports.obtenerMesaPorId = exports.listarMesasFlat = exports.eliminarRondaFlat = exports.finalizarRondaFlat = exports.iniciarRondaFlat = exports.actualizarRondaFlat = exports.crearRondaFlat = exports.obtenerRondaPorId = exports.listarRondasFlat = exports.obtenerTablaGrupo = exports.eliminarGrupoFlat = exports.actualizarGrupoFlat = exports.crearGrupoFlat = exports.obtenerGrupoPorId = exports.listarGruposFlat = exports.eliminarLiga = exports.obtenerStatsLiga = exports.listarLigasActivas = exports.listarTodasLigas = void 0;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const ligaService = __importStar(require("./liga.service"));
const INCLUDE_LIGA_BASE = {
    ritmo_juego: { select: { idRitmoJuego: true, nombre: true, minutos: true, incremento: true } },
    grupos: {
        where: { activo: true },
        select: {
            idGrupoLiga: true,
            nombre: true,
            max_jugadores: true,
            rondas: true,
            activo: true,
        },
    },
};
// ============================================================
// INFO LIGA (público)
// ============================================================
const listarTodasLigas = async () => {
    return database_1.default.infoLiga.findMany({
        orderBy: { fecha_inicio: 'desc' },
        include: INCLUDE_LIGA_BASE,
    });
};
exports.listarTodasLigas = listarTodasLigas;
const listarLigasActivas = async () => {
    return database_1.default.infoLiga.findMany({
        where: { activo: true },
        orderBy: { fecha_inicio: 'desc' },
        include: INCLUDE_LIGA_BASE,
    });
};
exports.listarLigasActivas = listarLigasActivas;
const obtenerStatsLiga = async (idLiga) => {
    await _verificarLigaExiste(idLiga);
    const [totalGrupos, totalJugadores, totalRondas, totalPartidas] = await Promise.all([
        database_1.default.grupoLiga.count({ where: { idLiga, activo: true } }),
        database_1.default.jugadorLiga.count({ where: { idLiga, estado: { not: 'cancelado' } } }),
        database_1.default.rondaLiga.count({ where: { idLiga } }),
        database_1.default.partidaLiga.count({ where: { mesa_liga: { ronda_liga: { idLiga } } } }),
    ]);
    return { idLiga, totalGrupos, totalJugadores, totalRondas, totalPartidas };
};
exports.obtenerStatsLiga = obtenerStatsLiga;
const eliminarLiga = async (idLiga) => {
    return ligaService.toggleActivoLiga(idLiga, false);
};
exports.eliminarLiga = eliminarLiga;
// ============================================================
// GRUPOS
// ============================================================
const listarGruposFlat = async (idLiga) => {
    return database_1.default.grupoLiga.findMany({
        where: { activo: true, ...(idLiga && { idLiga }) },
        orderBy: { nombre: 'asc' },
        include: {
            _count: { select: { jugadores_liga: { where: { estado: { not: 'cancelado' } } } } },
        },
    });
};
exports.listarGruposFlat = listarGruposFlat;
const obtenerGrupoPorId = async (idGrupoLiga) => {
    const grupo = await database_1.default.grupoLiga.findUnique({
        where: { idGrupoLiga },
        include: {
            _count: { select: { jugadores_liga: { where: { estado: { not: 'cancelado' } } } } },
        },
    });
    if (!grupo)
        throw new error_middleware_1.NotFoundError('Grupo no encontrado');
    return grupo;
};
exports.obtenerGrupoPorId = obtenerGrupoPorId;
const crearGrupoFlat = async (datos) => {
    const { idLiga, ...resto } = datos;
    return ligaService.crearGrupo(idLiga, resto);
};
exports.crearGrupoFlat = crearGrupoFlat;
const actualizarGrupoFlat = async (idGrupoLiga, datos) => {
    const grupo = await database_1.default.grupoLiga.findUnique({ where: { idGrupoLiga } });
    if (!grupo)
        throw new error_middleware_1.NotFoundError('Grupo no encontrado');
    return ligaService.actualizarGrupo(grupo.idLiga, idGrupoLiga, datos);
};
exports.actualizarGrupoFlat = actualizarGrupoFlat;
const eliminarGrupoFlat = async (idGrupoLiga) => {
    const grupo = await database_1.default.grupoLiga.findUnique({ where: { idGrupoLiga } });
    if (!grupo)
        throw new error_middleware_1.NotFoundError('Grupo no encontrado');
    return database_1.default.grupoLiga.update({
        where: { idGrupoLiga },
        data: { activo: false },
        select: { idGrupoLiga: true, nombre: true, activo: true },
    });
};
exports.eliminarGrupoFlat = eliminarGrupoFlat;
const obtenerTablaGrupo = async (idGrupoLiga) => {
    const grupo = await database_1.default.grupoLiga.findUnique({ where: { idGrupoLiga } });
    if (!grupo)
        throw new error_middleware_1.NotFoundError('Grupo no encontrado');
    return ligaService.obtenerTablaPosiciones(grupo.idLiga, idGrupoLiga);
};
exports.obtenerTablaGrupo = obtenerTablaGrupo;
// ============================================================
// RONDAS
// ============================================================
const listarRondasFlat = async (idLiga, idGrupoLiga) => {
    return database_1.default.rondaLiga.findMany({
        where: { ...(idLiga && { idLiga }), ...(idGrupoLiga && { idGrupoLiga }) },
        orderBy: [{ idGrupoLiga: 'asc' }, { numeroRonda: 'asc' }],
        include: {
            grupo: { select: { idGrupoLiga: true, nombre: true } },
            _count: { select: { mesas_liga: true } },
        },
    });
};
exports.listarRondasFlat = listarRondasFlat;
const obtenerRondaPorId = async (idRondaLiga) => {
    const ronda = await database_1.default.rondaLiga.findUnique({
        where: { idRondaLiga },
        include: { grupo: { select: { idGrupoLiga: true, nombre: true } } },
    });
    if (!ronda)
        throw new error_middleware_1.NotFoundError('Ronda no encontrada');
    return ronda;
};
exports.obtenerRondaPorId = obtenerRondaPorId;
const crearRondaFlat = async (datos) => {
    const { idLiga, ...resto } = datos;
    return ligaService.crearRondaLiga(idLiga, resto);
};
exports.crearRondaFlat = crearRondaFlat;
const actualizarRondaFlat = async (idRondaLiga, datos) => {
    const ronda = await database_1.default.rondaLiga.findUnique({ where: { idRondaLiga } });
    if (!ronda)
        throw new error_middleware_1.NotFoundError('Ronda no encontrada');
    return database_1.default.rondaLiga.update({
        where: { idRondaLiga },
        data: {
            ...(datos.fecha_programada !== undefined && {
                fecha_programada: new Date(`${datos.fecha_programada}T00:00:00`),
            }),
            ...(datos.hora_inicio !== undefined && {
                hora_inicio: new Date(`1970-01-01T${datos.hora_inicio}:00`),
            }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
        },
        include: { grupo: { select: { idGrupoLiga: true, nombre: true } } },
    });
};
exports.actualizarRondaFlat = actualizarRondaFlat;
const iniciarRondaFlat = async (idRondaLiga) => {
    return ligaService.cambiarEstadoRondaLiga(idRondaLiga, { estado: 'en_curso' });
};
exports.iniciarRondaFlat = iniciarRondaFlat;
const finalizarRondaFlat = async (idRondaLiga) => {
    return ligaService.cambiarEstadoRondaLiga(idRondaLiga, { estado: 'finalizada' });
};
exports.finalizarRondaFlat = finalizarRondaFlat;
const eliminarRondaFlat = async (idRondaLiga) => {
    const ronda = await database_1.default.rondaLiga.findUnique({ where: { idRondaLiga } });
    if (!ronda)
        throw new error_middleware_1.NotFoundError('Ronda no encontrada');
    if (ronda.estado !== 'planificada')
        throw new error_middleware_1.ForbiddenError('Solo se puede eliminar una ronda antes de ser iniciada');
    await database_1.default.rondaLiga.delete({ where: { idRondaLiga } });
    return { idRondaLiga };
};
exports.eliminarRondaFlat = eliminarRondaFlat;
// ============================================================
// MESAS
// ============================================================
const INCLUDE_MESA = {
    jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
    jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
    partida_liga: true,
};
const listarMesasFlat = async (idRondaLiga) => {
    return database_1.default.mesaLiga.findMany({
        where: { ...(idRondaLiga && { idRondaLiga }) },
        orderBy: { numeroMesa: 'asc' },
        include: INCLUDE_MESA,
    });
};
exports.listarMesasFlat = listarMesasFlat;
const obtenerMesaPorId = async (idMesaLiga) => {
    const mesa = await database_1.default.mesaLiga.findUnique({
        where: { idMesaLiga },
        include: INCLUDE_MESA,
    });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    return mesa;
};
exports.obtenerMesaPorId = obtenerMesaPorId;
const crearMesaFlat = async (datos) => {
    const ronda = await database_1.default.rondaLiga.findUnique({ where: { idRondaLiga: datos.idRondaLiga } });
    if (!ronda)
        throw new error_middleware_1.NotFoundError('Ronda no encontrada');
    const existe = await database_1.default.mesaLiga.findFirst({
        where: { idRondaLiga: datos.idRondaLiga, numeroMesa: datos.numeroMesa },
    });
    if (existe)
        throw new error_middleware_1.ConflictError(`La mesa ${datos.numeroMesa} ya existe en esta ronda`);
    return database_1.default.mesaLiga.create({
        data: {
            idRondaLiga: datos.idRondaLiga,
            numeroMesa: datos.numeroMesa,
            idJugadorBlanco: datos.idJugadorBlanco,
            idJugadorNegro: datos.idJugadorNegro,
            notas: datos.notas,
            estado: 'pendiente',
            fecha_creacion: new Date(),
        },
        include: INCLUDE_MESA,
    });
};
exports.crearMesaFlat = crearMesaFlat;
const actualizarMesaFlat = async (idMesaLiga, datos) => {
    const mesa = await database_1.default.mesaLiga.findUnique({ where: { idMesaLiga } });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    return database_1.default.mesaLiga.update({
        where: { idMesaLiga },
        data: {
            ...(datos.numeroMesa !== undefined && { numeroMesa: datos.numeroMesa }),
            ...(datos.idJugadorBlanco !== undefined && { idJugadorBlanco: datos.idJugadorBlanco }),
            ...(datos.idJugadorNegro !== undefined && { idJugadorNegro: datos.idJugadorNegro }),
            ...(datos.estado !== undefined && { estado: datos.estado }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
        },
        include: INCLUDE_MESA,
    });
};
exports.actualizarMesaFlat = actualizarMesaFlat;
const finalizarMesaFlat = async (idMesaLiga, datos) => {
    return ligaService.registrarPartidaLiga(idMesaLiga, datos);
};
exports.finalizarMesaFlat = finalizarMesaFlat;
const eliminarMesaFlat = async (idMesaLiga) => {
    const mesa = await database_1.default.mesaLiga.findUnique({ where: { idMesaLiga } });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    if (mesa.estado === 'finalizada')
        throw new error_middleware_1.ForbiddenError('No se puede eliminar una mesa con partida finalizada');
    await database_1.default.mesaLiga.delete({ where: { idMesaLiga } });
    return { idMesaLiga };
};
exports.eliminarMesaFlat = eliminarMesaFlat;
// ============================================================
// JUGADORES DE LIGA
// ============================================================
const INCLUDE_JUGADOR_LIGA = {
    jugador: {
        select: {
            idJugador: true, nombre: true, apellido1: true,
            apellido2: true, rating: true, telefono: true,
        },
    },
    grupo: { select: { idGrupoLiga: true, nombre: true } },
};
const listarJugadoresLigaFlat = async (idLiga, idGrupoLiga) => {
    return database_1.default.jugadorLiga.findMany({
        where: {
            ...(idLiga && { idLiga }),
            ...(idGrupoLiga && { idGrupoLiga }),
            estado: { not: 'cancelado' },
        },
        orderBy: [{ puntos: 'desc' }, { posicion_grupo: 'asc' }],
        include: INCLUDE_JUGADOR_LIGA,
    });
};
exports.listarJugadoresLigaFlat = listarJugadoresLigaFlat;
const obtenerJugadorLigaPorId = async (idJugadorLiga) => {
    const jugadorLiga = await database_1.default.jugadorLiga.findUnique({
        where: { idJugadorLiga },
        include: INCLUDE_JUGADOR_LIGA,
    });
    if (!jugadorLiga)
        throw new error_middleware_1.NotFoundError('Inscripción no encontrada');
    return jugadorLiga;
};
exports.obtenerJugadorLigaPorId = obtenerJugadorLigaPorId;
const crearJugadorLigaFlat = async (datos) => {
    const { idLiga, ...resto } = datos;
    return ligaService.inscribirJugadorLiga(idLiga, resto);
};
exports.crearJugadorLigaFlat = crearJugadorLigaFlat;
const actualizarJugadorLigaFlat = async (idJugadorLiga, datos) => {
    const jugadorLiga = await database_1.default.jugadorLiga.findUnique({ where: { idJugadorLiga } });
    if (!jugadorLiga)
        throw new error_middleware_1.NotFoundError('Inscripción no encontrada');
    return database_1.default.jugadorLiga.update({
        where: { idJugadorLiga },
        data: {
            ...(datos.idGrupoLiga !== undefined && { idGrupoLiga: datos.idGrupoLiga }),
            ...(datos.posicion !== undefined && { posicion: datos.posicion }),
            ...(datos.estado !== undefined && { estado: datos.estado }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
        },
        include: INCLUDE_JUGADOR_LIGA,
    });
};
exports.actualizarJugadorLigaFlat = actualizarJugadorLigaFlat;
const confirmarPagoFlat = async (idJugadorLiga, monto_pagado) => {
    const jugadorLiga = await database_1.default.jugadorLiga.findUnique({ where: { idJugadorLiga } });
    if (!jugadorLiga)
        throw new error_middleware_1.NotFoundError('Inscripción no encontrada');
    return ligaService.confirmarPagoLiga(idJugadorLiga, {
        monto_pagado: monto_pagado ?? Number(jugadorLiga.monto_pagado),
    });
};
exports.confirmarPagoFlat = confirmarPagoFlat;
const eliminarJugadorLigaFlat = async (idJugadorLiga) => {
    return ligaService.cancelarInscripcionLiga(idJugadorLiga);
};
exports.eliminarJugadorLigaFlat = eliminarJugadorLigaFlat;
// ============================================================
// PARTIDAS DE LIGA
// ============================================================
const listarPartidasFlat = async (idMesaLiga) => {
    return database_1.default.partidaLiga.findMany({
        where: { ...(idMesaLiga && { idMesaLiga }) },
        orderBy: { idPartidaLiga: 'desc' },
        include: { mesa_liga: true },
    });
};
exports.listarPartidasFlat = listarPartidasFlat;
const obtenerPartidaPorId = async (idPartidaLiga) => {
    const partida = await database_1.default.partidaLiga.findUnique({
        where: { idPartidaLiga },
        include: { mesa_liga: true },
    });
    if (!partida)
        throw new error_middleware_1.NotFoundError('Partida no encontrada');
    return partida;
};
exports.obtenerPartidaPorId = obtenerPartidaPorId;
const crearPartidaFlat = async (datos) => {
    const { idMesaLiga, ...resto } = datos;
    return ligaService.registrarPartidaLiga(idMesaLiga, resto);
};
exports.crearPartidaFlat = crearPartidaFlat;
const actualizarPartidaFlat = async (idPartidaLiga, datos) => {
    const partida = await database_1.default.partidaLiga.findUnique({ where: { idPartidaLiga } });
    if (!partida)
        throw new error_middleware_1.NotFoundError('Partida no encontrada');
    return database_1.default.partidaLiga.update({
        where: { idPartidaLiga },
        data: {
            ...(datos.idJugadorGanador !== undefined && { idJugadorGanador: datos.idJugadorGanador }),
            ...(datos.resultado !== undefined && { resultado: datos.resultado }),
            ...(datos.tipo_finalizacion !== undefined && { tipo_finalizacion: datos.tipo_finalizacion }),
            ...(datos.descripcion_finalizacion !== undefined && { descripcion_finalizacion: datos.descripcion_finalizacion }),
            ...(datos.duracion_minutos !== undefined && { duracion_minutos: datos.duracion_minutos }),
        },
    });
};
exports.actualizarPartidaFlat = actualizarPartidaFlat;
const eliminarPartidaFlat = async (idPartidaLiga) => {
    return database_1.default.$transaction(async (tx) => {
        const partida = await tx.partidaLiga.findUnique({ where: { idPartidaLiga } });
        if (!partida)
            throw new error_middleware_1.NotFoundError('Partida no encontrada');
        await tx.partidaLiga.delete({ where: { idPartidaLiga } });
        await tx.mesaLiga.update({
            where: { idMesaLiga: partida.idMesaLiga },
            data: { estado: 'pendiente' },
        });
        return { idPartidaLiga };
    });
};
exports.eliminarPartidaFlat = eliminarPartidaFlat;
// ============================================================
// HELPERS PRIVADOS
// ============================================================
const _verificarLigaExiste = async (idLiga) => {
    const liga = await database_1.default.infoLiga.findUnique({
        where: { idLiga },
        select: { idLiga: true },
    });
    if (!liga)
        throw new error_middleware_1.NotFoundError('Liga no encontrada');
    return liga;
};
//# sourceMappingURL=liga-flat.service.js.map