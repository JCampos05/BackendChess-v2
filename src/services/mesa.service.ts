import prisma from '../config/database';
import {
    NotFoundError,
    ValidationError,
    AppError,
} from '../middleware/error.middleware';
import { MesaEstado } from '@prisma/client';

const TIMEOUT_BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos

export interface CreateMesaDto {
    numeroMesa: number;
    idRonda: number;
    idJugadorBlanco: number;
    idJugadorNegro: number;
    estado?: MesaEstado;
    notas?: string | null;
}

export interface UpdateMesaDto {
    numeroMesa?: number;
    ilegalesBlanco?: number;
    ilegalesNegro?: number;
    estado?: MesaEstado;
    notas?: string | null;
    timestampEdicion?: string | Date;
}

const selectJugadorBase = {
    idJugador: true, nombre: true, apellido1: true, apellido2: true, rating: true,
};

const includeJugadores = {
    jugador_blanco: { select: selectJugadorBase },
    jugador_negro: { select: selectJugadorBase },
};

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export async function getAllMesas() {
    return prisma.mesa.findMany({
        include: {
            ronda: { select: { idRonda: true, numeroRonda: true, estado: true } },
            jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            partida: true,
        },
        orderBy: { fecha_creacion: 'desc' },
    });
}

export async function getMesasByRonda(idRonda: number) {
    return prisma.mesa.findMany({
        where: { idRonda },
        include: { ...includeJugadores, partida: true },
        orderBy: { numeroMesa: 'asc' },
    });
}

/** Lectura pública — sin autenticación. */
export async function getMesasByRondaPublico(idRonda: number) {
    return prisma.mesa.findMany({
        where: { idRonda },
        include: { ...includeJugadores, partida: true },
        orderBy: { numeroMesa: 'asc' },
    });
}

