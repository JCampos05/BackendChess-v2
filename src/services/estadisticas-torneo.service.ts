import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError } from '../middleware/error.middleware';

// ── Includes reutilizables ───────────────────────────────────

const INCLUDE_JUGADOR = {
    jugador: {
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating: true,
            fecha_nacimiento: true,
        },
    },
} satisfies Prisma.EstadisticaTorneoInclude;

const INCLUDE_COMPLETO = {
    jugador: {
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating: true,
            fecha_nacimiento: true,
        },
    },
    torneo: { select: { idTorneo: true, nombre: true, fecha: true, lugar: true } },
    torneo_categoria: {
        select: {
            idTorneoCat: true,
            rondas: true,
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    },
} satisfies Prisma.EstadisticaTorneoInclude;

// ── Parseo seguro de desempates ──────────────────────────────

const parsearDesempates = (raw: unknown): Record<string, unknown> => {
    if (!raw) return {};
    if (typeof raw === 'object') return raw as Record<string, unknown>;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return {}; }
    }
    return {};
};

// ── Consultas ────────────────────────────────────────────────

export const getAllEstadisticas = async () => {
    return prisma.estadisticaTorneo.findMany({
        include: INCLUDE_COMPLETO,
        orderBy: [{ puntos: 'desc' }, { posicion_actual: 'asc' }],
    });
};

export const getEstadisticasByTorneo = async (idTorneo: number) => {
    return prisma.estadisticaTorneo.findMany({
        where: { idTorneo },
        include: {
            jugador: INCLUDE_JUGADOR.jugador,
            torneo_categoria: {
                select: {
                    idTorneoCat: true,
                    categoria: { select: { idCategoria: true, nombre: true } },
                },
            },
        },
        orderBy: [{ puntos: 'desc' }, { victorias: 'desc' }],
    });
};

export const getEstadisticasByTorneoCategoria = async (
    idTorneo: number,
    idTorneoCategoria: number
) => {
    return prisma.estadisticaTorneo.findMany({
        where: { idTorneo, idTorneoCategoria },
        include: INCLUDE_JUGADOR,
        orderBy: { posicion_actual: 'asc' },
    });
};

/**
 * Calcula estadísticas desde la BD hasta una ronda específica.
 * Reemplaza el query SQL crudo original usando relaciones Prisma.
 *
 * Estrategia: obtener todas las partidas de mesas cuya ronda sea
 * <= numeroRonda para el torneo+categoria, luego calcular en memoria.
 * Es equivalente al query original pero sin SQL crudo.
 */
export const getEstadisticasHastaRonda = async (
    idTorneo: number,
    idTorneoCategoria: number,
    numeroRonda: number
) => {
    // 1. Buscar la categoría para obtener idCategoria
    const torneoCategoria = await prisma.torneoCategoria.findUnique({
        where: { idTorneoCat: idTorneoCategoria },
        select: { idCategoria: true },
    });
    if (!torneoCategoria) throw new NotFoundError('Categoría de torneo no encontrada');

    // 2. Inscripciones confirmadas en esa categoría+torneo
    const inscripciones = await prisma.inscripcion.findMany({
        where: {
            idTorneo,
            idCategoria: torneoCategoria.idCategoria,
            estado: 'confirmado',
        },
        select: {
            jugador: {
                select: {
                    idJugador: true,
                    nombre: true,
                    apellido1: true,
                    apellido2: true,
                    rating: true,
                    fecha_nacimiento: true,
                },
            },
        },
    });

    if (inscripciones.length === 0) return [];

    // 3. Partidas jugadas en las rondas <= numeroRonda del torneo+categoria
    const partidas = await prisma.partida.findMany({
        where: {
            mesa: {
                ronda: {
                    idTorneo,
                    idTorneoCategoria,
                    numeroRonda: { lte: numeroRonda },
                },
            },
        },
        select: {
            resultado: true,
            mesa: {
                select: {
                    idJugadorBlanco: true,
                    idJugadorNegro: true,
                },
            },
        },
    });

    // 4. Calcular stats por jugador en memoria
    const statsMap = new Map<
        number,
        { puntos: number; victorias: number; empates: number; derrotas: number; partidas_jugadas: number }
    >();

    for (const insc of inscripciones) {
        statsMap.set(insc.jugador.idJugador, {
            puntos: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            partidas_jugadas: 0,
        });
    }

    for (const p of partidas) {
        const { idJugadorBlanco, idJugadorNegro } = p.mesa;
        const resultado = p.resultado;

        const blanco = statsMap.get(idJugadorBlanco);
        const negro = statsMap.get(idJugadorNegro);

        if (resultado === '1-0') {
            if (blanco) { blanco.victorias++; blanco.puntos += 1; blanco.partidas_jugadas++; }
            if (negro)  { negro.derrotas++;              negro.partidas_jugadas++; }
        } else if (resultado === '0-1') {
            if (negro)  { negro.victorias++;  negro.puntos += 1;  negro.partidas_jugadas++; }
            if (blanco) { blanco.derrotas++;              blanco.partidas_jugadas++; }
        } else if (resultado === '0.5-0.5') {
            if (blanco) { blanco.empates++; blanco.puntos += 0.5; blanco.partidas_jugadas++; }
            if (negro)  { negro.empates++;  negro.puntos  += 0.5; negro.partidas_jugadas++; }
        }
    }

    // 5. Armar resultado ordenado
    const resultado = inscripciones
        .map((insc, idx) => {
            const stats = statsMap.get(insc.jugador.idJugador) ?? {
                puntos: 0, victorias: 0, empates: 0, derrotas: 0, partidas_jugadas: 0,
            };
            return {
                idJugador: insc.jugador.idJugador,
                idTorneo,
                idTorneoCategoria,
                ...stats,
                posicion_actual: 0, // se asigna abajo tras ordenar
                jugador: insc.jugador,
            };
        })
        .sort((a, b) => b.puntos - a.puntos || b.victorias - a.victorias || b.jugador.rating - a.jugador.rating)
        .map((e, i) => ({ ...e, posicion_actual: i + 1 }));

    return resultado;
};

