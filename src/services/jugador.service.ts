import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../middleware/error.middleware';
import {
    CrearJugadorDto,
    ActualizarJugadorDto,
    FiltrosJugadorDto,
    RatingsMasivoDto,
} from '../validations/jugador.validations';
import { normalizarNombreJugador } from '../utils/nombre.utils';
import { jugadorPuedeInscribirse, calcularEdadParaTorneo } from '../utils/fecha.utils';
import { PaginatedResult } from '../types';
import { tokenDeJugador } from '../utils/token-publico';
import { cargarCatalogoRitmos, claseDeRitmoPorNombre, obtenerUmbrales } from './ritmo-rating-config.service';

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
    // "juan perez" busca jugadores donde CADA palabra aparezca en el nombre o en algún apellido
    const palabras = termino.trim().split(/\s+/).filter(Boolean).slice(0, 5);
    return prisma.jugador.findMany({
        where: {
            AND: palabras.map(palabra => ({
                OR: [
                    { nombre: { contains: palabra } },
                    { apellido1: { contains: palabra } },
                    { apellido2: { contains: palabra } },
                ],
            })),
        },
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating_estatal: true,
            rating_nacional_estandar: true, rating_nacional_rapido: true, rating_nacional_blitz: true,
            estado: true,
            categoria: { select: { nombre: true } },
        },
        take: 15,
        orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
    });
};

// ── Búsqueda pública para la consulta de jugadores ─────────────
// Igual que la búsqueda por nombre, pero sin exponer el id numérico: devuelve un token opaco
// que sirve para abrir el perfil (ver utils/token-publico.ts).