export async function getMesaById(id: number) {
    const mesa = await prisma.mesa.findUnique({
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
    if (!mesa) throw new NotFoundError('Mesa no encontrada');
    return mesa;
}

export async function createMesa(dto: CreateMesaDto) {
    const { numeroMesa, idRonda, idJugadorBlanco, idJugadorNegro, estado, notas } = dto;

    if (!numeroMesa || !idRonda || !idJugadorBlanco || !idJugadorNegro)
        throw new ValidationError('Faltan campos obligatorios: numeroMesa, idRonda, idJugadorBlanco, idJugadorNegro');

    if (idJugadorBlanco === idJugadorNegro)
        throw new ValidationError('Un jugador no puede enfrentarse a sí mismo');

    const [jBlanco, jNegro] = await Promise.all([
        prisma.jugador.findUnique({ where: { idJugador: idJugadorBlanco } }),
        prisma.jugador.findUnique({ where: { idJugador: idJugadorNegro } }),
    ]);
    if (!jBlanco || !jNegro)
        throw new NotFoundError('Uno o ambos jugadores no fueron encontrados');

    const [mesaB, mesaN] = await Promise.all([
        prisma.mesa.findFirst({
            where: { idRonda, OR: [{ idJugadorBlanco }, { idJugadorNegro: idJugadorBlanco }] },
        }),
        prisma.mesa.findFirst({
            where: { idRonda, OR: [{ idJugadorBlanco: idJugadorNegro }, { idJugadorNegro }] },
        }),
    ]);

    if (mesaB)
        throw new ValidationError(`${jBlanco.nombre} ${jBlanco.apellido1} ya tiene una mesa asignada en esta ronda`);
    if (mesaN)
        throw new ValidationError(`${jNegro.nombre} ${jNegro.apellido1} ya tiene una mesa asignada en esta ronda`);

    return prisma.mesa.create({
        data: {
            numeroMesa,
            idRonda,
            idJugadorBlanco,
            idJugadorNegro,
            ilegalesBlanco: 0,
            ilegalesNegro: 0,
            estado: estado ?? MesaEstado.pendiente,
            notas: notas ?? null,
            fecha_creacion: new Date(),
        },
    });
}

export async function deleteMesa(id: number) {
    const mesa = await prisma.mesa.findUnique({ where: { idMesa: id } });
    if (!mesa) throw new NotFoundError('Mesa no encontrada');
    await prisma.mesa.delete({ where: { idMesa: id } });
}

/** Verifica disponibilidad y libera bloqueos expirados automáticamente. */
export async function verificarDisponibilidadMesa(id: number) {
    const mesa = await prisma.mesa.findUnique({
        where: { idMesa: id },
        select: { idMesa: true, estado: true, usuarioEditando: true, timestampEdicion: true },
    });
    if (!mesa) throw new NotFoundError('Mesa no encontrada');

    if (mesa.estado === MesaEstado.finalizada) {
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
        await prisma.mesa.update({
            where: { idMesa: id },
            data: { usuarioEditando: null, timestampEdicion: new Date() },
        });
    }

    return { disponible: true, yaFinalizada: false, message: 'Mesa disponible para edición' };
}

/** Bloquea la mesa para el usuario actual. */
export async function bloquearMesa(id: number, usuarioTelefono: string, modoEdicion = false) {
    const mesa = await prisma.mesa.findUnique({ where: { idMesa: id } });
    if (!mesa) throw new NotFoundError('Mesa no encontrada');

    if (!modoEdicion && mesa.estado === MesaEstado.finalizada)
        throw new AppError('Esta mesa ya ha sido finalizada', 400, 'MESA_FINALIZADA');

    if (mesa.usuarioEditando && mesa.usuarioEditando !== usuarioTelefono && mesa.timestampEdicion) {
        const tiempoBloqueo = Date.now() - new Date(mesa.timestampEdicion).getTime();
        if (tiempoBloqueo < TIMEOUT_BLOQUEO_MS)
            throw new AppError('Mesa bloqueada por otro usuario', 423, 'MESA_BLOQUEADA');
    }

    return prisma.mesa.update({
        where: { idMesa: id },
        data: { usuarioEditando: usuarioTelefono, timestampEdicion: new Date() },
    });
}

/** Libera el bloqueo (solo el usuario que bloqueó). */
export async function liberarMesa(id: number, usuarioTelefono: string) {
    const mesa = await prisma.mesa.findUnique({ where: { idMesa: id } });
    if (!mesa) throw new NotFoundError('Mesa no encontrada');

    if (mesa.usuarioEditando === usuarioTelefono) {
        await prisma.mesa.update({
            where: { idMesa: id },
            data: { usuarioEditando: null, timestampEdicion: new Date() },
        });
    }
}

/** Actualiza la mesa con validación de bloqueo y concurrencia optimista. */
export async function updateMesa(id: number, dto: UpdateMesaDto, usuarioTelefono: string) {
    const mesa = await prisma.mesa.findUnique({ where: { idMesa: id } });
    if (!mesa) throw new NotFoundError('Mesa no encontrada');

    if (mesa.estado === MesaEstado.finalizada && dto.estado === MesaEstado.finalizada)
        throw new AppError('Esta mesa ya ha sido finalizada', 400, 'MESA_YA_FINALIZADA');

    if (mesa.usuarioEditando && mesa.usuarioEditando !== usuarioTelefono)
        throw new AppError('Otro usuario está editando esta mesa', 423, 'MESA_BLOQUEADA');

    if (dto.timestampEdicion && mesa.timestampEdicion) {
        const tsRequest = new Date(dto.timestampEdicion).getTime();
        const tsActual = new Date(mesa.timestampEdicion).getTime();
        if (tsActual > tsRequest)
            throw new AppError(
                'La mesa ha sido modificada por otro usuario. Por favor, recarga los datos.',
                409,
                'CONCURRENT_MODIFICATION',
            );
    }

    const liberarBloqueo = dto.estado === MesaEstado.finalizada || dto.estado === undefined;

    return prisma.mesa.update({
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