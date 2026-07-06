import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../middleware/error.middleware';
import * as ligaService from './liga.service';
import {
    CrearGrupoFlatDto,
    ActualizarGrupoDto,
    CrearRondaLigaFlatDto,
    ActualizarRondaLigaDto,
    CrearMesaLigaDto,
    ActualizarMesaLigaDto,
    RegistrarPartidaLigaDto,
    InscribirJugadorLigaFlatDto,
    ActualizarJugadorLigaDto,
    CrearPartidaLigaDto,
    ActualizarPartidaLigaDto,
} from '../validations/liga.validations';

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
// INFO LIGA (público)
// ============================================================

export const listarTodasLigas = async () => {
    return prisma.infoLiga.findMany({
        orderBy: { fecha_inicio: 'desc' },
        include: INCLUDE_LIGA_BASE,
    });
};

export const listarLigasActivas = async () => {
    return prisma.infoLiga.findMany({
        where:   { activo: true },
        orderBy: { fecha_inicio: 'desc' },
        include: INCLUDE_LIGA_BASE,
    });
};

export const obtenerStatsLiga = async (idLiga: number) => {
    await _verificarLigaExiste(idLiga);

    const [totalGrupos, totalJugadores, totalRondas, totalPartidas] = await Promise.all([
        prisma.grupoLiga.count({ where: { idLiga, activo: true } }),
        prisma.jugadorLiga.count({ where: { idLiga, estado: { not: 'cancelado' } } }),
        prisma.rondaLiga.count({ where: { idLiga } }),
        prisma.partidaLiga.count({ where: { mesa_liga: { ronda_liga: { idLiga } } } }),
    ]);

    return { idLiga, totalGrupos, totalJugadores, totalRondas, totalPartidas };
};

export const eliminarLiga = async (idLiga: number) => {
    return ligaService.toggleActivoLiga(idLiga, false);
};

// ============================================================
// GRUPOS
// ============================================================

export const listarGruposFlat = async (idLiga?: number) => {
    return prisma.grupoLiga.findMany({
        where:   { activo: true, ...(idLiga && { idLiga }) },
        orderBy: { nombre: 'asc' },
        include: {
            _count: { select: { jugadores_liga: { where: { estado: { not: 'cancelado' } } } } },
        },
    });
};

export const obtenerGrupoPorId = async (idGrupoLiga: number) => {
    const grupo = await prisma.grupoLiga.findUnique({
        where:   { idGrupoLiga },
        include: {
            _count: { select: { jugadores_liga: { where: { estado: { not: 'cancelado' } } } } },
        },
    });
    if (!grupo) throw new NotFoundError('Grupo no encontrado');
    return grupo;
};

export const crearGrupoFlat = async (datos: CrearGrupoFlatDto) => {
    const { idLiga, ...resto } = datos;
    return ligaService.crearGrupo(idLiga, resto);
};

export const actualizarGrupoFlat = async (idGrupoLiga: number, datos: ActualizarGrupoDto) => {
    const grupo = await prisma.grupoLiga.findUnique({ where: { idGrupoLiga } });
    if (!grupo) throw new NotFoundError('Grupo no encontrado');
    return ligaService.actualizarGrupo(grupo.idLiga, idGrupoLiga, datos);
};

export const eliminarGrupoFlat = async (idGrupoLiga: number) => {
    const grupo = await prisma.grupoLiga.findUnique({ where: { idGrupoLiga } });
    if (!grupo) throw new NotFoundError('Grupo no encontrado');
    return prisma.grupoLiga.update({
        where:  { idGrupoLiga },
        data:   { activo: false },
        select: { idGrupoLiga: true, nombre: true, activo: true },
    });
};

export const obtenerTablaGrupo = async (idGrupoLiga: number) => {
    const grupo = await prisma.grupoLiga.findUnique({ where: { idGrupoLiga } });
    if (!grupo) throw new NotFoundError('Grupo no encontrado');
    return ligaService.obtenerTablaPosiciones(grupo.idLiga, idGrupoLiga);
};

