import prisma from '../../config/database';
import { loggerService } from './logger.service';
import { ForbiddenError, NotFoundError, ConflictError } from '../../middleware/error.middleware';
import { Request } from 'express';
import { obtenerZonaSistema } from '../../utils/fecha.utils';
import { DateTime } from 'luxon';

interface UsuarioReq {
    idUsuario: number;
    telefono: string;
    rol: string;
}

// ── Fecha actual en zona del sistema ─────────────────────────
const ahoraEnSistema = async (): Promise<Date> => {
    const zona = await obtenerZonaSistema();
    return DateTime.now().setZone(zona).toJSDate();
};

// ── Obtener todas las sesiones activas y no expiradas ────────
export const obtenerActivas = async () => {
    const ahora = await ahoraEnSistema();
    return prisma.sesionActiva.findMany({
        where: {
            activa: 1,
            fecha_expiracion: { gt: ahora },
        },
        include: {
            usuario: { select: { idUsuario: true, telefono: true } },
        },
        orderBy: { ultimo_acceso: 'desc' },
    });
};

// ── Sesiones activas de un usuario específico ────────────────
export const obtenerPorUsuario = async (idUsuario: number) => {
    return prisma.sesionActiva.findMany({
        where: { idUsuario, activa: 1 },
        orderBy: { ultimo_acceso: 'desc' },
    });
};

// ── Cerrar una sesión específica ─────────────────────────────
export const cerrarSesion = async (
    idSesion: number,
    tokenActual: string,
    usuarioReq: UsuarioReq,
    req?: Request
): Promise<void> => {
    const sesion = await prisma.sesionActiva.findUnique({
        where: { idSesion },
        include: {
            usuario: { select: { idUsuario: true, telefono: true } },
        },
    });

    if (!sesion) throw new NotFoundError('Sesión no encontrada');

    if (!sesion.activa) throw new ConflictError('La sesión ya está cerrada');

    if (sesion.token === tokenActual) {
        throw new ForbiddenError(
            'No puedes cerrar tu sesión actual desde aquí. Usa el endpoint de logout.'
        );
    }

    await prisma.sesionActiva.update({
        where: { idSesion },
        data: { activa: 0 },
    });

    await loggerService.warning(
        'cerrar_sesion_remota',
        'sesion',
        idSesion,
        `Sesión de ${sesion.usuario?.telefono} cerrada remotamente por usuario ${usuarioReq.telefono}`,
        usuarioReq.idUsuario,
        req
    );
};

// ── Cerrar todas las sesiones de un usuario (excepto la actual) ──
export const cerrarTodasDeUsuario = async (
    idUsuario: number,
    tokenActual: string,
    usuarioReq: UsuarioReq,
    confirmar: boolean | undefined,
    req?: Request
): Promise<number> => {
    if (idUsuario === usuarioReq.idUsuario && !confirmar) {
        throw new ForbiddenError('Debes confirmar el cierre de todas tus sesiones');
    }

    const resultado = await prisma.sesionActiva.updateMany({
        where: {
            idUsuario,
            activa: 1,
            NOT: { token: tokenActual },
        },
        data: { activa: 0 },
    });

    await loggerService.warning(
        'cerrar_todas_sesiones',
        'sesion',
        idUsuario,
        `${resultado.count} sesiones cerradas para usuario ${idUsuario} por usuario ${usuarioReq.idUsuario}`,
        usuarioReq.idUsuario,
        req
    );

    return resultado.count;
};

// ── Limpiar sesiones expiradas ───────────────────────────────
export const limpiarExpiradas = async (
    tokenActual: string,
    usuarioReq: UsuarioReq,
    req?: Request
): Promise<number> => {
    const ahora = await ahoraEnSistema();

    const resultado = await prisma.sesionActiva.updateMany({
        where: {
            activa: 1,
            fecha_expiracion: { lt: ahora },
            NOT: { token: tokenActual },
        },
        data: { activa: 0 },
    });

    await loggerService.info(
        'limpiar_sesiones_expiradas',
        'sesion',
        null,
        `${resultado.count} sesiones expiradas limpiadas`,
        usuarioReq.idUsuario,
        req
    );

    return resultado.count;
};