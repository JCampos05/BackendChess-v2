import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../middleware/error.middleware';
import {
    CrearJugadorDto,
    ActualizarJugadorDto,
    FiltrosJugadorDto,
} from '../validations/jugador.validations';
import { normalizarNombreJugador } from '../utils/nombre.utils';
import { jugadorPuedeInscribirse } from '../utils/fecha.utils';
import { PaginatedResult } from '../types';

// ── Listado ──────────────────────────────────────────────────

export const listarJugadores = async (
    filtros: FiltrosJugadorDto
): Promise<PaginatedResult<unknown>> => {
    const { nombre, estado, idCategoria, pagina, limite } = filtros;
    const skip = (pagina - 1) * limite;

    const where: Prisma.JugadorWhereInput = {
        ...(estado && { estado }),
        ...(idCategoria && { idCategoria }),
        ...(nombre && {
            OR: [
                { nombre: { contains: nombre } },
                { apellido1: { contains: nombre } },
                { apellido2: { contains: nombre } },
            ],
        }),
    };

    const [total, items] = await Promise.all([
        prisma.jugador.count({ where }),
        prisma.jugador.findMany({
            where,
            skip,
            take: limite,
            orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
            include: {
                categoria: { select: { idCategoria: true, nombre: true } },
            },
        }),
    ]);

    return { items, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

// ── Búsqueda rápida por nombre ───────────────────────────────

export const buscarJugadoresPorNombre = async (termino: string) => {
    return prisma.jugador.findMany({
        where: {
            OR: [
                { nombre: { contains: termino } },
                { apellido1: { contains: termino } },
                { apellido2: { contains: termino } },
            ],
        },
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating: true,
            estado: true,
            categoria: { select: { nombre: true } },
        },
        take: 15,
        orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
    });
};

// ── Búsqueda pública por campos separados (nombre/apellido1/apellido2) ──
// Usada por la vista pública de estadísticas de jugador — a diferencia de
// buscarJugadoresPorNombre (un solo término contra los 3 campos con OR),
// aquí cada campo se filtra por separado con AND, como corresponde a un
// formulario con 3 campos de búsqueda independientes.

export const buscarJugadoresPorCampos = async (filtros: {
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
}) => {
    const { nombre, apellido1, apellido2 } = filtros;

    return prisma.jugador.findMany({
        where: {
            ...(nombre    && { nombre:    { contains: nombre } }),
            ...(apellido1 && { apellido1: { contains: apellido1 } }),
            ...(apellido2 && { apellido2: { contains: apellido2 } }),
        },
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating: true,
            estado: true,
            categoria: { select: { nombre: true } },
        },
        take: 20,
        orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
    });
};

// ── Estadísticas públicas (torneos + ligas) ───────────────────
// Usada por la vista pública /players-stats — el frontend (jugador.ts::
// getPublicStats) ya esperaba este endpoint con esta forma exacta desde
// antes; nunca se había implementado en el backend.

