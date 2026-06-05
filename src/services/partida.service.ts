import prisma from '../config/database';
import { NotFoundError, ValidationError, AppError } from '../middleware/error.middleware';
import { TipoFinalizacion } from '@prisma/client';

export interface CreatePartidaDto {
    idMesa: number;
    idJugadorGanador?: number | null;
    resultado: string;
    tipo_finalizacion?: TipoFinalizacion | null;
    descripcion_finalizacion?: string | null;
    duracion_minutos?: number | null;
}

export interface UpdatePartidaDto {
    idJugadorGanador?: number | null;
    resultado?: string;
    tipo_finalizacion?: TipoFinalizacion | null;
    descripcion_finalizacion?: string | null;
    duracion_minutos?: number | null;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parsearPuntos(resultado: string): [number, number] {
    if (resultado === '1-0') return [1, 0];
    if (resultado === '0-1') return [0, 1];
    if (resultado === '0.5-0.5') return [0.5, 0.5];
    return [0, 0];
}

type PrismaTx = Omit<
    typeof prisma,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

async function ajustarEstadisticas(
    tx: PrismaTx,
    idJugador: number,
    idTorneo: number,
    idTorneoCategoria: number,
    puntos: number,
    signo: 1 | -1,
) {
    let est = await tx.estadisticaTorneo.findFirst({
        where: { idJugador, idTorneo, idTorneoCategoria },
    });

    if (!est) {
        if (signo === -1) return;
        est = await tx.estadisticaTorneo.create({
            data: {
                idJugador, idTorneo, idTorneoCategoria,
                puntos: 0, partidas_jugadas: 0,
                victorias: 0, empates: 0, derrotas: 0,
                fecha_actualizacion: new Date(),
            },
        });
    }

    const nuevosPuntos = signo === 1
        ? Number(est.puntos) + puntos
        : Math.max(0, Number(est.puntos) - puntos);
    const partidasJugadas = Math.max(0, est.partidas_jugadas + signo);
    const victorias = puntos === 1 ? Math.max(0, est.victorias + signo) : est.victorias;
    const empates = puntos === 0.5 ? Math.max(0, est.empates + signo) : est.empates;
    const derrotas = puntos === 0 ? Math.max(0, est.derrotas + signo) : est.derrotas;

    await tx.estadisticaTorneo.update({
        where: { idEstadistica: est.idEstadistica },
        data: { puntos: nuevosPuntos, partidas_jugadas: partidasJugadas, victorias, empates, derrotas, fecha_actualizacion: new Date() },
    });
}

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export async function getAllPartidas() {
    return prisma.partida.findMany({
        include: {
            mesa: {
                include: {
                    jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
                    jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
                    ronda: { select: { idRonda: true, numeroRonda: true } },
                },
            },
            jugador_ganador: { select: { idJugador: true, nombre: true, apellido1: true } },
        },
        orderBy: { fecha_finalizacion: 'desc' },
    });
}

export async function getPartidaById(id: number) {
    const p = await prisma.partida.findUnique({
        where: { idPartida: id },
        include: {
            mesa: {
                include: {
                    jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true, rating: true } },
                    jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true, rating: true } },
                    ronda: { select: { idRonda: true, numeroRonda: true, idTorneo: true, idTorneoCategoria: true } },
                },
            },
            jugador_ganador: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true } },
        },
    });
    if (!p) throw new NotFoundError('Partida no encontrada');
    return p;
}

export async function getPartidasByJugadorTorneo(idJugador: number, idTorneo: number) {
    return prisma.partida.findMany({
        where: {
            mesa: {
                OR: [{ idJugadorBlanco: idJugador }, { idJugadorNegro: idJugador }],
                ronda: { idTorneo },
            },
        },
        include: {
            mesa: {
                include: {
                    jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true, rating: true } },
                    jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true, rating: true } },
                    ronda: { select: { idRonda: true, numeroRonda: true, fecha_inicio: true, fecha_fin: true } },
                },
            },
            jugador_ganador: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true } },
        },
        orderBy: { mesa: { ronda: { numeroRonda: 'asc' } } },
    });
}

