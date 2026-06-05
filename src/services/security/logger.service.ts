import { LogNivel } from '@prisma/client';
import prisma from '../../config/database';
import { Request } from 'express';
import { obtenerZonaSistema } from '../../utils/fecha.utils';
import { DateTime } from 'luxon';

// ── Obtener fecha actual en la zona configurada del sistema ──
const ahoraEnSistema = async (): Promise<Date> => {
    const zona = await obtenerZonaSistema();
    return DateTime.now().setZone(zona).toJSDate();
};

// ── Extraer IP del request ───────────────────────────────────
const extraerIp = (req?: Request): string | null => {
    if (!req) return null;
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
        return ip.trim();
    }
    return req.socket?.remoteAddress ?? null;
};

// ── Función base de log ──────────────────────────────────────
const log = async (
    nivel: LogNivel,
    accion: string,
    entidad: string,
    idEntidad: number | null,
    detalles: string,
    idUsuario?: number | null,
    req?: Request
): Promise<void> => {
    try {
        const fecha = await ahoraEnSistema();
        await prisma.logSistema.create({
            data: {
                nivel,
                accion,
                entidad,
                idEntidad,
                detalles,
                idUsuario: idUsuario ?? null,
                ip: extraerIp(req),
                fecha,
            },
        });
    } catch {
        // El logger nunca debe romper el flujo principal
    }
};

// ── API pública del servicio ─────────────────────────────────

export const loggerService = {
    info: (
        accion: string,
        entidad: string,
        idEntidad: number | null,
        detalles: string,
        idUsuario?: number | null,
        req?: Request
    ) => log('info', accion, entidad, idEntidad, detalles, idUsuario, req),

    warning: (
        accion: string,
        entidad: string,
        idEntidad: number | null,
        detalles: string,
        idUsuario?: number | null,
        req?: Request
    ) => log('warning', accion, entidad, idEntidad, detalles, idUsuario, req),

    error: (
        accion: string,
        entidad: string,
        idEntidad: number | null,
        detalles: string,
        idUsuario?: number | null,
        req?: Request
    ) => log('error', accion, entidad, idEntidad, detalles, idUsuario, req),

    otro: (
        accion: string,
        entidad: string,
        idEntidad: number | null,
        detalles: string,
        idUsuario?: number | null,
        req?: Request
    ) => log('otro', accion, entidad, idEntidad, detalles, idUsuario, req),
};