export const obtenerEstadisticasPublicas = async (idJugador: number) => {
    const jugador = await prisma.jugador.findUnique({
        where: { idJugador },
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating: true,
            estado: true,
            fecha_nacimiento: true,
            fecha_registro: true,
            categoria: { select: { nombre: true } },
        },
    });
    if (!jugador) throw new NotFoundError('Jugador no encontrado');

    const [historial, ligas] = await Promise.all([
        prisma.inscripcion.findMany({
            where: { idJugador },
            // Por fecha de inscripción (no fecha del torneo): así una
            // inscripción recién hecha a un torneo futuro aparece de
            // inmediato como "Último Torneo" con su pago pendiente
            // reflejado, en vez de quedar oculta detrás de un torneo
            // pasado con fecha más próxima a hoy.
            orderBy: { fecha_inscripcion: 'desc' },
            select: {
                idTorneo: true,
                pago_confirmado: true,
                fecha_inscripcion: true,
                fecha_actualizacion: true,
                categoria: { select: { nombre: true } },
                torneo: { select: { nombre: true, lugar: true, fecha: true, rondas: true } },
            },
        }),
        prisma.jugadorLiga.findMany({
            where: { idJugador },
            orderBy: { liga: { fecha_inicio: 'desc' } },
            select: {
                estado: true,
                pago_confirmado: true,
                puntos: true,
                partidas_jugadas: true,
                victorias: true,
                empates: true,
                derrotas: true,
                posicion_grupo: true,
                fecha_inscripcion: true,
                fecha_actualizacion: true,
                liga: {
                    select: { nombre: true, descripcion: true, lugar: true, fecha_inicio: true, fecha_fin: true },
                },
                grupo: { select: { nombre: true } },
            },
        }),
    ]);

    // Desempeño final por torneo (posición, puntos, W/D/L) — una fila por
    // jugador+torneo en EstadisticaTorneo, ya actualizada por el motor de
    // emparejamiento tras cada ronda; con posicion_actual no nula representa
    // la clasificación final una vez que el torneo terminó.
    const idsTorneo = [...new Set(historial.map(h => h.idTorneo))];
    const resultados = idsTorneo.length
        ? await prisma.estadisticaTorneo.findMany({
            where: { idJugador, idTorneo: { in: idsTorneo } },
            select: {
                idTorneo: true,
                posicion_actual: true,
                puntos: true,
                partidas_jugadas: true,
                victorias: true,
                empates: true,
                derrotas: true,
            },
        })
        : [];
    const resultadoPorTorneo = new Map(resultados.map(r => [r.idTorneo, r]));

    const historialConResultado = historial.map(({ idTorneo, ...resto }) => ({
        ...resto,
        resultado: resultadoPorTorneo.get(idTorneo) ?? null,
    }));

    return {
        jugador,
        ultimoTorneo: historialConResultado[0] ?? null,
        historial: historialConResultado,
        ligas,
        estadisticas: { totalTorneos: historial.length },
    };
};

// ── Detalle ──────────────────────────────────────────────────

export const obtenerJugadorPorId = async (idJugador: number) => {
    const jugador = await prisma.jugador.findUnique({
        where: { idJugador },
        include: {
            categoria: { select: { idCategoria: true, nombre: true, costo: true } },
            inscripciones: {
                orderBy: { fecha_inscripcion: 'desc' },
                take: 10,
                include: {
                    torneo: { select: { idTorneo: true, nombre: true, fecha: true } },
                    categoria: { select: { idCategoria: true, nombre: true } },
                },
            },
        },
    });
    if (!jugador) throw new NotFoundError('Jugador no encontrado');
    return jugador;
};

// ── Crear ────────────────────────────────────────────────────

