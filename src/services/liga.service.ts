import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../middleware/error.middleware';
import { PaginatedResult } from '../types';
import {
    CrearLigaDto,
    ActualizarLigaDto,
    FiltrosLigaDto,
    CrearGrupoDto,
    ActualizarGrupoDto,
    InscribirJugadorLigaDto,
    ConfirmarPagoLigaDto,
    CrearRondaLigaDto,
    CambiarEstadoRondaLigaDto,
    RegistrarPartidaLigaDto,
} from '../validations/liga.validations';

// ── Includes reutilizables ───────────────────────────────────

const INCLUDE_LIGA_BASE = {
    ritmo_juego: { select: { idRitmoJuego: true, nombre: true, minutos: true, incremento: true } },
    grupos: {
        where:  { activo: true },
        select: {
            idGrupoLiga:   true,
            nombre:        true,
            max_jugadores: true,
            rondas:        true,
            activo:        true,
        },
    },
} satisfies Prisma.InfoLigaInclude;

// ============================================================
// LIGA
// ============================================================

export const listarLigas = async (filtros: FiltrosLigaDto): Promise<PaginatedResult<unknown>> => {
    const { pagina, limite, activo } = filtros;
    const skip = (pagina - 1) * limite;

    const where: Prisma.InfoLigaWhereInput = {
        ...(activo !== undefined && { activo }),
    };

    const [total, items] = await Promise.all([
        prisma.infoLiga.count({ where }),
        prisma.infoLiga.findMany({
            where,
            skip,
            take:    limite,
            orderBy: { fecha_inicio: 'desc' },
            include: INCLUDE_LIGA_BASE,
        }),
    ]);

    return { items, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

export const obtenerLigaPorId = async (idLiga: number) => {
    const liga = await prisma.infoLiga.findUnique({
        where:   { idLiga },
        include: {
            ...INCLUDE_LIGA_BASE,
            grupos: {
                where:   { activo: true },
                include: {
                    jugadores_liga: {
                        where:  { estado: { not: 'cancelado' } },
                        select: {
                            idJugadorLiga: true,
                            puntos:        true,
                            posicion_grupo: true,
                            estado:        true,
                            jugador: {
                                select: { idJugador: true, nombre: true, apellido1: true, rating: true },
                            },
                        },
                        orderBy: [{ puntos: 'desc' }, { posicion_grupo: 'asc' }],
                    },
                },
            },
        },
    });
    if (!liga) throw new NotFoundError('Liga no encontrada');
    return liga;
};

export const crearLiga = async (datos: CrearLigaDto) => {
    return prisma.infoLiga.create({
        data: {
            nombre:               datos.nombre,
            descripcion:          datos.descripcion,
            fecha_inicio:         new Date(`${datos.fecha_inicio}T00:00:00`),
            fecha_fin:            datos.fecha_fin ? new Date(`${datos.fecha_fin}T00:00:00`) : undefined,
            lugar:                datos.lugar,
            direccion:            datos.direccion,
            tipo_sistema:         datos.tipo_sistema,
            num_grupos:           datos.num_grupos,
            clasifican_por_grupo: datos.clasifican_por_grupo,
            idRitmoJuego:         datos.idRitmoJuego,
            costo_inscripcion:    datos.costo_inscripcion,
            cierre_inscripciones: datos.cierre_inscripciones
                ? new Date(datos.cierre_inscripciones)
                : undefined,
            max_jugadores:        datos.max_jugadores,
            notas:                datos.notas,
            activo:               true,
        },
        include: INCLUDE_LIGA_BASE,
    });
};

export const actualizarLiga = async (idLiga: number, datos: ActualizarLigaDto) => {
    await _verificarLiga(idLiga);

    return prisma.infoLiga.update({
        where: { idLiga },
        data:  {
            ...(datos.nombre               !== undefined && { nombre:               datos.nombre }),
            ...(datos.descripcion          !== undefined && { descripcion:          datos.descripcion }),
            ...(datos.fecha_inicio         !== undefined && { fecha_inicio: new Date(`${datos.fecha_inicio}T00:00:00`) }),
            ...(datos.fecha_fin            !== undefined && { fecha_fin:    new Date(`${datos.fecha_fin}T00:00:00`) }),
            ...(datos.lugar                !== undefined && { lugar:                datos.lugar }),
            ...(datos.direccion            !== undefined && { direccion:            datos.direccion }),
            ...(datos.tipo_sistema         !== undefined && { tipo_sistema:         datos.tipo_sistema }),
            ...(datos.num_grupos           !== undefined && { num_grupos:           datos.num_grupos }),
            ...(datos.clasifican_por_grupo !== undefined && { clasifican_por_grupo: datos.clasifican_por_grupo }),
            ...(datos.idRitmoJuego         !== undefined && { idRitmoJuego:         datos.idRitmoJuego }),
            ...(datos.costo_inscripcion    !== undefined && { costo_inscripcion:    datos.costo_inscripcion }),
            ...(datos.cierre_inscripciones !== undefined && { cierre_inscripciones: new Date(datos.cierre_inscripciones!) }),
            ...(datos.max_jugadores        !== undefined && { max_jugadores:        datos.max_jugadores }),
            ...(datos.notas                !== undefined && { notas:                datos.notas }),
        },
        include: INCLUDE_LIGA_BASE,
    });
};

export const toggleActivoLiga = async (idLiga: number, activo: boolean) => {
    await _verificarLiga(idLiga);
    return prisma.infoLiga.update({
        where:  { idLiga },
        data:   { activo },
        select: { idLiga: true, nombre: true, activo: true },
    });
};

// ============================================================
// GRUPOS
// ============================================================

export const listarGrupos = async (idLiga: number) => {
    await _verificarLiga(idLiga);
    return prisma.grupoLiga.findMany({
        where:   { idLiga, activo: true },
        orderBy: { nombre: 'asc' },
        include: {
            _count: {
                select: { jugadores_liga: { where: { estado: { not: 'cancelado' } } } },
            },
        },
    });
};

export const crearGrupo = async (idLiga: number, datos: CrearGrupoDto) => {
    await _verificarLiga(idLiga);

    const existe = await prisma.grupoLiga.findFirst({
        where: { idLiga, nombre: datos.nombre, activo: true },
    });
    if (existe) throw new ConflictError(`Ya existe un grupo llamado "${datos.nombre}" en esta liga`);

    return prisma.grupoLiga.create({
        data: {
            idLiga,
            nombre:        datos.nombre,
            descripcion:   datos.descripcion,
            max_jugadores: datos.max_jugadores,
            rondas:        datos.rondas,
            premios:       (datos.premios    ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            desempates:    (datos.desempates ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            activo:        true,
        },
    });
};

export const actualizarGrupo = async (
    idLiga: number,
    idGrupoLiga: number,
    datos: ActualizarGrupoDto
) => {
    await _verificarGrupo(idLiga, idGrupoLiga);

    return prisma.grupoLiga.update({
        where: { idGrupoLiga },
        data:  {
            ...(datos.nombre        !== undefined && { nombre:        datos.nombre }),
            ...(datos.descripcion   !== undefined && { descripcion:   datos.descripcion }),
            ...(datos.max_jugadores !== undefined && { max_jugadores: datos.max_jugadores }),
            ...(datos.rondas        !== undefined && { rondas:        datos.rondas }),
            ...(datos.premios       !== undefined && { premios:    datos.premios    as Prisma.InputJsonValue }),
            ...(datos.desempates    !== undefined && { desempates: datos.desempates as Prisma.InputJsonValue }),
        },
    });
};

// ============================================================
// JUGADORES DE LIGA
// ============================================================

export const listarJugadoresLiga = async (idLiga: number, idGrupoLiga?: number) => {
    return prisma.jugadorLiga.findMany({
        where: {
            idLiga,
            ...(idGrupoLiga && { idGrupoLiga }),
            estado: { not: 'cancelado' },
        },
        orderBy: [{ puntos: 'desc' }, { posicion_grupo: 'asc' }],
        include: {
            jugador: {
                select: {
                    idJugador:  true,
                    nombre:     true,
                    apellido1:  true,
                    apellido2:  true,
                    rating:     true,
                    telefono:   true,
                },
            },
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};

export const inscribirJugadorLiga = async (
    idLiga: number,
    datos: InscribirJugadorLigaDto
) => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Verificar liga activa
        const liga = await tx.infoLiga.findUnique({ where: { idLiga } });
        if (!liga)         throw new NotFoundError('Liga no encontrada');
        if (!liga.activo)  throw new ForbiddenError('La liga no está activa');

        // 2. Verificar cierre de inscripciones
        if (liga.cierre_inscripciones && new Date() > liga.cierre_inscripciones)
            throw new ForbiddenError('Las inscripciones para esta liga están cerradas');

        // 3. Verificar que el grupo pertenece a la liga
        const grupo = await tx.grupoLiga.findFirst({
            where: { idGrupoLiga: datos.idGrupoLiga, idLiga, activo: true },
        });
        if (!grupo) throw new NotFoundError('Grupo no encontrado en esta liga');

        // 4. Verificar cupo del grupo
        if (grupo.max_jugadores) {
            const inscritosGrupo = await tx.jugadorLiga.count({
                where: { idGrupoLiga: datos.idGrupoLiga, estado: { not: 'cancelado' } },
            });
            if (inscritosGrupo >= grupo.max_jugadores)
                throw new ForbiddenError(`El grupo "${grupo.nombre}" está lleno`);
        }

        // 5. Verificar que el jugador existe
        const jugador = await tx.jugador.findUnique({
            where: { idJugador: datos.idJugador },
        });
        if (!jugador) throw new NotFoundError('Jugador no encontrado');

        // 6. Verificar que no esté ya inscrito en esta liga
        const yaInscrito = await tx.jugadorLiga.findUnique({
            where: { idLiga_idJugador: { idLiga, idJugador: datos.idJugador } },
        });
        if (yaInscrito && yaInscrito.estado !== 'cancelado')
            throw new ConflictError('El jugador ya está inscrito en esta liga');

        // 7. Crear inscripción
        return tx.jugadorLiga.create({
            data: {
                idLiga,
                idGrupoLiga:    datos.idGrupoLiga,
                idJugador:      datos.idJugador,
                rating_inicial: jugador.rating,
                monto_pagado:   datos.monto_pagado,
                pago_confirmado: datos.pago_confirmado,
                estado:         datos.pago_confirmado ? 'confirmado' : 'inscrito',
                notas:          datos.notas,
            },
            include: {
                jugador: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
                grupo:   { select: { idGrupoLiga: true, nombre: true } },
            },
        });
    });
};

export const confirmarPagoLiga = async (
    idJugadorLiga: number,
    datos: ConfirmarPagoLigaDto
) => {
    const inscripcion = await prisma.jugadorLiga.findUnique({
        where: { idJugadorLiga },
    });
    if (!inscripcion) throw new NotFoundError('Inscripción no encontrada');
    if (inscripcion.estado === 'cancelado')
        throw new ForbiddenError('No se puede confirmar una inscripción cancelada');

    return prisma.jugadorLiga.update({
        where: { idJugadorLiga },
        data:  {
            pago_confirmado: true,
            monto_pagado:    datos.monto_pagado,
            estado:          'confirmado',
            ...(datos.notas && { notas: datos.notas }),
        },
        include: {
            jugador: { select: { idJugador: true, nombre: true, apellido1: true } },
        },
    });
};

export const cancelarInscripcionLiga = async (idJugadorLiga: number) => {
    const inscripcion = await prisma.jugadorLiga.findUnique({
        where: { idJugadorLiga },
    });
    if (!inscripcion) throw new NotFoundError('Inscripción no encontrada');
    if (inscripcion.estado === 'cancelado')
        throw new ConflictError('La inscripción ya está cancelada');

    return prisma.jugadorLiga.update({
        where: { idJugadorLiga },
        data:  { estado: 'cancelado' },
        select: { idJugadorLiga: true, estado: true, idJugador: true, idLiga: true },
    });
};

// ============================================================
// RONDAS DE LIGA
// ============================================================

export const listarRondasLiga = async (idLiga: number, idGrupoLiga?: number) => {
    return prisma.rondaLiga.findMany({
        where: { idLiga, ...(idGrupoLiga && { idGrupoLiga }) },
        orderBy: [{ idGrupoLiga: 'asc' }, { numeroRonda: 'asc' }],
        include: {
            grupo: { select: { idGrupoLiga: true, nombre: true } },
            _count: { select: { mesas_liga: true } },
        },
    });
};

export const crearRondaLiga = async (idLiga: number, datos: CrearRondaLigaDto) => {
    await _verificarGrupo(idLiga, datos.idGrupoLiga);

    // Verificar que no exista ya esa ronda en ese grupo
    const existe = await prisma.rondaLiga.findUnique({
        where: {
            idLiga_idGrupoLiga_numeroRonda: {
                idLiga,
                idGrupoLiga: datos.idGrupoLiga,
                numeroRonda: datos.numeroRonda,
            },
        },
    });
    if (existe) throw new ConflictError(`La ronda ${datos.numeroRonda} ya existe en este grupo`);

    return prisma.rondaLiga.create({
        data: {
            idLiga,
            idGrupoLiga:      datos.idGrupoLiga,
            numeroRonda:      datos.numeroRonda,
            fecha_programada: datos.fecha_programada
                ? new Date(`${datos.fecha_programada}T00:00:00`)
                : undefined,
            hora_inicio: datos.hora_inicio
                ? new Date(`1970-01-01T${datos.hora_inicio}:00`)
                : undefined,
            notas:  datos.notas,
            estado: 'planificada',
        },
        include: {
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};

export const cambiarEstadoRondaLiga = async (
    idRondaLiga: number,
    datos: CambiarEstadoRondaLigaDto
) => {
    const ronda = await prisma.rondaLiga.findUnique({ where: { idRondaLiga } });
    if (!ronda) throw new NotFoundError('Ronda no encontrada');

    return prisma.rondaLiga.update({
        where: { idRondaLiga },
        data:  {
            estado: datos.estado,
            ...(datos.estado === 'en_curso'   && { fecha_inicio: new Date() }),
            ...(datos.estado === 'finalizada' && { fecha_fin:    new Date() }),
            ...(datos.notas && { notas: datos.notas }),
        },
        include: {
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};

// ============================================================
// MESAS DE LIGA
// ============================================================

export const listarMesasLiga = async (idRondaLiga: number) => {
    return prisma.mesaLiga.findMany({
        where:   { idRondaLiga },
        orderBy: { numeroMesa: 'asc' },
        include: {
            jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            jugador_negro:  { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            partida_liga:   true,
        },
    });
};

// Genera las mesas de una ronda usando emparejamiento secuencial
// Para Round Robin y sistema suizo básico
export const generarMesasLiga = async (idLiga: number, idRondaLiga: number) => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const ronda = await tx.rondaLiga.findUnique({
            where: { idRondaLiga },
            include: { grupo: true },
        });
        if (!ronda) throw new NotFoundError('Ronda no encontrada');
        if (ronda.estado !== 'planificada')
            throw new ForbiddenError('Solo se pueden generar mesas en rondas planificadas');

        // Verificar que no haya mesas ya generadas
        const mesasExistentes = await tx.mesaLiga.count({ where: { idRondaLiga } });
        if (mesasExistentes > 0)
            throw new ConflictError('Esta ronda ya tiene mesas generadas');

        // Obtener jugadores del grupo ordenados por posición/rating
        const jugadores = await tx.jugadorLiga.findMany({
            where: {
                idGrupoLiga: ronda.idGrupoLiga,
                idLiga,
                estado: 'confirmado',
            },
            orderBy: [
                { posicion: 'asc' },
                { jugador: { rating: 'desc' } },
            ],
            select: { idJugador: true },
        });

        if (jugadores.length < 2)
            throw new ForbiddenError('Se necesitan al menos 2 jugadores confirmados para generar mesas');

        // Emparejar: jugador 1 vs último, jugador 2 vs penúltimo, etc.
        const mesas: { numeroMesa: number; idJugadorBlanco: number; idJugadorNegro: number }[] = [];
        const n      = jugadores.length;
        const mitad  = Math.floor(n / 2);

        for (let i = 0; i < mitad; i++) {
            mesas.push({
                numeroMesa:      i + 1,
                idJugadorBlanco: jugadores[i].idJugador,
                idJugadorNegro:  jugadores[n - 1 - i].idJugador,
            });
        }

        // Registrar historial de emparejamientos
        await tx.historialEmparejamientoLiga.createMany({
            data: mesas.map(m => ({
                idJugador1:  m.idJugadorBlanco,
                idJugador2:  m.idJugadorNegro,
                idLiga,
                idGrupoLiga: ronda.idGrupoLiga,
                numeroRonda: ronda.numeroRonda,
            })),
            skipDuplicates: true,
        });

        // Crear mesas en batch
        await tx.mesaLiga.createMany({
            data: mesas.map(m => ({
                idRondaLiga,
                numeroMesa:      m.numeroMesa,
                idJugadorBlanco: m.idJugadorBlanco,
                idJugadorNegro:  m.idJugadorNegro,
                estado:          'pendiente' as const,
                fecha_creacion:  new Date(),
            })),
        });

        return tx.mesaLiga.findMany({
            where:   { idRondaLiga },
            orderBy: { numeroMesa: 'asc' },
            include: {
                jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
                jugador_negro:  { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            },
        });
    });
};

// ============================================================
// PARTIDAS DE LIGA
// ============================================================

export const registrarPartidaLiga = async (
    idMesaLiga: number,
    datos: RegistrarPartidaLigaDto
) => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const mesa = await tx.mesaLiga.findUnique({
            where:   { idMesaLiga },
            include: { ronda_liga: { select: { idLiga: true, idGrupoLiga: true, estado: true } } },
        });
        if (!mesa) throw new NotFoundError('Mesa no encontrada');
        if (mesa.estado === 'finalizada')
            throw new ConflictError('Esta mesa ya tiene una partida registrada');

        const yaExiste = await tx.partidaLiga.findUnique({ where: { idMesaLiga } });
        if (yaExiste) throw new ConflictError('Esta mesa ya tiene una partida registrada');

        // Crear partida
        const partida = await tx.partidaLiga.create({
            data: {
                idMesaLiga,
                idJugadorGanador:         datos.idJugadorGanador ?? undefined,
                resultado:                datos.resultado,
                tipo_finalizacion:        datos.tipo_finalizacion,
                descripcion_finalizacion: datos.descripcion_finalizacion,
                duracion_minutos:         datos.duracion_minutos,
                fecha_finalizacion:       new Date(),
            },
        });

        // Marcar mesa como finalizada
        await tx.mesaLiga.update({
            where: { idMesaLiga },
            data:  { estado: 'finalizada' },
        });

        // Actualizar estadísticas de jugadores en el grupo
        await _actualizarEstadisticasGrupo(
            tx,
            mesa.idJugadorBlanco,
            mesa.idJugadorNegro,
            datos.resultado,
            mesa.ronda_liga.idLiga,
            mesa.ronda_liga.idGrupoLiga
        );

        return partida;
    });
};

// ============================================================
// TABLA DE POSICIONES
// ============================================================

export const obtenerTablaPosiciones = async (idLiga: number, idGrupoLiga?: number) => {
    const where: Prisma.JugadorLigaWhereInput = {
        idLiga,
        ...(idGrupoLiga && { idGrupoLiga }),
        estado: { not: 'cancelado' },
    };

    return prisma.jugadorLiga.findMany({
        where,
        orderBy: [
            { puntos:         'desc' },
            { victorias:      'desc' },
            { posicion_grupo: 'asc' },
        ],
        include: {
            jugador: {
                select: {
                    idJugador:  true,
                    nombre:     true,
                    apellido1:  true,
                    apellido2:  true,
                    rating:     true,
                },
            },
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};

// ============================================================
// HELPERS PRIVADOS
// ============================================================

const _verificarLiga = async (idLiga: number) => {
    const liga = await prisma.infoLiga.findUnique({
        where:  { idLiga },
        select: { idLiga: true, activo: true },
    });
    if (!liga) throw new NotFoundError('Liga no encontrada');
    return liga;
};

const _verificarGrupo = async (idLiga: number, idGrupoLiga: number) => {
    const grupo = await prisma.grupoLiga.findFirst({
        where:  { idGrupoLiga, idLiga, activo: true },
        select: { idGrupoLiga: true },
    });
    if (!grupo) throw new NotFoundError('Grupo no encontrado en esta liga');
    return grupo;
};

// Actualiza puntos, victorias, empates y derrotas de ambos jugadores
const _actualizarEstadisticasGrupo = async (
    tx: Prisma.TransactionClient,
    idJugadorBlanco: number,
    idJugadorNegro: number,
    resultado: string,
    idLiga: number,
    idGrupoLiga: number
) => {
    let puntosBlanco = 0;
    let puntosNegro  = 0;
    let vicBlanco    = 0;
    let vicNegro     = 0;
    let empBlanco    = 0;
    let empNegro     = 0;
    let derBlanco    = 0;
    let derNegro     = 0;

    if (resultado === '1-0') {
        puntosBlanco = 1; vicBlanco = 1; derNegro = 1;
    } else if (resultado === '0-1') {
        puntosNegro = 1; vicNegro = 1; derBlanco = 1;
    } else if (resultado === '0.5-0.5') {
        puntosBlanco = 0.5; puntosNegro = 0.5; empBlanco = 1; empNegro = 1;
    }
    // '0-0' = incomparecencia, no suma puntos

    const actualizar = async (idJugador: number, puntos: number, v: number, e: number, d: number) => {
        const jl = await tx.jugadorLiga.findFirst({
            where: { idLiga, idGrupoLiga, idJugador },
        });
        if (!jl) return;

        await tx.jugadorLiga.update({
            where: { idJugadorLiga: jl.idJugadorLiga },
            data:  {
                puntos:           { increment: puntos },
                partidas_jugadas: { increment: resultado !== '0-0' ? 1 : 0 },
                victorias:        { increment: v },
                empates:          { increment: e },
                derrotas:         { increment: d },
            },
        });
    };

    await Promise.all([
        actualizar(idJugadorBlanco, puntosBlanco, vicBlanco, empBlanco, derBlanco),
        actualizar(idJugadorNegro,  puntosNegro,  vicNegro,  empNegro,  derNegro),
    ]);
};