// ============================================================
// RONDAS
// ============================================================

export const listarRondasFlat = async (idLiga?: number, idGrupoLiga?: number) => {
    return prisma.rondaLiga.findMany({
        where:   { ...(idLiga && { idLiga }), ...(idGrupoLiga && { idGrupoLiga }) },
        orderBy: [{ idGrupoLiga: 'asc' }, { numeroRonda: 'asc' }],
        include: {
            grupo:  { select: { idGrupoLiga: true, nombre: true } },
            _count: { select: { mesas_liga: true } },
        },
    });
};

export const obtenerRondaPorId = async (idRondaLiga: number) => {
    const ronda = await prisma.rondaLiga.findUnique({
        where:   { idRondaLiga },
        include: { grupo: { select: { idGrupoLiga: true, nombre: true } } },
    });
    if (!ronda) throw new NotFoundError('Ronda no encontrada');
    return ronda;
};

export const crearRondaFlat = async (datos: CrearRondaLigaFlatDto) => {
    const { idLiga, ...resto } = datos;
    return ligaService.crearRondaLiga(idLiga, resto);
};

export const actualizarRondaFlat = async (idRondaLiga: number, datos: ActualizarRondaLigaDto) => {
    const ronda = await prisma.rondaLiga.findUnique({ where: { idRondaLiga } });
    if (!ronda) throw new NotFoundError('Ronda no encontrada');

    return prisma.rondaLiga.update({
        where: { idRondaLiga },
        data:  {
            ...(datos.fecha_programada !== undefined && {
                fecha_programada: new Date(`${datos.fecha_programada}T00:00:00`),
            }),
            ...(datos.hora_inicio !== undefined && {
                hora_inicio: new Date(`1970-01-01T${datos.hora_inicio}:00`),
            }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
        },
        include: { grupo: { select: { idGrupoLiga: true, nombre: true } } },
    });
};

export const iniciarRondaFlat = async (idRondaLiga: number) => {
    return ligaService.cambiarEstadoRondaLiga(idRondaLiga, { estado: 'en_curso' });
};

export const finalizarRondaFlat = async (idRondaLiga: number) => {
    return ligaService.cambiarEstadoRondaLiga(idRondaLiga, { estado: 'finalizada' });
};

export const eliminarRondaFlat = async (idRondaLiga: number) => {
    const ronda = await prisma.rondaLiga.findUnique({ where: { idRondaLiga } });
    if (!ronda) throw new NotFoundError('Ronda no encontrada');
    if (ronda.estado !== 'planificada')
        throw new ForbiddenError('Solo se puede eliminar una ronda antes de ser iniciada');

    await prisma.rondaLiga.delete({ where: { idRondaLiga } });
    return { idRondaLiga };
};

// ============================================================
// MESAS
// ============================================================

const INCLUDE_MESA = {
    jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
    jugador_negro:  { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
    partida_liga:   true,
} satisfies Prisma.MesaLigaInclude;

export const listarMesasFlat = async (idRondaLiga?: number) => {
    return prisma.mesaLiga.findMany({
        where:   { ...(idRondaLiga && { idRondaLiga }) },
        orderBy: { numeroMesa: 'asc' },
        include: INCLUDE_MESA,
    });
};

export const obtenerMesaPorId = async (idMesaLiga: number) => {
    const mesa = await prisma.mesaLiga.findUnique({
        where:   { idMesaLiga },
        include: INCLUDE_MESA,
    });
    if (!mesa) throw new NotFoundError('Mesa no encontrada');
    return mesa;
};

export const crearMesaFlat = async (datos: CrearMesaLigaDto) => {
    const ronda = await prisma.rondaLiga.findUnique({ where: { idRondaLiga: datos.idRondaLiga } });
    if (!ronda) throw new NotFoundError('Ronda no encontrada');

    const existe = await prisma.mesaLiga.findFirst({
        where: { idRondaLiga: datos.idRondaLiga, numeroMesa: datos.numeroMesa },
    });
    if (existe) throw new ConflictError(`La mesa ${datos.numeroMesa} ya existe en esta ronda`);

    return prisma.mesaLiga.create({
        data: {
            idRondaLiga:     datos.idRondaLiga,
            numeroMesa:      datos.numeroMesa,
            idJugadorBlanco: datos.idJugadorBlanco,
            idJugadorNegro:  datos.idJugadorNegro,
            notas:           datos.notas,
            estado:          'pendiente',
            fecha_creacion:  new Date(),
        },
        include: INCLUDE_MESA,
    });
};

export const actualizarMesaFlat = async (idMesaLiga: number, datos: ActualizarMesaLigaDto) => {
    const mesa = await prisma.mesaLiga.findUnique({ where: { idMesaLiga } });
    if (!mesa) throw new NotFoundError('Mesa no encontrada');

    return prisma.mesaLiga.update({
        where: { idMesaLiga },
        data:  {
            ...(datos.numeroMesa      !== undefined && { numeroMesa:      datos.numeroMesa }),
            ...(datos.idJugadorBlanco !== undefined && { idJugadorBlanco: datos.idJugadorBlanco }),
            ...(datos.idJugadorNegro  !== undefined && { idJugadorNegro:  datos.idJugadorNegro }),
            ...(datos.estado          !== undefined && { estado:          datos.estado }),
            ...(datos.notas           !== undefined && { notas:           datos.notas }),
        },
        include: INCLUDE_MESA,
    });
};

export const finalizarMesaFlat = async (idMesaLiga: number, datos: RegistrarPartidaLigaDto) => {
    return ligaService.registrarPartidaLiga(idMesaLiga, datos);
};

export const eliminarMesaFlat = async (idMesaLiga: number) => {
    const mesa = await prisma.mesaLiga.findUnique({ where: { idMesaLiga } });
    if (!mesa) throw new NotFoundError('Mesa no encontrada');
    if (mesa.estado === 'finalizada')
        throw new ForbiddenError('No se puede eliminar una mesa con partida finalizada');

    await prisma.mesaLiga.delete({ where: { idMesaLiga } });
    return { idMesaLiga };
};

// ============================================================
// JUGADORES DE LIGA
// ============================================================

const INCLUDE_JUGADOR_LIGA = {
    jugador: {
        select: {
            idJugador: true, nombre: true, apellido1: true,
            apellido2: true, rating: true, telefono: true,
        },
    },
    grupo: { select: { idGrupoLiga: true, nombre: true } },
} satisfies Prisma.JugadorLigaInclude;

export const listarJugadoresLigaFlat = async (idLiga?: number, idGrupoLiga?: number) => {
    return prisma.jugadorLiga.findMany({
        where: {
            ...(idLiga && { idLiga }),
            ...(idGrupoLiga && { idGrupoLiga }),
            estado: { not: 'cancelado' },
        },
        orderBy: [{ puntos: 'desc' }, { posicion_grupo: 'asc' }],
        include: INCLUDE_JUGADOR_LIGA,
    });
};

export const obtenerJugadorLigaPorId = async (idJugadorLiga: number) => {
    const jugadorLiga = await prisma.jugadorLiga.findUnique({
        where:   { idJugadorLiga },
        include: INCLUDE_JUGADOR_LIGA,
    });
    if (!jugadorLiga) throw new NotFoundError('Inscripción no encontrada');
    return jugadorLiga;
};

export const crearJugadorLigaFlat = async (datos: InscribirJugadorLigaFlatDto) => {
    const { idLiga, ...resto } = datos;
    return ligaService.inscribirJugadorLiga(idLiga, resto);
};

export const actualizarJugadorLigaFlat = async (
    idJugadorLiga: number,
    datos: ActualizarJugadorLigaDto
) => {
    const jugadorLiga = await prisma.jugadorLiga.findUnique({ where: { idJugadorLiga } });
    if (!jugadorLiga) throw new NotFoundError('Inscripción no encontrada');

    return prisma.jugadorLiga.update({
        where: { idJugadorLiga },
        data:  {
            ...(datos.idGrupoLiga !== undefined && { idGrupoLiga: datos.idGrupoLiga }),
            ...(datos.posicion    !== undefined && { posicion:    datos.posicion }),
            ...(datos.estado      !== undefined && { estado:      datos.estado }),
            ...(datos.notas       !== undefined && { notas:       datos.notas }),
        },
        include: INCLUDE_JUGADOR_LIGA,
    });
};

export const confirmarPagoFlat = async (idJugadorLiga: number, monto_pagado?: number) => {
    const jugadorLiga = await prisma.jugadorLiga.findUnique({ where: { idJugadorLiga } });
    if (!jugadorLiga) throw new NotFoundError('Inscripción no encontrada');

    return ligaService.confirmarPagoLiga(idJugadorLiga, {
        monto_pagado: monto_pagado ?? Number(jugadorLiga.monto_pagado),
    });
};

export const eliminarJugadorLigaFlat = async (idJugadorLiga: number) => {
    return ligaService.cancelarInscripcionLiga(idJugadorLiga);
};

// ============================================================
// PARTIDAS DE LIGA
// ============================================================

export const listarPartidasFlat = async (idMesaLiga?: number) => {
    return prisma.partidaLiga.findMany({
        where:   { ...(idMesaLiga && { idMesaLiga }) },
        orderBy: { idPartidaLiga: 'desc' },
        include: { mesa_liga: true },
    });
};

export const obtenerPartidaPorId = async (idPartidaLiga: number) => {
    const partida = await prisma.partidaLiga.findUnique({
        where:   { idPartidaLiga },
        include: { mesa_liga: true },
    });
    if (!partida) throw new NotFoundError('Partida no encontrada');
    return partida;
};

export const crearPartidaFlat = async (datos: CrearPartidaLigaDto) => {
    const { idMesaLiga, ...resto } = datos;
    return ligaService.registrarPartidaLiga(idMesaLiga, resto);
};

export const actualizarPartidaFlat = async (
    idPartidaLiga: number,
    datos: ActualizarPartidaLigaDto
) => {
    const partida = await prisma.partidaLiga.findUnique({ where: { idPartidaLiga } });
    if (!partida) throw new NotFoundError('Partida no encontrada');

    return prisma.partidaLiga.update({
        where: { idPartidaLiga },
        data:  {
            ...(datos.idJugadorGanador         !== undefined && { idJugadorGanador:         datos.idJugadorGanador }),
            ...(datos.resultado                !== undefined && { resultado:                datos.resultado }),
            ...(datos.tipo_finalizacion        !== undefined && { tipo_finalizacion:        datos.tipo_finalizacion }),
            ...(datos.descripcion_finalizacion !== undefined && { descripcion_finalizacion: datos.descripcion_finalizacion }),
            ...(datos.duracion_minutos         !== undefined && { duracion_minutos:         datos.duracion_minutos }),
        },
    });
};

export const eliminarPartidaFlat = async (idPartidaLiga: number) => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const partida = await tx.partidaLiga.findUnique({ where: { idPartidaLiga } });
        if (!partida) throw new NotFoundError('Partida no encontrada');

        await tx.partidaLiga.delete({ where: { idPartidaLiga } });
        await tx.mesaLiga.update({
            where: { idMesaLiga: partida.idMesaLiga },
            data:  { estado: 'pendiente' },
        });

        return { idPartidaLiga };
    });
};

// ============================================================
// HELPERS PRIVADOS
// ============================================================

const _verificarLigaExiste = async (idLiga: number) => {
    const liga = await prisma.infoLiga.findUnique({
        where:  { idLiga },
        select: { idLiga: true },
    });
    if (!liga) throw new NotFoundError('Liga no encontrada');
    return liga;
};
