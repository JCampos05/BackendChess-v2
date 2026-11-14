import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../middleware/error.middleware';
import {
    ActualizarInscripcionDto,
    ConfirmarPagoDto,
} from '../validations/inscripcion.validations';
import { calcularEdadParaTorneo } from '../utils/fecha.utils';

// ── Obtener por ID ───────────────────────────────────────────

export const obtenerInscripcionPorId = async (idInscripcion: number) => {
    const inscripcion = await prisma.inscripcion.findUnique({
        where: { idInscripcion },
        include: {
            jugador: {
                select: {
                    idJugador: true,
                    nombre:    true,
                    apellido1: true,
                    apellido2: true,
                    rating:    true,
                    estado:    true,
                },
            },
            torneo:    { select: { idTorneo: true, nombre: true, fecha: true } },
            categoria: { select: { idCategoria: true, nombre: true, costo: true } },
        },
    });
    if (!inscripcion) throw new NotFoundError('Inscripción no encontrada');
    return inscripcion;
};

// ── Listar por torneo ────────────────────────────────────────

export const listarInscripcionesTorneo = async (
    idTorneo: number,
    soloConfirmados = false
) => {
    const inscripciones = await prisma.inscripcion.findMany({
        where: {
            idTorneo,
            ...(soloConfirmados && { estado: 'confirmado' }),
        },
        orderBy: { fecha_inscripcion: 'asc' },
        include: {
            jugador: {
                select: {
                    idJugador:        true,
                    nombre:           true,
                    apellido1:        true,
                    apellido2:        true,
                    telefono:         true,
                    rating:           true,
                    fecha_nacimiento: true,
                },
            },
            categoria: { select: { idCategoria: true, nombre: true, costo: true } },
            torneo:    { select: { fecha: true } },
        },
    });

    // Compatibilidad con inscripciones antiguas que no guardaron `edad`: si quedó null, se calcula al vuelo (no se persiste).
    return inscripciones.map((insc) => {
        if (insc.edad !== null || !insc.jugador.fecha_nacimiento) return insc;
        return {
            ...insc,
            edad: calcularEdadParaTorneo(insc.jugador.fecha_nacimiento, insc.torneo.fecha, 'anio_torneo'),
        };
    });
};

// ── Listar por jugador ───────────────────────────────────────

export const listarInscripcionesJugador = async (idJugador: number) => {
    return prisma.inscripcion.findMany({
        where:   { idJugador },
        orderBy: { fecha_inscripcion: 'desc' },
        include: {
            torneo: {
                select: {
                    idTorneo: true,
                    nombre:   true,
                    fecha:    true,
                    lugar:    true,
                    activo:   true,
                },
            },
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });
};

// ── Actualizar ───────────────────────────────────────────────

export const actualizarInscripcion = async (
    idInscripcion: number,
    datos: ActualizarInscripcionDto
) => {
    const inscripcion = await prisma.inscripcion.findUnique({
        where:  { idInscripcion },
        select: { idInscripcion: true, estado: true },
    });
    if (!inscripcion) throw new NotFoundError('Inscripción no encontrada');

    // Mapear 'pendiente' → 'pendiente_pago' por compatibilidad con payloads anteriores
    let estadoFinal = datos.estado;
    if ((estadoFinal as string) === 'pendiente') {
        estadoFinal = 'pendiente_pago' as typeof estadoFinal;
    }

    return prisma.inscripcion.update({
        where: { idInscripcion },
        data:  {
            ...(datos.idCategoria    !== undefined && { idCategoria:    datos.idCategoria }),
            ...(datos.monto_pagado   !== undefined && { monto_pagado:   datos.monto_pagado }),
            ...(datos.pago_confirmado !== undefined && { pago_confirmado: datos.pago_confirmado }),
            ...(estadoFinal          !== undefined && {
                // Para este punto 'pendiente' ya se remapeó arriba — el cast
                // solo angosta el tipo, que sigue incluyendo 'pendiente' por
                // el ensanchamiento del enum en el schema Zod.
                estado: estadoFinal as 'pendiente_pago' | 'confirmado' | 'cancelado',
            }),
            ...(datos.notas          !== undefined && { notas:           datos.notas }),
            fecha_actualizacion: new Date(),
        },
        include: {
            jugador:   { select: { idJugador: true, nombre: true, apellido1: true } },
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });
};

// ── Confirmar pago ───────────────────────────────────────────

export const confirmarPago = async (
    idInscripcion: number,
    datos: ConfirmarPagoDto,
    idAdminConfirmo: number
) => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const inscripcion = await tx.inscripcion.findUnique({
            where:   { idInscripcion },
            include: { jugador: { select: { idJugador: true, estado: true } } },
        });
        if (!inscripcion)
            throw new NotFoundError('Inscripción no encontrada');
        if (inscripcion.estado === 'cancelado')
            throw new ForbiddenError('No se puede confirmar una inscripción cancelada');

        const actualizada = await tx.inscripcion.update({
            where: { idInscripcion },
            data:  {
                pago_confirmado:     true,
                monto_pagado:        datos.monto_pagado,
                estado:              'confirmado',
                idAdminConfirmo,
                fecha_confirmacion:  new Date(),
                notas:               datos.notas,
                fecha_actualizacion: new Date(),
            },
            include: {
                jugador: {
                    select: { idJugador: true, nombre: true, apellido1: true, estado: true },
                },
                categoria: { select: { idCategoria: true, nombre: true } },
            },
        });

        // Activar jugador si aún no estaba activo
        if (inscripcion.jugador.estado !== 'activo') {
            await tx.jugador.update({
                where: { idJugador: inscripcion.jugador.idJugador },
                data:  { estado: 'activo', pago_confirmado: true, actualizacion: new Date() },
            });
        }

        return actualizada;
    });
};

// ── Cancelar ─────────────────────────────────────────────────

export const cancelarInscripcion = async (
    idInscripcion: number,
    motivo?: string
) => {
    const inscripcion = await prisma.inscripcion.findUnique({
        where:  { idInscripcion },
        select: { idInscripcion: true, estado: true },
    });
    if (!inscripcion)
        throw new NotFoundError('Inscripción no encontrada');
    if (inscripcion.estado === 'cancelado')
        throw new ConflictError('La inscripción ya está cancelada');

    return prisma.inscripcion.update({
        where: { idInscripcion },
        data:  {
            estado:              'cancelado',
            pago_confirmado:     false,
            ...(motivo && { notas: motivo }),
            fecha_actualizacion: new Date(),
        },
        select: { idInscripcion: true, estado: true, idJugador: true, idTorneo: true },
    });
};