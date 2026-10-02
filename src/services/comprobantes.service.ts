import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { ConflictError, NotFoundError } from '../middleware/error.middleware';
import { asignarFolioTorneo, asignarFolioLiga } from './folio.service';
import { firmarFolio } from './verificacion-folio.service';

// Gestión administrativa de comprobantes de inscripción (torneos y ligas): listado unificado,
// filtros y emisión de folio para inscripciones que no lo tienen (las anteriores a su introducción).

export interface FiltrosComprobantes {
    tipo: 'todos' | 'torneo' | 'liga';
    q?: string;
    folio: 'todos' | 'con' | 'sin';
    pago: 'todos' | 'confirmado' | 'pendiente';
    pagina: number;
    limite: number;
}

export interface FilaComprobante {
    tipo: 'torneo' | 'liga';
    idRegistro: number;
    folio: string | null;
    codigo_verificacion: string | null;
    evento: string;
    idEvento: number;
    seccion: string;
    jugador: string;
    idJugador: number;
    fechaInscripcion: Date | null;
    estadoInscripcion: string;
    estadoJugador: string;
    pagoConfirmado: boolean;
    montoPagado: number;
}

const nombreCompleto = (j: { nombre: string; apellido1: string; apellido2: string | null }): string =>
    [j.nombre, j.apellido1, j.apellido2].filter(Boolean).join(' ');

const condicionesComunes = (f: FiltrosComprobantes) => ({
    ...(f.folio === 'con' && { folio: { not: null } }),
    ...(f.folio === 'sin' && { folio: null }),
    ...(f.pago === 'confirmado' && { pago_confirmado: true }),
    ...(f.pago === 'pendiente' && { pago_confirmado: false }),
});

const filtroJugador = (q: string): Prisma.JugadorWhereInput => {
    // Cada palabra debe aparecer en nombre o apellidos ("juan perez" encuentra a Juan Pérez García).
    const palabras = q.split(/\s+/).filter(Boolean);
    return {
        AND: palabras.map(p => ({
            OR: [
                { nombre: { contains: p } },
                { apellido1: { contains: p } },
                { apellido2: { contains: p } },
            ],
        })),
    };
};

const whereTorneo = (f: FiltrosComprobantes): Prisma.InscripcionWhereInput => {
    const q = f.q?.trim();
    return {
        ...condicionesComunes(f),
        ...(q && {
            OR: [
                { folio: { contains: q } },
                { jugador: filtroJugador(q) },
                { torneo: { nombre: { contains: q } } },
            ],
        }),
    };
};

const whereLiga = (f: FiltrosComprobantes): Prisma.JugadorLigaWhereInput => {
    const q = f.q?.trim();
    return {
        ...condicionesComunes(f),
        ...(q && {
            OR: [
                { folio: { contains: q } },
                { jugador: filtroJugador(q) },
                { liga: { nombre: { contains: q } } },
            ],
        }),
    };
};

const filaTorneo = (i: any): FilaComprobante => ({
    tipo: 'torneo',
    idRegistro: i.idInscripcion,
    folio: i.folio,
    codigo_verificacion: i.folio ? firmarFolio(i.folio) : null,
    evento: i.torneo.nombre ?? 'Torneo',
    idEvento: i.torneo.idTorneo,
    seccion: i.categoria?.nombre ?? '',
    jugador: nombreCompleto(i.jugador),
    idJugador: i.jugador.idJugador,
    fechaInscripcion: i.fecha_inscripcion,
    estadoInscripcion: i.estado,
    estadoJugador: i.jugador.estado,
    pagoConfirmado: i.pago_confirmado,
    montoPagado: Number(i.monto_pagado),
});

const filaLiga = (i: any): FilaComprobante => ({
    tipo: 'liga',
    idRegistro: i.idJugadorLiga,
    folio: i.folio,
    codigo_verificacion: i.folio ? firmarFolio(i.folio) : null,
    evento: i.liga.nombre,
    idEvento: i.liga.idLiga,
    seccion: i.grupo?.nombre ?? '',
    jugador: nombreCompleto(i.jugador),
    idJugador: i.jugador.idJugador,
    fechaInscripcion: i.fecha_inscripcion,
    estadoInscripcion: i.estado,
    estadoJugador: i.jugador.estado,
    pagoConfirmado: i.pago_confirmado,
    montoPagado: Number(i.monto_pagado),
});

const SELECT_JUGADOR = { idJugador: true, nombre: true, apellido1: true, apellido2: true, estado: true } as const;

const INCLUDE_TORNEO = {
    jugador: { select: SELECT_JUGADOR },
    torneo: { select: { idTorneo: true, nombre: true } },
    categoria: { select: { nombre: true } },
} satisfies Prisma.InscripcionInclude;

const INCLUDE_LIGA = {
    jugador: { select: SELECT_JUGADOR },
    liga: { select: { idLiga: true, nombre: true } },
    grupo: { select: { nombre: true } },
} satisfies Prisma.JugadorLigaInclude;