/** Registra partida + actualiza estadísticas en una sola transacción. */
export async function createPartida(dto: CreatePartidaDto) {
    if (!dto.idMesa || !dto.resultado)
        throw new ValidationError('Faltan campos obligatorios: idMesa, resultado');

    return prisma.$transaction(async (tx) => {
        const mesa = await tx.mesa.findUnique({
            where: { idMesa: dto.idMesa },
            include: { ronda: { select: { idTorneo: true, idTorneoCategoria: true } } },
        });

        if (!mesa) throw new NotFoundError('Mesa no encontrada');
        if (mesa.estado === 'finalizada')
            throw new AppError('Esta mesa ya ha sido finalizada', 400, 'MESA_YA_FINALIZADA');

        const dup = await tx.partida.findUnique({ where: { idMesa: dto.idMesa } });
        if (dup)
            throw new AppError('Ya existe un resultado registrado para esta mesa', 400, 'PARTIDA_DUPLICADA');

        const nueva = await tx.partida.create({
            data: {
                idMesa: dto.idMesa,
                idJugadorGanador: dto.idJugadorGanador ?? null,
                resultado: dto.resultado,
                tipo_finalizacion: dto.tipo_finalizacion ?? null,
                descripcion_finalizacion: dto.descripcion_finalizacion ?? null,
                duracion_minutos: dto.duracion_minutos ?? null,
                fecha_finalizacion: new Date(),
            },
        });

        await tx.mesa.update({
            where: { idMesa: dto.idMesa },
            data: { estado: 'finalizada', usuarioEditando: null, timestampEdicion: new Date() },
        });

        const [pB, pN] = parsearPuntos(dto.resultado);
        const { idTorneo, idTorneoCategoria } = mesa.ronda;

        await ajustarEstadisticas(tx, mesa.idJugadorBlanco, idTorneo, idTorneoCategoria, pB, 1);
        await ajustarEstadisticas(tx, mesa.idJugadorNegro, idTorneo, idTorneoCategoria, pN, 1);

        return nueva;
    });
}

/** Actualiza resultado + recalcula estadísticas (revert → apply). */
export async function updatePartida(id: number, dto: UpdatePartidaDto) {
    return prisma.$transaction(async (tx) => {
        const partida = await tx.partida.findUnique({
            where: { idPartida: id },
            include: {
                mesa: { include: { ronda: { select: { idTorneo: true, idTorneoCategoria: true } } } },
            },
        });

        if (!partida) throw new NotFoundError('Partida no encontrada');
        if (!partida.mesa?.ronda)
            throw new ValidationError('No se encontró información de la mesa o ronda');

        const idBlanco = partida.mesa.idJugadorBlanco;
        const idNegro = partida.mesa.idJugadorNegro;
        const { idTorneo, idTorneoCategoria } = partida.mesa.ronda;

        // 1. Revertir estadísticas anteriores
        const [pBAnt, pNAnt] = parsearPuntos(partida.resultado);
        await ajustarEstadisticas(tx, idBlanco, idTorneo, idTorneoCategoria, pBAnt, -1);
        await ajustarEstadisticas(tx, idNegro, idTorneo, idTorneoCategoria, pNAnt, -1);

        // 2. Actualizar partida
        const updated = await tx.partida.update({
            where: { idPartida: id },
            data: {
                ...(dto.idJugadorGanador !== undefined && { idJugadorGanador: dto.idJugadorGanador }),
                ...(dto.resultado !== undefined && { resultado: dto.resultado }),
                ...(dto.tipo_finalizacion !== undefined && { tipo_finalizacion: dto.tipo_finalizacion }),
                ...(dto.descripcion_finalizacion !== undefined && { descripcion_finalizacion: dto.descripcion_finalizacion }),
                ...(dto.duracion_minutos !== undefined && { duracion_minutos: dto.duracion_minutos }),
            },
        });

        // 3. Aplicar nuevas estadísticas
        const resultadoFinal = dto.resultado ?? partida.resultado;
        const [pBNew, pNNew] = parsearPuntos(resultadoFinal);
        await ajustarEstadisticas(tx, idBlanco, idTorneo, idTorneoCategoria, pBNew, 1);
        await ajustarEstadisticas(tx, idNegro, idTorneo, idTorneoCategoria, pNNew, 1);

        return updated;
    });
}

export async function deletePartida(id: number) {
    const p = await prisma.partida.findUnique({ where: { idPartida: id } });
    if (!p) throw new NotFoundError('Partida no encontrada');
    await prisma.partida.delete({ where: { idPartida: id } });
}