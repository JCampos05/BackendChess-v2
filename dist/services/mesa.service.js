"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMesas = getAllMesas;
exports.getMesasByRonda = getMesasByRonda;
exports.getMesasByRondaPublico = getMesasByRondaPublico;
exports.getMesaById = getMesaById;
exports.createMesa = createMesa;
exports.deleteMesa = deleteMesa;
exports.verificarDisponibilidadMesa = verificarDisponibilidadMesa;
exports.bloquearMesa = bloquearMesa;
exports.liberarMesa = liberarMesa;
exports.updateMesa = updateMesa;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const client_1 = require("@prisma/client");
const TIMEOUT_BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos
const selectJugadorBase = {
    idJugador: true, nombre: true, apellido1: true, apellido2: true, rating: true,
};
const includeJugadores = {
    jugador_blanco: { select: selectJugadorBase },
    jugador_negro: { select: selectJugadorBase },
};
// ─── SERVICE ──────────────────────────────────────────────────────────────────
async function getAllMesas() {
    return database_1.default.mesa.findMany({
        include: {
            ronda: { select: { idRonda: true, numeroRonda: true, estado: true } },
            jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            partida: true,
        },
        orderBy: { fecha_creacion: 'desc' },
    });
}
async function getMesasByRonda(idRonda) {
    return database_1.default.mesa.findMany({
        where: { idRonda },
        include: { ...includeJugadores, partida: true },
        orderBy: { numeroMesa: 'asc' },
    });
}
/** Lectura pública — sin autenticación. */
async function getMesasByRondaPublico(idRonda) {
    return database_1.default.mesa.findMany({
        where: { idRonda },
        include: { ...includeJugadores, partida: true },
        orderBy: { numeroMesa: 'asc' },
    });
}
async function getMesaById(id) {
    const mesa = await database_1.default.mesa.findUnique({
        where: { idMesa: id },
        include: {
            ronda: {
                include: {
                    torneo: { select: { idTorneo: true, nombre: true, fecha: true } },
                    torneo_categoria: {
                        include: { categoria: { select: { idCategoria: true, nombre: true } } },
                    },
                },
            },
            ...includeJugadores,
            partida: true,
        },
    });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    return mesa;
}
async function createMesa(dto) {
    const { numeroMesa, idRonda, idJugadorBlanco, idJugadorNegro, estado, notas } = dto;
    if (!numeroMesa || !idRonda || !idJugadorBlanco || !idJugadorNegro)
        throw new error_middleware_1.ValidationError('Faltan campos obligatorios: numeroMesa, idRonda, idJugadorBlanco, idJugadorNegro');
    if (idJugadorBlanco === idJugadorNegro)
        throw new error_middleware_1.ValidationError('Un jugador no puede enfrentarse a sí mismo');
    const [jBlanco, jNegro] = await Promise.all([
        database_1.default.jugador.findUnique({ where: { idJugador: idJugadorBlanco } }),
        database_1.default.jugador.findUnique({ where: { idJugador: idJugadorNegro } }),
    ]);
    if (!jBlanco || !jNegro)
        throw new error_middleware_1.NotFoundError('Uno o ambos jugadores no fueron encontrados');
    const [mesaB, mesaN] = await Promise.all([
        database_1.default.mesa.findFirst({
            where: { idRonda, OR: [{ idJugadorBlanco }, { idJugadorNegro: idJugadorBlanco }] },
        }),
        database_1.default.mesa.findFirst({
            where: { idRonda, OR: [{ idJugadorBlanco: idJugadorNegro }, { idJugadorNegro }] },
        }),
    ]);
    if (mesaB)
        throw new error_middleware_1.ValidationError(`${jBlanco.nombre} ${jBlanco.apellido1} ya tiene una mesa asignada en esta ronda`);
    if (mesaN)
        throw new error_middleware_1.ValidationError(`${jNegro.nombre} ${jNegro.apellido1} ya tiene una mesa asignada en esta ronda`);
    return database_1.default.mesa.create({
        data: {
            numeroMesa,
            idRonda,
            idJugadorBlanco,
            idJugadorNegro,
            ilegalesBlanco: 0,
            ilegalesNegro: 0,
            estado: estado ?? client_1.MesaEstado.pendiente,
            notas: notas ?? null,
            fecha_creacion: new Date(),
        },
    });
}
async function deleteMesa(id) {
    const mesa = await database_1.default.mesa.findUnique({ where: { idMesa: id } });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    await database_1.default.mesa.delete({ where: { idMesa: id } });
}
/** Verifica disponibilidad y libera bloqueos expirados automáticamente. */
async function verificarDisponibilidadMesa(id) {
    const mesa = await database_1.default.mesa.findUnique({
        where: { idMesa: id },
        select: { idMesa: true, estado: true, usuarioEditando: true, timestampEdicion: true },
    });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    if (mesa.estado === client_1.MesaEstado.finalizada) {
        return { disponible: false, yaFinalizada: true, message: 'Esta mesa ya ha sido finalizada' };
    }
    if (mesa.usuarioEditando && mesa.timestampEdicion) {
        const tiempoBloqueo = Date.now() - new Date(mesa.timestampEdicion).getTime();
        if (tiempoBloqueo < TIMEOUT_BLOQUEO_MS) {
            return {
                disponible: false,
                yaFinalizada: false,
                usuarioEditando: mesa.usuarioEditando,
                tiempoRestante: Math.ceil((TIMEOUT_BLOQUEO_MS - tiempoBloqueo) / 1000),
                message: 'Mesa ocupada por otro usuario',
            };
        }
        // Bloqueo expirado → liberar automáticamente
        await database_1.default.mesa.update({
            where: { idMesa: id },
            data: { usuarioEditando: null, timestampEdicion: new Date() },
        });
    }
    return { disponible: true, yaFinalizada: false, message: 'Mesa disponible para edición' };
}
/** Bloquea la mesa para el usuario actual. */
async function bloquearMesa(id, usuarioTelefono, modoEdicion = false) {
    const mesa = await database_1.default.mesa.findUnique({ where: { idMesa: id } });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    if (!modoEdicion && mesa.estado === client_1.MesaEstado.finalizada)
        throw new error_middleware_1.AppError('Esta mesa ya ha sido finalizada', 400, 'MESA_FINALIZADA');
    if (mesa.usuarioEditando && mesa.usuarioEditando !== usuarioTelefono && mesa.timestampEdicion) {
        const tiempoBloqueo = Date.now() - new Date(mesa.timestampEdicion).getTime();
        if (tiempoBloqueo < TIMEOUT_BLOQUEO_MS)
            throw new error_middleware_1.AppError('Mesa bloqueada por otro usuario', 423, 'MESA_BLOQUEADA');
    }
    return database_1.default.mesa.update({
        where: { idMesa: id },
        data: { usuarioEditando: usuarioTelefono, timestampEdicion: new Date() },
    });
}
/** Libera el bloqueo (solo el usuario que bloqueó). */
async function liberarMesa(id, usuarioTelefono) {
    const mesa = await database_1.default.mesa.findUnique({ where: { idMesa: id } });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    if (mesa.usuarioEditando === usuarioTelefono) {
        await database_1.default.mesa.update({
            where: { idMesa: id },
            data: { usuarioEditando: null, timestampEdicion: new Date() },
        });
    }
}
/** Actualiza la mesa con validación de bloqueo y concurrencia optimista. */
async function updateMesa(id, dto, usuarioTelefono) {
    const mesa = await database_1.default.mesa.findUnique({ where: { idMesa: id } });
    if (!mesa)
        throw new error_middleware_1.NotFoundError('Mesa no encontrada');
    if (mesa.estado === client_1.MesaEstado.finalizada && dto.estado === client_1.MesaEstado.finalizada)
        throw new error_middleware_1.AppError('Esta mesa ya ha sido finalizada', 400, 'MESA_YA_FINALIZADA');
    if (mesa.usuarioEditando && mesa.usuarioEditando !== usuarioTelefono)
        throw new error_middleware_1.AppError('Otro usuario está editando esta mesa', 423, 'MESA_BLOQUEADA');
    if (dto.timestampEdicion && mesa.timestampEdicion) {
        const tsRequest = new Date(dto.timestampEdicion).getTime();
        const tsActual = new Date(mesa.timestampEdicion).getTime();
        if (tsActual > tsRequest)
            throw new error_middleware_1.AppError('La mesa ha sido modificada por otro usuario. Por favor, recarga los datos.', 409, 'CONCURRENT_MODIFICATION');
    }
    const liberarBloqueo = dto.estado === client_1.MesaEstado.finalizada || dto.estado === undefined;
    return database_1.default.mesa.update({
        where: { idMesa: id },
        data: {
            ...(dto.numeroMesa !== undefined && { numeroMesa: dto.numeroMesa }),
            ...(dto.ilegalesBlanco !== undefined && { ilegalesBlanco: dto.ilegalesBlanco }),
            ...(dto.ilegalesNegro !== undefined && { ilegalesNegro: dto.ilegalesNegro }),
            ...(dto.estado !== undefined && { estado: dto.estado }),
            ...(dto.notas !== undefined && { notas: dto.notas }),
            ...(liberarBloqueo && { usuarioEditando: null }),
            timestampEdicion: new Date(),
        },
    });
}
//# sourceMappingURL=mesa.service.js.map