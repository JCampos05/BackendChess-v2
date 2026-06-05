import prisma from '../config/database';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/error.middleware';
import { RondaEstado } from '@prisma/client';

export interface CreateRondaDto {
    idTorneo: number;
    idTorneoCategoria: number;
    numeroRonda: number;
    fecha_inicio?: Date | string | null;
    estado?: RondaEstado;
    notas?: string | null;
}

export interface UpdateRondaDto {
    numeroRonda?: number;
    fecha_inicio?: Date | string | null;
    fecha_fin?: Date | string | null;
    estado?: RondaEstado;
    notas?: string | null;
}

// ─── SELECTS ──────────────────────────────────────────────────────────────────

const includeCategoria = {
    torneo_categoria: {
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    },
};

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export async function getAllRondas() {
    return prisma.ronda.findMany({
        include: {
            torneo: { select: { idTorneo: true, nombre: true, fecha: true } },
            ...includeCategoria,
        },
        orderBy: { fecha_creacion: 'desc' },
    });
}

export async function getRondasByTorneo(idTorneo: number) {
    return prisma.ronda.findMany({
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

export async function getRondasByTorneoCat(idTorneo: number, idTorneoCategoria: number) {
    return prisma.ronda.findMany({
        where: { idTorneo, idTorneoCategoria },
        include: includeCategoria,
        orderBy: { numeroRonda: 'asc' },
    });
}

export async function getRondaById(id: number) {
    const r = await prisma.ronda.findUnique({
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
    if (!r) throw new NotFoundError('Ronda no encontrada');
    return r;
}

/** Lectura pública: solo campos seguros, sin autenticación. */
export async function getRondasByTorneoPublico(idTorneo: number) {
    return prisma.ronda.findMany({
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

export async function createRonda(dto: CreateRondaDto) {
    if (!dto.idTorneo || !dto.idTorneoCategoria || !dto.numeroRonda)
        throw new ValidationError('Faltan campos obligatorios: idTorneo, idTorneoCategoria, numeroRonda');

    return prisma.ronda.create({
        data: {
            idTorneo: dto.idTorneo,
            idTorneoCategoria: dto.idTorneoCategoria,
            numeroRonda: dto.numeroRonda,
            fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio as string) : new Date(),
            estado: dto.estado ?? RondaEstado.pendiente,
            notas: dto.notas ?? null,
            fecha_creacion: new Date(),
        },
    });
}

export async function updateRonda(id: number, dto: UpdateRondaDto) {
    const ronda = await prisma.ronda.findUnique({ where: { idRonda: id } });
    if (!ronda) throw new NotFoundError('Ronda no encontrada');

    return prisma.ronda.update({
        where: { idRonda: id },
        data: {
            ...(dto.numeroRonda !== undefined && { numeroRonda: dto.numeroRonda }),
            ...(dto.fecha_inicio !== undefined && {
                fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio as string) : null,
            }),
            ...(dto.fecha_fin !== undefined && {
                fecha_fin: dto.fecha_fin ? new Date(dto.fecha_fin as string) : null,
            }),
            ...(dto.estado !== undefined && { estado: dto.estado }),
            ...(dto.notas !== undefined && { notas: dto.notas }),
        },
    });
}

export async function deleteRonda(id: number) {
    const ronda = await prisma.ronda.findUnique({ where: { idRonda: id } });
    if (!ronda) throw new NotFoundError('Ronda no encontrada');
    if (ronda.estado !== 'pendiente') {
        throw new ForbiddenError(
            `No se puede eliminar una ronda con estado "${ronda.estado}". Solo se pueden eliminar rondas pendientes.`
        );
    }
    await prisma.ronda.delete({ where: { idRonda: id } });
}