export const getEstadisticaByJugador = async (
    idJugador: number,
    idTorneo: number
) => {
    const estadistica = await prisma.estadisticaTorneo.findFirst({
        where: { idJugador, idTorneo },
        include: INCLUDE_COMPLETO,
    });
    if (!estadistica) throw new NotFoundError('Estadística no encontrada');
    return estadistica;
};

// ── CRUD manual ──────────────────────────────────────────────

export const createEstadistica = async (datos: {
    idJugador: number;
    idTorneo: number;
    idTorneoCategoria: number;
    puntos?: number;
    partidas_jugadas?: number;
    victorias?: number;
    empates?: number;
    derrotas?: number;
}) => {
    return prisma.estadisticaTorneo.create({
        data: {
            idJugador: datos.idJugador,
            idTorneo: datos.idTorneo,
            idTorneoCategoria: datos.idTorneoCategoria,
            puntos: datos.puntos ?? 0,
            partidas_jugadas: datos.partidas_jugadas ?? 0,
            victorias: datos.victorias ?? 0,
            empates: datos.empates ?? 0,
            derrotas: datos.derrotas ?? 0,
            fecha_actualizacion: new Date(),
        },
        include: INCLUDE_COMPLETO,
    });
};

export const updateEstadistica = async (
    idEstadistica: number,
    datos: {
        puntos?: number;
        partidas_jugadas?: number;
        victorias?: number;
        empates?: number;
        derrotas?: number;
        posicion_actual?: number;
    }
) => {
    const existe = await prisma.estadisticaTorneo.findUnique({
        where: { idEstadistica },
    });
    if (!existe) throw new NotFoundError('Estadística no encontrada');

    return prisma.estadisticaTorneo.update({
        where: { idEstadistica },
        data: { ...datos, fecha_actualizacion: new Date() },
        include: INCLUDE_COMPLETO,
    });
};

export const deleteEstadistica = async (idEstadistica: number) => {
    const existe = await prisma.estadisticaTorneo.findUnique({
        where: { idEstadistica },
    });
    if (!existe) throw new NotFoundError('Estadística no encontrada');

    await prisma.estadisticaTorneo.delete({ where: { idEstadistica } });
    return { eliminado: true };
};

// ── Recalcular posiciones ────────────────────────────────────

export const recalcularPosiciones = async (
    idTorneo: number,
    idTorneoCategoria: number
) => {
    const estadisticas = await prisma.estadisticaTorneo.findMany({
        where: { idTorneo, idTorneoCategoria },
        orderBy: [{ puntos: 'desc' }, { victorias: 'desc' }],
        select: { idEstadistica: true },
    });

    // Actualizar cada posición en paralelo con Promise.all
    await Promise.all(
        estadisticas.map((est, idx) =>
            prisma.estadisticaTorneo.update({
                where: { idEstadistica: est.idEstadistica },
                data: { posicion_actual: idx + 1, fecha_actualizacion: new Date() },
            })
        )
    );

    return prisma.estadisticaTorneo.findMany({
        where: { idTorneo, idTorneoCategoria },
        orderBy: { posicion_actual: 'asc' },
        include: INCLUDE_JUGADOR,
    });
};

// ── Cargar ranking final ─────────────────────────────────────