export const crearJugador = async (datos: CrearJugadorDto) => {
    const nombresNormalizados = normalizarNombreJugador({
        nombre: datos.nombre,
        apellido1: datos.apellido1,
        apellido2: datos.apellido2,
    });

    const fechaNac = datos.fecha_nacimiento
        ? new Date(datos.fecha_nacimiento)
        : undefined;

    // Verificar duplicado antes del constraint de BD
    const duplicado = await prisma.jugador.findFirst({
        where: {
            nombre: nombresNormalizados.nombre,
            apellido1: nombresNormalizados.apellido1,
            apellido2: nombresNormalizados.apellido2 ?? null,
            fecha_nacimiento: fechaNac ?? null,
        },
        select: { idJugador: true },
    });

    if (duplicado) {
        throw new ConflictError(
            `Ya existe un jugador con ese nombre${fechaNac ? ' y fecha de nacimiento' : ''} (id: ${duplicado.idJugador})`
        );
    }

    return prisma.jugador.create({
        data: {
            ...nombresNormalizados,
            telefono: datos.telefono,
            fecha_nacimiento: fechaNac,
            idCategoria: datos.idCategoria,
            notas: datos.notas,
            rating: datos.rating ?? 0,
            estado: 'pendiente_pago',
            pago_confirmado: false,
            fecha_registro: new Date(),
            actualizacion: new Date(),
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });
};

// ── Actualizar ───────────────────────────────────────────────

export const actualizarJugador = async (
    idJugador: number,
    datos: ActualizarJugadorDto
) => {
    await _verificarExiste(idJugador);

    const nombresNormalizados =
        datos.nombre || datos.apellido1
            ? normalizarNombreJugador({
                nombre: datos.nombre ?? '',
                apellido1: datos.apellido1 ?? '',
                apellido2: datos.apellido2,
            })
            : {};

    return prisma.jugador.update({
        where: { idJugador },
        data: {
            ...nombresNormalizados,
            ...(datos.telefono !== undefined && { telefono: datos.telefono }),
            ...(datos.fecha_nacimiento !== undefined && {
                fecha_nacimiento: new Date(datos.fecha_nacimiento!),
            }),
            ...(datos.idCategoria !== undefined && { idCategoria: datos.idCategoria }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
            ...(datos.rating !== undefined && { rating: datos.rating }),
            ...(datos.estado !== undefined && {
                estado: datos.estado as 'pendiente_pago' | 'activo' | 'inactivo',
            }),
            actualizacion: new Date(),
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });
};

// ── Cambiar estado ───────────────────────────────────────────

export const cambiarEstadoJugador = async (
    idJugador: number,
    estado: 'pendiente_pago' | 'activo' | 'inactivo'
) => {
    await _verificarExiste(idJugador);
    return prisma.jugador.update({
        where: { idJugador },
        data: { estado, actualizacion: new Date() },
        select: { idJugador: true, nombre: true, apellido1: true, estado: true },
    });
};

// ── Confirmar pago (activa al jugador) ───────────────────────

export const confirmarPagoJugador = async (idJugador: number) => {
    await _verificarExiste(idJugador);
    return prisma.jugador.update({
        where: { idJugador },
        data: { pago_confirmado: true, estado: 'activo', actualizacion: new Date() },
        select: { idJugador: true, nombre: true, apellido1: true, estado: true, pago_confirmado: true },
    });
};

// ── Verificar elegibilidad ───────────────────────────────────

export const verificarElegibilidad = async (
    idJugador: number,
    idTorneo: number,
    idCategoria?: number
) => {
    const [jugador, torneo] = await Promise.all([
        prisma.jugador.findUnique({
            where: { idJugador },
            select: { idJugador: true, nombre: true, apellido1: true, estado: true, fecha_nacimiento: true },
        }),
        prisma.torneo.findUnique({
            where: { idTorneo },
            select: { idTorneo: true, fecha: true },
        }),
    ]);

    if (!jugador) throw new NotFoundError('Jugador no encontrado');
    if (!torneo) throw new NotFoundError('Torneo no encontrado');

    if (jugador.estado === 'inactivo') {
        return { elegible: false, motivo: 'El jugador está inactivo' };
    }

    if (idCategoria && jugador.fecha_nacimiento) {
        const categoria = await prisma.categoria.findUnique({
            where: { idCategoria },
            select: { edadMinima: true, edadMaxima: true, tipo_validacion_edad: true },
        });

        if (categoria) {
            const resultado = jugadorPuedeInscribirse(
                jugador.fecha_nacimiento,
                torneo.fecha,
                categoria.edadMinima,
                categoria.edadMaxima,
                categoria.tipo_validacion_edad
            );
            if (!resultado.puede) {
                return { elegible: false, motivo: resultado.motivo, edad: resultado.edad };
            }
            return { elegible: true, edad: resultado.edad };
        }
    }

    return { elegible: true };
};

// ── Helper privado ───────────────────────────────────────────

const _verificarExiste = async (idJugador: number) => {
    const jugador = await prisma.jugador.findUnique({
        where: { idJugador },
        select: { idJugador: true, estado: true },
    });
    if (!jugador) throw new NotFoundError('Jugador no encontrado');
    return jugador;
};