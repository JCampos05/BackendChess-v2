"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankingFinalPublico = exports.getListaInicialPublica = exports.cargarRankingFinal = exports.recalcularPosiciones = exports.deleteEstadistica = exports.updateEstadistica = exports.createEstadistica = exports.getEstadisticaByJugador = exports.getEstadisticasHastaRonda = exports.getEstadisticasByTorneoCategoria = exports.getEstadisticasByTorneo = exports.getAllEstadisticas = void 0;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
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
};
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
};
// ── Parseo seguro de desempates ──────────────────────────────
const parsearDesempates = (raw) => {
    if (!raw)
        return {};
    if (typeof raw === 'object')
        return raw;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        }
        catch {
            return {};
        }
    }
    return {};
};
// ── Consultas ────────────────────────────────────────────────
const getAllEstadisticas = async () => {
    return database_1.default.estadisticaTorneo.findMany({
        include: INCLUDE_COMPLETO,
        orderBy: [{ puntos: 'desc' }, { posicion_actual: 'asc' }],
    });
};
exports.getAllEstadisticas = getAllEstadisticas;
const getEstadisticasByTorneo = async (idTorneo) => {
    return database_1.default.estadisticaTorneo.findMany({
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
exports.getEstadisticasByTorneo = getEstadisticasByTorneo;
const getEstadisticasByTorneoCategoria = async (idTorneo, idTorneoCategoria) => {
    return database_1.default.estadisticaTorneo.findMany({
        where: { idTorneo, idTorneoCategoria },
        include: INCLUDE_JUGADOR,
        orderBy: { posicion_actual: 'asc' },
    });
};
exports.getEstadisticasByTorneoCategoria = getEstadisticasByTorneoCategoria;
/**
 * Calcula estadísticas desde la BD hasta una ronda específica.
 * Reemplaza el query SQL crudo original usando relaciones Prisma.
 *
 * Estrategia: obtener todas las partidas de mesas cuya ronda sea
 * <= numeroRonda para el torneo+categoria, luego calcular en memoria.
 * Es equivalente al query original pero sin SQL crudo.
 */
const getEstadisticasHastaRonda = async (idTorneo, idTorneoCategoria, numeroRonda) => {
    // 1. Buscar la categoría para obtener idCategoria
    const torneoCategoria = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneoCat: idTorneoCategoria },
        select: { idCategoria: true },
    });
    if (!torneoCategoria)
        throw new error_middleware_1.NotFoundError('Categoría de torneo no encontrada');
    // 2. Inscripciones confirmadas en esa categoría+torneo
    const inscripciones = await database_1.default.inscripcion.findMany({
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
    if (inscripciones.length === 0)
        return [];
    // 3. Partidas jugadas en las rondas <= numeroRonda del torneo+categoria
    const partidas = await database_1.default.partida.findMany({
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
    const statsMap = new Map();
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
            if (blanco) {
                blanco.victorias++;
                blanco.puntos += 1;
                blanco.partidas_jugadas++;
            }
            if (negro) {
                negro.derrotas++;
                negro.partidas_jugadas++;
            }
        }
        else if (resultado === '0-1') {
            if (negro) {
                negro.victorias++;
                negro.puntos += 1;
                negro.partidas_jugadas++;
            }
            if (blanco) {
                blanco.derrotas++;
                blanco.partidas_jugadas++;
            }
        }
        else if (resultado === '0.5-0.5') {
            if (blanco) {
                blanco.empates++;
                blanco.puntos += 0.5;
                blanco.partidas_jugadas++;
            }
            if (negro) {
                negro.empates++;
                negro.puntos += 0.5;
                negro.partidas_jugadas++;
            }
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
exports.getEstadisticasHastaRonda = getEstadisticasHastaRonda;
const getEstadisticaByJugador = async (idJugador, idTorneo) => {
    const estadistica = await database_1.default.estadisticaTorneo.findFirst({
        where: { idJugador, idTorneo },
        include: INCLUDE_COMPLETO,
    });
    if (!estadistica)
        throw new error_middleware_1.NotFoundError('Estadística no encontrada');
    return estadistica;
};
exports.getEstadisticaByJugador = getEstadisticaByJugador;
// ── CRUD manual ──────────────────────────────────────────────
const createEstadistica = async (datos) => {
    return database_1.default.estadisticaTorneo.create({
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
exports.createEstadistica = createEstadistica;
const updateEstadistica = async (idEstadistica, datos) => {
    const existe = await database_1.default.estadisticaTorneo.findUnique({
        where: { idEstadistica },
    });
    if (!existe)
        throw new error_middleware_1.NotFoundError('Estadística no encontrada');
    return database_1.default.estadisticaTorneo.update({
        where: { idEstadistica },
        data: { ...datos, fecha_actualizacion: new Date() },
        include: INCLUDE_COMPLETO,
    });
};
exports.updateEstadistica = updateEstadistica;
const deleteEstadistica = async (idEstadistica) => {
    const existe = await database_1.default.estadisticaTorneo.findUnique({
        where: { idEstadistica },
    });
    if (!existe)
        throw new error_middleware_1.NotFoundError('Estadística no encontrada');
    await database_1.default.estadisticaTorneo.delete({ where: { idEstadistica } });
    return { eliminado: true };
};
exports.deleteEstadistica = deleteEstadistica;
// ── Recalcular posiciones ────────────────────────────────────
const recalcularPosiciones = async (idTorneo, idTorneoCategoria) => {
    const estadisticas = await database_1.default.estadisticaTorneo.findMany({
        where: { idTorneo, idTorneoCategoria },
        orderBy: [{ puntos: 'desc' }, { victorias: 'desc' }],
        select: { idEstadistica: true },
    });
    // Actualizar cada posición en paralelo con Promise.all
    await Promise.all(estadisticas.map((est, idx) => database_1.default.estadisticaTorneo.update({
        where: { idEstadistica: est.idEstadistica },
        data: { posicion_actual: idx + 1, fecha_actualizacion: new Date() },
    })));
    return database_1.default.estadisticaTorneo.findMany({
        where: { idTorneo, idTorneoCategoria },
        orderBy: { posicion_actual: 'asc' },
        include: INCLUDE_JUGADOR,
    });
};
exports.recalcularPosiciones = recalcularPosiciones;
// ── Cargar ranking final ─────────────────────────────────────
const cargarRankingFinal = async (idTorneo, idTorneoCategoria, jugadores) => {
    const torneoCategoria = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneoCat: idTorneoCategoria },
        select: { idTorneoCat: true, desempates: true },
    });
    if (!torneoCategoria)
        throw new error_middleware_1.NotFoundError('Categoría de torneo no encontrada');
    const sistemasDesempate = torneoCategoria.desempates ?? [];
    const procesados = [];
    const errores = [];
    for (const jd of jugadores) {
        try {
            if (!jd.idJugador)
                throw new Error('idJugador es requerido');
            if (jd.desempates && Object.keys(jd.desempates).length !== sistemasDesempate.length) {
                throw new Error(`Número de desempates (${Object.keys(jd.desempates).length}) no coincide con sistemas configurados (${sistemasDesempate.length})`);
            }
            // EstadisticaTorneo no tiene unique compuesto en el schema —
            // se usa findFirst + update/create explícito
            const existe = await database_1.default.estadisticaTorneo.findFirst({
                where: { idJugador: jd.idJugador, idTorneo, idTorneoCategoria },
                select: { idEstadistica: true },
            });
            if (existe) {
                await database_1.default.estadisticaTorneo.update({
                    where: { idEstadistica: existe.idEstadistica },
                    data: {
                        puntos: jd.puntos ?? undefined,
                        rating_torneo: jd.rating ?? undefined,
                        posicion_actual: jd.posicion,
                        desempates: jd.desempates,
                        fecha_actualizacion: new Date(),
                    },
                });
            }
            else {
                await database_1.default.estadisticaTorneo.create({
                    data: {
                        idJugador: jd.idJugador,
                        idTorneo,
                        idTorneoCategoria,
                        puntos: jd.puntos ?? 0,
                        rating_torneo: jd.rating,
                        posicion_actual: jd.posicion,
                        desempates: jd.desempates,
                        partidas_jugadas: 0,
                        victorias: 0,
                        empates: 0,
                        derrotas: 0,
                        fecha_actualizacion: new Date(),
                    },
                });
            }
            procesados.push({ idJugador: jd.idJugador, posicion: jd.posicion });
        }
        catch (err) {
            errores.push({ jugador: jd, error: err.message });
        }
    }
    return { procesados: procesados.length, errores: errores.length, detalles: procesados, erroresDetalle: errores };
};
exports.cargarRankingFinal = cargarRankingFinal;
// ── Lista inicial y ranking final públicos ───────────────────
const getListaInicialPublica = async (idTorneo, idTorneoCategoria) => {
    const estadisticas = await database_1.default.estadisticaTorneo.findMany({
        where: { idTorneo, idTorneoCategoria },
        include: INCLUDE_JUGADOR,
    });
    return estadisticas
        .filter((e) => e.jugador !== null)
        .map((e) => ({
        idJugador: e.jugador.idJugador,
        nombre: e.jugador.nombre,
        apellido1: e.jugador.apellido1,
        apellido2: e.jugador.apellido2,
        rating: e.jugador.rating,
    }))
        .sort((a, b) => b.rating - a.rating);
};
exports.getListaInicialPublica = getListaInicialPublica;
const getRankingFinalPublico = async (idTorneo, idTorneoCategoria) => {
    const torneoCategoria = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneoCat: idTorneoCategoria },
        select: { desempates: true },
    });
    if (!torneoCategoria)
        throw new error_middleware_1.NotFoundError('Categoría de torneo no encontrada');
    const estadisticas = await database_1.default.estadisticaTorneo.findMany({
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
    if (estadisticas.length === 0)
        throw new error_middleware_1.NotFoundError('No se encontró ranking final para esta categoría');
    return {
        ranking: estadisticas.map((e) => ({
            ...e,
            puntos: parseFloat(String(e.puntos)) || 0,
            desempates: parsearDesempates(e.desempates),
        })),
        sistemasDesempate: torneoCategoria.desempates ?? [],
    };
};
exports.getRankingFinalPublico = getRankingFinalPublico;
//# sourceMappingURL=estadisticas-torneo.service.js.map