export const buscarJugadoresPublico = async (termino: string) => {
    const jugadores = await buscarJugadoresPorNombre(termino);
    return jugadores.map(({ idJugador, ...resto }) => ({ ...resto, token: tokenDeJugador(idJugador) }));
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
            rating_estatal: true,
            rating_nacional_estandar: true, rating_nacional_rapido: true, rating_nacional_blitz: true,
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

/** Usa la fila guardada; si no tiene partidas contadas, toma el conteo real y conserva posición y rating. */
const combinarResultado = <T extends { partidas_jugadas: number }>(
    guardado: T | undefined,
    real: { puntos: number; partidas_jugadas: number; victorias: number; empates: number; derrotas: number } | undefined
) => {
    if (guardado && (guardado.partidas_jugadas > 0 || !real)) return guardado;
    if (!real) return null;
    return { posicion_actual: null, rating_torneo: null, ...(guardado ?? {}), ...real };
};

export const obtenerEstadisticasPublicas = async (idJugador: number) => {
    const jugador = await prisma.jugador.findUnique({
        where: { idJugador },
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating_estatal: true,
            rating_nacional_estandar: true, rating_nacional_rapido: true, rating_nacional_blitz: true,
            estado: true,
            fecha_registro: true,
            categoria: { select: { nombre: true } },
        },
    });
    if (!jugador) throw new NotFoundError('Jugador no encontrado');

    // Consulta pública: no se exponen fecha de nacimiento ni datos de pago (esos solo salen
    // en el comprobante con su código QR).

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
                idCategoria: true,
                fecha_inscripcion: true,
                categoria: { select: { nombre: true } },
                torneo: { select: { idTorneo: true, slug: true, nombre: true, lugar: true, fecha: true, rondas: true, tipo_rating: true } },
            },
        }),
        prisma.jugadorLiga.findMany({
            where: { idJugador },
            orderBy: { liga: { fecha_inicio: 'desc' } },
            select: {
                estado: true,
                puntos: true,
                partidas_jugadas: true,
                victorias: true,
                empates: true,
                derrotas: true,
                posicion_grupo: true,
                fecha_inscripcion: true,
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
                rating_torneo: true,
                puntos: true,
                partidas_jugadas: true,
                victorias: true,
                empates: true,
                derrotas: true,
            },
        })
        : [];
    const resultadoPorTorneo = new Map(resultados.map(r => [r.idTorneo, r]));

    // La tabla de estadísticas solo se llena al guardar clasificaciones; si un torneo no la tiene
    // (o quedó en ceros) se cuentan las partidas reales del jugador, igual que en la vista de resultados.
    const partidasDelJugador = idsTorneo.length
        ? await prisma.partida.findMany({
            where: {
                mesa: {
                    ronda: { idTorneo: { in: idsTorneo } },
                    OR: [{ idJugadorBlanco: idJugador }, { idJugadorNegro: idJugador }],
                },
            },
            select: {
                resultado: true,
                mesa: { select: { idJugadorBlanco: true, ronda: { select: { idTorneo: true } } } },
            },
        })
        : [];
    const conteoPartidas = new Map<number, { puntos: number; partidas_jugadas: number; victorias: number; empates: number; derrotas: number }>();
    for (const p of partidasDelJugador) {
        const idT = p.mesa.ronda.idTorneo;
        const c = conteoPartidas.get(idT) ?? { puntos: 0, partidas_jugadas: 0, victorias: 0, empates: 0, derrotas: 0 };
        const conBlancas = p.mesa.idJugadorBlanco === idJugador;
        if (p.resultado === '0.5-0.5') {
            c.empates++; c.puntos += 0.5; c.partidas_jugadas++;
        } else if (p.resultado === '1-0' || p.resultado === '0-1') {
            const gano = (p.resultado === '1-0') === conBlancas;
            if (gano) { c.victorias++; c.puntos += 1; } else { c.derrotas++; }
            c.partidas_jugadas++;
        }
        conteoPartidas.set(idT, c);
    }

    // Rondas y ritmo de juego de la categoría en la que jugó cada torneo
    const pares = historial
        .filter(h => h.idCategoria != null)
        .map(h => ({ idTorneo: h.idTorneo, idCategoria: h.idCategoria as number }));
    const [categoriasTorneo, catalogoRitmos, umbrales] = pares.length
        ? await Promise.all([
            prisma.torneoCategoria.findMany({
                where: { OR: pares },
                select: { idTorneo: true, idCategoria: true, rondas: true, ritmo_juego: true },
            }),
            cargarCatalogoRitmos(),
            obtenerUmbrales(),
        ])
        : [[], new Map(), undefined as never];
    const categoriaTorneoPor = new Map(categoriasTorneo.map(c => [`${c.idTorneo}-${c.idCategoria}`, c]));

    const historialConResultado = historial.map(({ idTorneo, idCategoria, ...resto }) => {
        const ct = idCategoria != null ? categoriaTorneoPor.get(`${idTorneo}-${idCategoria}`) : undefined;
        return {
            ...resto,
            idCategoria,
            resultado: combinarResultado(resultadoPorTorneo.get(idTorneo), conteoPartidas.get(idTorneo)),
            categoria_torneo: ct
                ? {
                    rondas: ct.rondas,
                    ritmo_juego: ct.ritmo_juego ?? null,
                    clase_ritmo: claseDeRitmoPorNombre(ct.ritmo_juego, catalogoRitmos, umbrales),
                }
                : null,
        };
    });

    // Resumen de carrera: solo cuenta torneos donde ya se jugó al menos una partida
    const torneosJugados = historialConResultado.filter(h => (h.resultado?.partidas_jugadas ?? 0) > 0);
    const ligasJugadas = ligas.filter(l => (l.partidas_jugadas ?? 0) > 0);
    const suma = (campo: 'partidas_jugadas' | 'victorias' | 'empates' | 'derrotas') =>
        torneosJugados.reduce((t, h) => t + (h.resultado?.[campo] ?? 0), 0) +
        ligasJugadas.reduce((t, l) => t + (l[campo] ?? 0), 0);
    const partidas = suma('partidas_jugadas');
    const victorias = suma('victorias');
    const posiciones = torneosJugados
        .map(h => h.resultado?.posicion_actual ?? 0)
        .filter(pos => pos > 0);

    const resumen = {
        torneosJugados: torneosJugados.length,
        ligasJugadas: ligasJugadas.length,
        partidas,
        victorias,
        empates: suma('empates'),
        derrotas: suma('derrotas'),
        porcentajeVictorias: partidas > 0 ? Math.round((victorias / partidas) * 100) : 0,
        mejorPosicion: posiciones.length ? Math.min(...posiciones) : null,
        podios: posiciones.filter(pos => pos <= 3).length,
    };

    // Rating con el que jugó cada torneo, separado por tipo de rating (y ritmo en el nacional)
    const evolucionRating = historialConResultado
        .filter(h => (h.resultado?.rating_torneo ?? 0) > 0 && h.torneo.tipo_rating !== 'sin_rating')
        .map(h => {
            const clase = h.categoria_torneo?.clase_ritmo ?? null;
            const serie = h.torneo.tipo_rating === 'nacional'
                ? (clase ? `nacional_${clase}` : 'nacional')
                : 'estatal';
            return {
                serie,
                fecha: h.torneo.fecha,
                torneo: h.torneo.nombre,
                rating: h.resultado!.rating_torneo as number,
            };
        })
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    const { idJugador: _id, ...jugadorPublico } = jugador;

    return {
        jugador: { ...jugadorPublico, token: tokenDeJugador(idJugador) },
        ultimoTorneo: historialConResultado[0] ?? null,
        historial: historialConResultado,
        ligas,
        resumen,
        evolucionRating,
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
            rating_estatal: datos.rating_estatal ?? 0,
            rating_nacional_estandar: datos.rating_nacional_estandar ?? 0,
            rating_nacional_rapido: datos.rating_nacional_rapido ?? 0,
            rating_nacional_blitz: datos.rating_nacional_blitz ?? 0,
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

    const actualizado = await prisma.jugador.update({
        where: { idJugador },
        data: {
            ...nombresNormalizados,
            // normalizarNombreJugador omite apellido2 cuando es null/vacío
            // (para no pisar un valor existente en altas parciales) — pero eso
            // significa que nunca se puede LIMPIAR el campo ya guardado. Si
            // el frontend manda null explícito, sí es intención de borrarlo.
            ...(datos.apellido2 === null && { apellido2: null }),
            ...(datos.telefono !== undefined && { telefono: datos.telefono }),
            ...(datos.fecha_nacimiento !== undefined && {
                // new Date(null) da 1970-01-01 en vez de limpiar el campo.
                fecha_nacimiento: datos.fecha_nacimiento === null ? null : new Date(datos.fecha_nacimiento),
            }),
            ...(datos.idCategoria !== undefined && { idCategoria: datos.idCategoria }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
            ...(datos.rating_estatal !== undefined && { rating_estatal: datos.rating_estatal }),
            ...(datos.rating_nacional_estandar !== undefined && { rating_nacional_estandar: datos.rating_nacional_estandar }),
            ...(datos.rating_nacional_rapido !== undefined && { rating_nacional_rapido: datos.rating_nacional_rapido }),
            ...(datos.rating_nacional_blitz !== undefined && { rating_nacional_blitz: datos.rating_nacional_blitz }),
            ...(datos.estado !== undefined && {
                estado: datos.estado as 'pendiente_pago' | 'activo' | 'inactivo',
            }),
            actualizacion: new Date(),
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });

    // La edad de cada inscripción es una copia guardada al inscribirse: si se corrige la fecha de nacimiento
    // hay que recalcularla, si no las listas siguen mostrando la edad del dato equivocado.
    if (datos.fecha_nacimiento !== undefined && actualizado.fecha_nacimiento) {
        await recalcularEdadesDeInscripciones(idJugador, actualizado.fecha_nacimiento);
    }

    return actualizado;
};

/** Recalcula `edad` en todas las inscripciones del jugador con su fecha de nacimiento actual (fecha del torneo + tipo de validación de la categoría). */
export const recalcularEdadesDeInscripciones = async (idJugador: number, fechaNacimiento: Date) => {
    const inscripciones = await prisma.inscripcion.findMany({
        where: { idJugador },
        select: {
            idInscripcion: true,
            torneo: { select: { fecha: true } },
            categoria: { select: { tipo_validacion_edad: true } },
        },
    });
    await Promise.all(inscripciones.map((i) =>
        prisma.inscripcion.update({
            where: { idInscripcion: i.idInscripcion },
            data: { edad: calcularEdadParaTorneo(fechaNacimiento, i.torneo.fecha, i.categoria?.tipo_validacion_edad ?? 'anio_torneo') },
        })
    ));
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
            select: { edadMinima: true, edadMaxima: true, anioNacimientoDesde: true, anioNacimientoHasta: true, tipo_validacion_edad: true },
        });

        if (categoria) {
            const resultado = jugadorPuedeInscribirse(
                jugador.fecha_nacimiento,
                torneo.fecha,
                categoria.edadMinima,
                categoria.edadMaxima,
                categoria.tipo_validacion_edad,
                { desde: categoria.anioNacimientoDesde, hasta: categoria.anioNacimientoHasta }
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
// ── Actualización masiva de ratings ──────────────────────────

/** Todos los jugadores (sin paginar) con sus ratings: base de la carga masiva del Excel de ratings. */
export const listarJugadoresParaRatings = async () => {
    return prisma.jugador.findMany({
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating_estatal: true,
            rating_nacional_estandar: true,
            rating_nacional_rapido: true,
            rating_nacional_blitz: true,
        },
        orderBy: [{ apellido1: 'asc' }, { apellido2: 'asc' }, { nombre: 'asc' }],
    });
};

/** Escribe un mismo campo de rating en muchos jugadores, por lotes y dentro de transacciones. */
export const actualizarRatingsMasivo = async (datos: RatingsMasivoDto) => {
    const { campo, cambios } = datos;
    const ahora = new Date();
    const TAM_LOTE = 200;
    let actualizados = 0;

    for (let i = 0; i < cambios.length; i += TAM_LOTE) {
        const lote = cambios.slice(i, i + TAM_LOTE);
        const resultados = await prisma.$transaction(
            lote.map(c =>
                prisma.jugador.updateMany({
                    where: { idJugador: c.idJugador },
                    data: { [campo]: c.rating, actualizacion: ahora },
                })
            )
        );
        actualizados += resultados.reduce((suma, r) => suma + r.count, 0);
    }

    return { solicitados: cambios.length, actualizados };
};
