"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRondas = getAllRondas;
exports.getRondasByTorneo = getRondasByTorneo;
exports.getRondasByTorneoCat = getRondasByTorneoCat;
exports.getRondaById = getRondaById;
exports.getRondasByTorneoPublico = getRondasByTorneoPublico;
exports.createRonda = createRonda;
exports.updateRonda = updateRonda;
exports.deleteRonda = deleteRonda;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const client_1 = require("@prisma/client");
// ─── SELECTS ──────────────────────────────────────────────────────────────────
const includeCategoria = {
    torneo_categoria: {
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    },
};
// ─── SERVICE ──────────────────────────────────────────────────────────────────
async function getAllRondas() {
    return database_1.default.ronda.findMany({
        include: {
            torneo: { select: { idTorneo: true, nombre: true, fecha: true } },
            ...includeCategoria,
        },
        orderBy: { fecha_creacion: 'desc' },
    });
}
async function getRondasByTorneo(idTorneo) {
    return database_1.default.ronda.findMany({
        where: { idTorneo },
        include: {
            ...includeCategoria,
            mesas: {
                include: {
                    jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true } },
                    jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true } },
                },
            },
        },
        orderBy: { numeroRonda: 'asc' },
    });
}
async function getRondasByTorneoCat(idTorneo, idTorneoCategoria) {
    return database_1.default.ronda.findMany({
        where: { idTorneo, idTorneoCategoria },
        include: includeCategoria,
        orderBy: { numeroRonda: 'asc' },
    });
}
async function getRondaById(id) {
    const r = await database_1.default.ronda.findUnique({
        where: { idRonda: id },
        include: {
            torneo: { select: { idTorneo: true, nombre: true, fecha: true, lugar: true } },
            ...includeCategoria,
            mesas: {
                include: {
                    jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true, rating: true } },
                    jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true, rating: true } },
                },
            },
        },
    });
    if (!r)
        throw new error_middleware_1.NotFoundError('Ronda no encontrada');
    return r;
}
/** Lectura pública: solo campos seguros, sin autenticación. */
async function getRondasByTorneoPublico(idTorneo) {
    return database_1.default.ronda.findMany({
        where: { idTorneo },
        select: {
            idRonda: true,
            idTorneo: true,
            idTorneoCategoria: true,
            numeroRonda: true,
            estado: true,
            fecha_inicio: true,
            fecha_fin: true,
        },
        orderBy: { numeroRonda: 'asc' },
    });
}
async function createRonda(dto) {
    if (!dto.idTorneo || !dto.idTorneoCategoria || !dto.numeroRonda)
        throw new error_middleware_1.ValidationError('Faltan campos obligatorios: idTorneo, idTorneoCategoria, numeroRonda');
    return database_1.default.ronda.create({
        data: {
            idTorneo: dto.idTorneo,
            idTorneoCategoria: dto.idTorneoCategoria,
            numeroRonda: dto.numeroRonda,
            fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : new Date(),
            estado: dto.estado ?? client_1.RondaEstado.pendiente,
            notas: dto.notas ?? null,
            fecha_creacion: new Date(),
        },
    });
}
async function updateRonda(id, dto) {
    const ronda = await database_1.default.ronda.findUnique({ where: { idRonda: id } });
    if (!ronda)
        throw new error_middleware_1.NotFoundError('Ronda no encontrada');
    return database_1.default.ronda.update({
        where: { idRonda: id },
        data: {
            ...(dto.numeroRonda !== undefined && { numeroRonda: dto.numeroRonda }),
            ...(dto.fecha_inicio !== undefined && {
                fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : null,
            }),
            ...(dto.fecha_fin !== undefined && {
                fecha_fin: dto.fecha_fin ? new Date(dto.fecha_fin) : null,
            }),
            ...(dto.estado !== undefined && { estado: dto.estado }),
            ...(dto.notas !== undefined && { notas: dto.notas }),
        },
    });
}
async function deleteRonda(id) {
    const ronda = await database_1.default.ronda.findUnique({ where: { idRonda: id } });
    if (!ronda)
        throw new error_middleware_1.NotFoundError('Ronda no encontrada');
    if (ronda.estado !== 'pendiente') {
        throw new error_middleware_1.ForbiddenError(`No se puede eliminar una ronda con estado "${ronda.estado}". Solo se pueden eliminar rondas pendientes.`);
    }
    await database_1.default.ronda.delete({ where: { idRonda: id } });
}
//# sourceMappingURL=ronda.service.js.map