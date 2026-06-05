import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../middleware/error.middleware';

export interface CreateHistorialDto {
    idJugador1: number;
    idJugador2: number;
    idTorneo: number;
    idTorneoCategoria: number;
    numeroRonda: number;
}

const selectJugador = {
    idJugador: true, nombre: true, apellido1: true, apellido2: true,
};

export async function getAllHistorial() {
    return prisma.historialEmparejamiento.findMany({
        include: {
            jugador1: { select: selectJugador },
            jugador2: { select: selectJugador },
            torneo: { select: { idTorneo: true, nombre: true, fecha: true } },
        },
        orderBy: { fecha_emparejamiento: 'desc' },
    });
}

export async function getHistorialByTorneo(idTorneo: number) {
    return prisma.historialEmparejamiento.findMany({
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

export async function getHistorialByJugador(idJugador: number, idTorneo: number) {
    return prisma.historialEmparejamiento.findMany({
        where: { idTorneo, OR: [{ idJugador1: idJugador }, { idJugador2: idJugador }] },
        include: {
            jugador1: { select: { ...selectJugador, rating: true } },
            jugador2: { select: { ...selectJugador, rating: true } },
        },
        orderBy: { numeroRonda: 'asc' },
    });
}

export async function verificarEnfrentamiento(
    idJugador1: number,
    idJugador2: number,
    idTorneo: number,
) {
    const enfrentamiento = await prisma.historialEmparejamiento.findFirst({
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

export async function createHistorial(dto: CreateHistorialDto) {
    const { idJugador1, idJugador2, idTorneo, idTorneoCategoria, numeroRonda } = dto;

    if (!idJugador1 || !idJugador2 || !idTorneo || !idTorneoCategoria || !numeroRonda)
        throw new ValidationError(
            'Faltan campos obligatorios: idJugador1, idJugador2, idTorneo, idTorneoCategoria, numeroRonda',
        );
    if (idJugador1 === idJugador2)
        throw new ValidationError('Un jugador no puede enfrentarse a sí mismo');

    return prisma.historialEmparejamiento.create({
        data: {
            idJugador1, idJugador2,
            idTorneo, idTorneoCategoria,
            numeroRonda,
            fecha_emparejamiento: new Date(),
        },
    });
}

export async function createHistorialRonda(emparejamientos: Partial<CreateHistorialDto>[]) {
    if (!Array.isArray(emparejamientos))
        throw new ValidationError('Se requiere un array de emparejamientos');

    const validos = emparejamientos.filter(
        (e) => e.idJugador1 && e.idJugador2 && e.idTorneo && e.idTorneoCategoria && e.numeroRonda,
    ) as CreateHistorialDto[];

    if (validos.length === 0) return [];

    return prisma.$transaction(
        validos.map((e) =>
            prisma.historialEmparejamiento.create({
                data: {
                    idJugador1: e.idJugador1,
                    idJugador2: e.idJugador2,
                    idTorneo: e.idTorneo,
                    idTorneoCategoria: e.idTorneoCategoria,
                    numeroRonda: e.numeroRonda,
                    fecha_emparejamiento: new Date(),
                },
            }),
        ),
    );
}

export async function deleteHistorial(id: number) {
    const h = await prisma.historialEmparejamiento.findUnique({ where: { idHistorial: id } });
    if (!h) throw new NotFoundError('Registro de historial no encontrado');
    await prisma.historialEmparejamiento.delete({ where: { idHistorial: id } });
}