import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../middleware/error.middleware';
import {
    CrearInscripcionDto,
    ActualizarInscripcionDto,
    ConfirmarPagoDto,
} from '../validations/inscripcion.validations';
import { inscripcionesCerradas, jugadorPuedeInscribirse } from '../utils/fecha.utils';

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
    return prisma.inscripcion.findMany({
        where: {
            idTorneo,
            ...(soloConfirmados && { estado: 'confirmado' }),
        },
        orderBy: { fecha_inscripcion: 'asc' },
        include: {
            jugador: {
                select: {
                    idJugador: true,
                    nombre:    true,
                    apellido1: true,
                    apellido2: true,
                    rating:    true,
                },
            },
            categoria: { select: { idCategoria: true, nombre: true } },
        },
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

// ── Crear inscripción ────────────────────────────────────────

export const crearInscripcion = async (datos: CrearInscripcionDto) => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        // 1. Verificar jugador
        const jugador = await tx.jugador.findUnique({
            where: { idJugador: datos.idJugador },
        });
        if (!jugador) throw new NotFoundError(`Jugador ${datos.idJugador} no encontrado`);
        if (jugador.estado === 'inactivo')
            throw new ForbiddenError(`El jugador ${jugador.nombre} ${jugador.apellido1} está inactivo`);

        // 2. Verificar torneo
        const torneo = await tx.torneo.findUnique({ where: { idTorneo: datos.idTorneo } });
        if (!torneo) throw new NotFoundError(`Torneo ${datos.idTorneo} no encontrado`);
        if (!torneo.activo) throw new ForbiddenError('El torneo no está activo');

        // 3. Verificar cierre de inscripciones
        if (await inscripcionesCerradas(torneo.cierre_inscripciones))
            throw new ForbiddenError('El plazo de inscripciones ha cerrado');

        // 4. Validar edad si aplica
        if (datos.idCategoria && jugador.fecha_nacimiento) {
            const categoria = await tx.categoria.findUnique({
                where:  { idCategoria: datos.idCategoria },
                select: { edadMinima: true, edadMaxima: true, tipo_validacion_edad: true },
            });
            if (categoria) {
                const check = jugadorPuedeInscribirse(
                    jugador.fecha_nacimiento,
                    torneo.fecha,
                    categoria.edadMinima,
                    categoria.edadMaxima,
                    categoria.tipo_validacion_edad
                );
                if (!check.puede)
                    throw new ForbiddenError(check.motivo ?? 'El jugador no cumple los requisitos de edad');
            }
        }

        // 5. Verificar duplicado
        const yaInscrito = await tx.inscripcion.findUnique({
            where: {
                unique_jugador_torneo: {
                    idJugador: datos.idJugador,
                    idTorneo:  datos.idTorneo,
                },
            },
        });
        if (yaInscrito) throw new ConflictError('El jugador ya está inscrito en este torneo');

        // 6. Crear inscripción — estado inicial: 'pendiente_pago'
        const inscripcion = await tx.inscripcion.create({
            data: {
                idJugador:           datos.idJugador,
                idTorneo:            datos.idTorneo,
                idCategoria:         datos.idCategoria,
                monto_pagado:        datos.monto_pagado  ?? 0,
                pago_confirmado:     datos.pago_confirmado ?? false,
                estado:              'pendiente_pago',
                notas:               datos.notas,
                fecha_inscripcion:   new Date(),
                fecha_actualizacion: new Date(),
            },
            include: {
                jugador: {
                    select: { idJugador: true, nombre: true, apellido1: true, apellido2: true },
                },
                categoria: { select: { idCategoria: true, nombre: true } },
            },
        });

        // 7. Si el pago ya viene confirmado, activar al jugador
        if (datos.pago_confirmado && jugador.estado === 'pendiente_pago') {
            await tx.jugador.update({
                where: { idJugador: datos.idJugador },
                data:  { estado: 'activo', pago_confirmado: true, actualizacion: new Date() },
            });
        }

        return inscripcion;
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
    if (!inscripcion)          throw new NotFoundError('Inscripción no encontrada');
    if (inscripcion.estado === 'cancelado')
        throw new ForbiddenError('No se puede modificar una inscripción cancelada');

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
            ...(estadoFinal          !== undefined && { estado:          estadoFinal }),
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