export const listarComprobantes = async (f: FiltrosComprobantes) => {
    const incluirTorneos = f.tipo !== 'liga';
    const incluirLigas = f.tipo !== 'torneo';
    const desde = (f.pagina - 1) * f.limite;

    const wT = whereTorneo(f);
    const wL = whereLiga(f);

    const [totalT, totalL] = await Promise.all([
        incluirTorneos ? prisma.inscripcion.count({ where: wT }) : 0,
        incluirLigas ? prisma.jugadorLiga.count({ where: wL }) : 0,
    ]);

    // Un solo tipo: paginación directa en BD. Ambos: se trae hasta la página pedida de cada tabla,
    // se mezclan por fecha y se corta (el volumen de un comité lo permite sin una vista unida).
    const tomar = f.tipo === 'todos' ? desde + f.limite : f.limite;
    const saltar = f.tipo === 'todos' ? 0 : desde;

    const [inscripciones, jugadoresLiga] = await Promise.all([
        incluirTorneos
            ? prisma.inscripcion.findMany({
                where: wT, include: INCLUDE_TORNEO, orderBy: { fecha_inscripcion: 'desc' }, skip: saltar, take: tomar,
            })
            : [],
        incluirLigas
            ? prisma.jugadorLiga.findMany({
                where: wL, include: INCLUDE_LIGA, orderBy: { fecha_inscripcion: 'desc' }, skip: saltar, take: tomar,
            })
            : [],
    ]);

    let filas: FilaComprobante[] = [
        ...inscripciones.map(filaTorneo),
        ...jugadoresLiga.map(filaLiga),
    ].sort((a, b) => (b.fechaInscripcion?.getTime() ?? 0) - (a.fechaInscripcion?.getTime() ?? 0));

    if (f.tipo === 'todos') filas = filas.slice(desde, desde + f.limite);

    const total = totalT + totalL;
    return {
        filas,
        total,
        pagina: f.pagina,
        limite: f.limite,
        totalPaginas: Math.max(Math.ceil(total / f.limite), 1),
    };
};

/** Totales para las tarjetas de resumen (independientes de los filtros de la tabla). */
export const resumenComprobantes = async () => {
    const [torneosCon, torneosSin, ligasCon, ligasSin] = await Promise.all([
        prisma.inscripcion.count({ where: { folio: { not: null } } }),
        prisma.inscripcion.count({ where: { folio: null } }),
        prisma.jugadorLiga.count({ where: { folio: { not: null } } }),
        prisma.jugadorLiga.count({ where: { folio: null } }),
    ]);
    return {
        conFolio: torneosCon + ligasCon,
        sinFolio: torneosSin + ligasSin,
        torneos: torneosCon,
        ligas: ligasCon,
    };
};

/**
 * Asigna folio a una inscripción que no lo tiene. Idempotente: si ya tiene, devuelve el existente.
 * Usa el mismo contador atómico que las inscripciones nuevas, así que el número sale al final de la
 * secuencia del evento (no respeta el orden histórico de inscripción).
 */
export const emitirFolio = async (tipo: 'torneo' | 'liga', idRegistro: number): Promise<FilaComprobante> => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (tipo === 'torneo') {
            const insc = await tx.inscripcion.findUnique({ where: { idInscripcion: idRegistro }, select: { idInscripcion: true, idTorneo: true, folio: true } });
            if (!insc) throw new NotFoundError('Inscripción no encontrada');
            if (!insc.folio) {
                const { numero_inscripcion, folio } = await asignarFolioTorneo(tx, insc.idTorneo);
                await tx.inscripcion.update({ where: { idInscripcion: idRegistro }, data: { numero_inscripcion, folio } });
            }
            const actualizada = await tx.inscripcion.findUniqueOrThrow({ where: { idInscripcion: idRegistro }, include: INCLUDE_TORNEO });
            return filaTorneo(actualizada);
        }

        const insc = await tx.jugadorLiga.findUnique({ where: { idJugadorLiga: idRegistro }, select: { idJugadorLiga: true, idLiga: true, folio: true } });
        if (!insc) throw new NotFoundError('Inscripción no encontrada');
        if (!insc.folio) {
            const { numero_inscripcion, folio } = await asignarFolioLiga(tx, insc.idLiga);
            await tx.jugadorLiga.update({ where: { idJugadorLiga: idRegistro }, data: { numero_inscripcion, folio } });
        }
        const actualizada = await tx.jugadorLiga.findUniqueOrThrow({ where: { idJugadorLiga: idRegistro }, include: INCLUDE_LIGA });
        return filaLiga(actualizada);
    }).catch((err) => {
        // Doble clic / dos admins a la vez: el folio es único, el segundo intento ya no tiene nada que hacer.
        if (err?.code === 'P2002') throw new ConflictError('El folio ya fue emitido, recarga la lista');
        throw err;
    });
};