export const cargarRankingFinal = async (
    idTorneo: number,
    idTorneoCategoria: number,
    jugadores: Array<{
        idJugador: number;
        posicion: number;
        puntos?: number;
        rating?: number;
        desempates?: Record<string, unknown>;
    }>
) => {
    const torneoCategoria = await prisma.torneoCategoria.findUnique({
        where: { idTorneoCat: idTorneoCategoria },
        select: { idTorneoCat: true, desempates: true },
    });
    if (!torneoCategoria) throw new NotFoundError('Categoría de torneo no encontrada');

    const sistemasDesempate = (torneoCategoria.desempates as unknown[]) ?? [];
    const procesados: { idJugador: number; posicion: number }[] = [];
    const errores: { jugador: unknown; error: string }[] = [];

    for (const jd of jugadores) {
        try {
            if (!jd.idJugador) throw new Error('idJugador es requerido');

            if (jd.desempates && Object.keys(jd.desempates).length !== sistemasDesempate.length) {
                throw new Error(
                    `Número de desempates (${Object.keys(jd.desempates).length}) no coincide con sistemas configurados (${sistemasDesempate.length})`
                );
            }

            // EstadisticaTorneo no tiene unique compuesto en el schema —
            // se usa findFirst + update/create explícito
            const existe = await prisma.estadisticaTorneo.findFirst({
                where: { idJugador: jd.idJugador, idTorneo, idTorneoCategoria },
                select: { idEstadistica: true },
            });

            if (existe) {
                await prisma.estadisticaTorneo.update({
                    where: { idEstadistica: existe.idEstadistica },
                    data: {
                        puntos: jd.puntos ?? undefined,
                        rating_torneo: jd.rating ?? undefined,
                        posicion_actual: jd.posicion,
                        desempates: jd.desempates as Prisma.InputJsonValue,
                        fecha_actualizacion: new Date(),
                    },
                });
            } else {
                await prisma.estadisticaTorneo.create({
                    data: {
                        idJugador: jd.idJugador,
                        idTorneo,
                        idTorneoCategoria,
                        puntos: jd.puntos ?? 0,
                        rating_torneo: jd.rating,
                        posicion_actual: jd.posicion,
                        desempates: jd.desempates as Prisma.InputJsonValue,
                        partidas_jugadas: 0,
                        victorias: 0,
                        empates: 0,
                        derrotas: 0,
                        fecha_actualizacion: new Date(),
                    },
                });
            }

            procesados.push({ idJugador: jd.idJugador, posicion: jd.posicion });
        } catch (err) {
            errores.push({ jugador: jd, error: (err as Error).message });
        }
    }

    return { procesados: procesados.length, errores: errores.length, detalles: procesados, erroresDetalle: errores };
};

// ── Lista inicial y ranking final públicos ───────────────────

export const getListaInicialPublica = async (
    idTorneo: number,
    idTorneoCategoria: number
) => {
    const estadisticas = await prisma.estadisticaTorneo.findMany({
        where: { idTorneo, idTorneoCategoria },
        include: INCLUDE_JUGADOR,
    });

    return estadisticas
        .filter((e) => e.jugador !== null)
        .map((e) => ({
            idJugador: e.jugador!.idJugador,
            nombre: e.jugador!.nombre,
            apellido1: e.jugador!.apellido1,
            apellido2: e.jugador!.apellido2,
            rating: e.jugador!.rating,
        }))
        .sort((a, b) => b.rating - a.rating);
};

export const getRankingFinalPublico = async (
    idTorneo: number,
    idTorneoCategoria: number
) => {
    const torneoCategoria = await prisma.torneoCategoria.findUnique({
        where: { idTorneoCat: idTorneoCategoria },
        select: { desempates: true },
    });
    if (!torneoCategoria) throw new NotFoundError('Categoría de torneo no encontrada');

    const estadisticas = await prisma.estadisticaTorneo.findMany({
        where: {
            idTorneo,
            idTorneoCategoria,
            posicion_actual: { not: null },
        },
        select: {
            idJugador: true,
            puntos: true,
            desempates: true,
            partidas_jugadas: true,
            victorias: true,
            empates: true,
            derrotas: true,
            posicion_actual: true,
            jugador: {
                select: {
                    idJugador: true,
                    nombre: true,
                    apellido1: true,
                    apellido2: true,
                    rating: true,
                    fecha_nacimiento: true,
                },
            },
        },
        orderBy: { posicion_actual: 'asc' },
    });

    if (estadisticas.length === 0) throw new NotFoundError('No se encontró ranking final para esta categoría');

    return {
        ranking: estadisticas.map((e) => ({
            ...e,
            puntos: parseFloat(String(e.puntos)) || 0,
            desempates: parsearDesempates(e.desempates),
        })),
        sistemasDesempate: torneoCategoria.desempates ?? [],
    };
};