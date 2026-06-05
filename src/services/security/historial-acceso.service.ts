import prisma from '../../config/database';
import { FiltrosHistorialDto } from '../../validations/security/seguridad.validations';
import { PaginatedResult } from '../../types';
import { obtenerZonaSistema } from '../../utils/fecha.utils';
import { DateTime } from 'luxon';

// ── Listado paginado con filtros ─────────────────────────────
export const listarHistorial = async (
    filtros: FiltrosHistorialDto
): Promise<PaginatedResult<unknown>> => {
    const { tipo, idUsuario, fechaInicio, fechaFin, pagina, limite } = filtros;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (tipo) where.tipo = tipo;
    if (idUsuario) where.idUsuario = idUsuario;
    if (fechaInicio || fechaFin) {
        where.fecha = {};
        if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
        if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    const [total, items] = await Promise.all([
        prisma.historialAcceso.count({ where }),
        prisma.historialAcceso.findMany({
            where,
            include: {
                usuario: { select: { idUsuario: true, telefono: true } },
            },
            orderBy: { fecha: 'desc' },
            take: limite,
            skip,
        }),
    ]);

    return { items, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

// ── Estadísticas ─────────────────────────────────────────────
export const obtenerEstadisticas = async (
    fechaInicio?: string,
    fechaFin?: string
) => {
    const whereBase: any = {};
    if (fechaInicio || fechaFin) {
        whereBase.fecha = {};
        if (fechaInicio) whereBase.fecha.gte = new Date(fechaInicio);
        if (fechaFin) whereBase.fecha.lte = new Date(fechaFin);
    }

    // Por tipo
    const porTipoRaw = await prisma.historialAcceso.groupBy({
        by: ['tipo'],
        where: whereBase,
        _count: { tipo: true },
    });

    // Top 10 usuarios
    const porUsuarioRaw = await prisma.historialAcceso.groupBy({
        by: ['idUsuario'],
        where: { ...whereBase, idUsuario: { not: null } },
        _count: { idUsuario: true },
        orderBy: { _count: { idUsuario: 'desc' } },
        take: 10,
    });

    const usuariosIds = porUsuarioRaw
        .map((r) => r.idUsuario)
        .filter((id): id is number => id !== null);

    const usuarios = await prisma.usuario.findMany({
        where: { idUsuario: { in: usuariosIds } },
        select: { idUsuario: true, telefono: true },
    });

    const usuariosMap = new Map(usuarios.map((u) => [u.idUsuario, u.telefono]));

    // Por día — últimos 7 días en zona del sistema
    const zona = await obtenerZonaSistema();
    const hace7Dias = DateTime.now().setZone(zona).minus({ days: 7 }).toJSDate();

    const porDiaRaw = await prisma.$queryRaw<{ dia: string; total: bigint }[]>`
        SELECT DATE(fecha) AS dia, COUNT(idAcceso) AS total
        FROM historial_accesos
        WHERE fecha >= ${hace7Dias}
        GROUP BY DATE(fecha)
        ORDER BY dia ASC
    `;

    return {
        porTipo: porTipoRaw.map((r) => ({ tipo: r.tipo, total: r._count.tipo })),
        porUsuario: porUsuarioRaw.map((r) => ({
            idUsuario: r.idUsuario,
            telefono: r.idUsuario ? (usuariosMap.get(r.idUsuario) ?? null) : null,
            total: r._count.idUsuario,
        })),
        porDia: porDiaRaw.map((r) => ({ dia: r.dia, total: Number(r.total) })),
    };
};