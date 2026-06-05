import prisma from '../config/database';
import {
    NotFoundError,
    ValidationError,
} from '../middleware/error.middleware';
import { Prisma } from '@prisma/client';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface UpsertTorneoCategoriaDto {
    idTorneo: number;
    idCategoria: number;
    rondas?: number;
    ritmo_juego?: string | null;
    sistema_competencia?: string | null;
    calendario?: object | null;
    premios?: object | null;
    desempates?: object | null;
    activo?: boolean;
    cierre_inscripciones?: Date | string | null;
    cupo_maximo?: number | null;
}

// ─── INCLUDE BASE ─────────────────────────────────────────────────────────────

const includeCategoria = {
    categoria: {
        select: {
            idCategoria: true,
            nombre: true,
            costo: true,
            edadMinima: true,
            edadMaxima: true,
        },
    },
};

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export async function upsertTorneoCategoria(dto: UpsertTorneoCategoriaDto) {
    const {
        idTorneo, idCategoria, rondas, ritmo_juego, sistema_competencia,
        calendario, premios, desempates, activo, cierre_inscripciones, cupo_maximo,
    } = dto;

    const torneo = await prisma.torneo.findUnique({ where: { idTorneo } });
    if (!torneo) throw new NotFoundError('Torneo no encontrado');

    const categoria = await prisma.categoria.findUnique({ where: { idCategoria } });
    if (!categoria) throw new NotFoundError('Categoría no encontrada');

    if (rondas !== undefined && rondas < 1)
        throw new ValidationError('Las rondas deben ser un número mayor o igual a 1');

    const existente = await prisma.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });

    if (existente) {
        const updated = await prisma.torneoCategoria.update({
            where: { idTorneoCat: existente.idTorneoCat! },
            data: {
                ...(rondas !== undefined && { rondas }),
                ...(ritmo_juego !== undefined && { ritmo_juego: ritmo_juego?.trim() ?? null }),
                ...(sistema_competencia !== undefined && {
                    sistema_competencia: sistema_competencia?.trim() ?? null,
                }),
                // null se persiste explícitamente; undefined omite el campo (sin cambio)
                ...(calendario !== undefined && { calendario: calendario ?? Prisma.JsonNull }),
                ...(premios !== undefined && { premios: premios ?? Prisma.JsonNull }),
                ...(desempates !== undefined && { desempates: desempates ?? Prisma.JsonNull }),
                ...(activo !== undefined && { activo }),
                ...(cierre_inscripciones !== undefined && {
                    cierre_inscripciones: cierre_inscripciones ? new Date(cierre_inscripciones as string) : null,
                }),
                ...(cupo_maximo !== undefined && { cupo_maximo: cupo_maximo ?? null }),
            },
            include: includeCategoria,
        });
        return { data: updated, created: false };
    }

    const created = await prisma.torneoCategoria.create({
        data: {
            idTorneo,
            idCategoria,
            rondas: rondas ?? 5,
            ritmo_juego: ritmo_juego?.trim() ?? null,
            sistema_competencia: sistema_competencia?.trim() ?? null,
            // En create: null se persiste; undefined deja el default de la BD
            calendario: calendario ?? undefined,
            premios: premios ?? undefined,
            desempates: desempates ?? undefined,
            activo: activo ?? true,
            cierre_inscripciones: cierre_inscripciones ? new Date(cierre_inscripciones as string) : undefined,
            cupo_maximo: cupo_maximo ?? undefined,
        },
        include: includeCategoria,
    });
    return { data: created, created: true };
}

export async function getCategoriasByTorneo(idTorneo: number) {
    return prisma.torneoCategoria.findMany({
        where: { idTorneo },
        include: includeCategoria,
        orderBy: { categoria: { nombre: 'asc' } },
    });
}

export async function getTorneoCategoria(idTorneo: number, idCategoria: number) {
    const tc = await prisma.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
        include: {
            ...includeCategoria,
            torneo: {
                select: {
                    idTorneo: true,
                    nombre: true,
                    lugar: true,
                    direccion: true,
                    fecha: true,
                },
            },
        },
    });
    if (!tc) throw new NotFoundError('Configuración no encontrada');
    return tc;
}

export async function deleteTorneoCategoria(idTorneo: number, idCategoria: number) {
    const tc = await prisma.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (!tc) throw new NotFoundError('Configuración no encontrada');
    await prisma.torneoCategoria.delete({ where: { idTorneoCat: tc.idTorneoCat } });
}

export async function toggleActiveTorneoCategoria(
    idTorneo: number,
    idCategoria: number,
    activo?: boolean,
) {
    const tc = await prisma.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (!tc) throw new NotFoundError('Configuración no encontrada');

    const nuevoEstado = activo !== undefined ? activo : !tc.activo;
    return prisma.torneoCategoria.update({
        where: { idTorneoCat: tc.idTorneoCat },
        data: { activo: nuevoEstado },
        include: includeCategoria,
    });
}