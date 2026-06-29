"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllHistorial = getAllHistorial;
exports.getHistorialByTorneo = getHistorialByTorneo;
exports.getHistorialByJugador = getHistorialByJugador;
exports.verificarEnfrentamiento = verificarEnfrentamiento;
exports.createHistorial = createHistorial;
exports.createHistorialRonda = createHistorialRonda;
exports.deleteHistorial = deleteHistorial;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const selectJugador = {
    idJugador: true, nombre: true, apellido1: true, apellido2: true,
};
async function getAllHistorial() {
    return database_1.default.historialEmparejamiento.findMany({
        include: {
            jugador1: { select: selectJugador },
            jugador2: { select: selectJugador },
            torneo: { select: { idTorneo: true, nombre: true, fecha: true } },
        },
        orderBy: { fecha_emparejamiento: 'desc' },
    });
}
async function getHistorialByTorneo(idTorneo) {
    return database_1.default.historialEmparejamiento.findMany({
        where: { idTorneo },
        include: {
            jugador1: { select: selectJugador },
            jugador2: { select: selectJugador },
            torneo_categoria: {
                include: { categoria: { select: { idCategoria: true, nombre: true } } },
            },
        },
        orderBy: { numeroRonda: 'asc' },
    });
}
async function getHistorialByJugador(idJugador, idTorneo) {
    return database_1.default.historialEmparejamiento.findMany({
        where: { idTorneo, OR: [{ idJugador1: idJugador }, { idJugador2: idJugador }] },
        include: {
            jugador1: { select: { ...selectJugador, rating: true } },
            jugador2: { select: { ...selectJugador, rating: true } },
        },
        orderBy: { numeroRonda: 'asc' },
    });
}
async function verificarEnfrentamiento(idJugador1, idJugador2, idTorneo) {
    const enfrentamiento = await database_1.default.historialEmparejamiento.findFirst({
        where: {
            idTorneo,
            OR: [
                { idJugador1, idJugador2 },
                { idJugador1: idJugador2, idJugador2: idJugador1 },
            ],
        },
    });
    return { yaSeEnfrentaron: enfrentamiento !== null, data: enfrentamiento };
}
async function createHistorial(dto) {
    const { idJugador1, idJugador2, idTorneo, idTorneoCategoria, numeroRonda } = dto;
    if (!idJugador1 || !idJugador2 || !idTorneo || !idTorneoCategoria || !numeroRonda)
        throw new error_middleware_1.ValidationError('Faltan campos obligatorios: idJugador1, idJugador2, idTorneo, idTorneoCategoria, numeroRonda');
    if (idJugador1 === idJugador2)
        throw new error_middleware_1.ValidationError('Un jugador no puede enfrentarse a sí mismo');
    return database_1.default.historialEmparejamiento.create({
        data: {
            idJugador1, idJugador2,
            idTorneo, idTorneoCategoria,
            numeroRonda,
            fecha_emparejamiento: new Date(),
        },
    });
}
async function createHistorialRonda(emparejamientos) {
    if (!Array.isArray(emparejamientos))
        throw new error_middleware_1.ValidationError('Se requiere un array de emparejamientos');
    const validos = emparejamientos.filter((e) => e.idJugador1 && e.idJugador2 && e.idTorneo && e.idTorneoCategoria && e.numeroRonda);
    if (validos.length === 0)
        return [];
    return database_1.default.$transaction(validos.map((e) => database_1.default.historialEmparejamiento.create({
        data: {
            idJugador1: e.idJugador1,
            idJugador2: e.idJugador2,
            idTorneo: e.idTorneo,
            idTorneoCategoria: e.idTorneoCategoria,
            numeroRonda: e.numeroRonda,
            fecha_emparejamiento: new Date(),
        },
    })));
}
async function deleteHistorial(id) {
    const h = await database_1.default.historialEmparejamiento.findUnique({ where: { idHistorial: id } });
    if (!h)
        throw new error_middleware_1.NotFoundError('Registro de historial no encontrado');
    await database_1.default.historialEmparejamiento.delete({ where: { idHistorial: id } });
}
//# sourceMappingURL=historial-emparejamiento.service.js.map