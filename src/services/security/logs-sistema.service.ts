import prisma from '../../config/database';
import { FiltrosLogsDto } from '../../validations/security/seguridad.validations';
import { PaginatedResult } from '../../types';
import { obtenerZonaSistema } from '../../utils/fecha.utils';
import { DateTime } from 'luxon';

// ── Listado paginado con filtros ─────────────────────────────
export const listarLogs = async (
    filtros: FiltrosLogsDto
): Promise<PaginatedResult<unknown>> => {
    const { nivel, entidad, accion, idUsuario, fechaInicio, fechaFin, pagina, limite } = filtros;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (nivel) where.nivel = nivel;
    if (entidad) where.entidad = entidad;
    if (accion) where.accion = { contains: accion };
    if (idUsuario) where.idUsuario = idUsuario;
    if (fechaInicio || fechaFin) {
        where.fecha = {};
        if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
        if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    const [total, items] = await Promise.all([
        prisma.logSistema.count({ where }),
        prisma.logSistema.findMany({
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

    // Por nivel
    const porNivelRaw = await prisma.logSistema.groupBy({
        by: ['nivel'],
        where: whereBase,
        _count: { nivel: true },
    });

    // Top 10 entidades
    const porEntidadRaw = await prisma.logSistema.groupBy({
        by: ['entidad'],
        where: whereBase,
        _count: { entidad: true },
        orderBy: { _count: { entidad: 'desc' } },
        take: 10,
    });

    // Top 10 usuarios
    const porUsuarioRaw = await prisma.logSistema.groupBy({
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
        SELECT DATE(fecha) AS dia, COUNT(idLog) AS total
        FROM logs_sistema
        WHERE fecha >= ${hace7Dias}
        GROUP BY DATE(fecha)
        ORDER BY dia ASC
    `;

    // Top 10 acciones
    const accionesFrecuentesRaw = await prisma.logSistema.groupBy({
        by: ['accion'],
        where: whereBase,
        _count: { accion: true },
        orderBy: { _count: { accion: 'desc' } },
        take: 10,
    });

    return {
        porNivel: porNivelRaw.map((r) => ({ nivel: r.nivel, total: r._count.nivel })),
        porEntidad: porEntidadRaw.map((r) => ({ entidad: r.entidad, total: r._count.entidad })),
        porUsuario: porUsuarioRaw.map((r) => ({
            idUsuario: r.idUsuario,
            telefono: r.idUsuario ? (usuariosMap.get(r.idUsuario) ?? null) : null,
            total: r._count.idUsuario,
        })),
        porDia: porDiaRaw.map((r) => ({ dia: r.dia, total: Number(r.total) })),
        accionesFrecuentes: accionesFrecuentesRaw.map((r) => ({
            accion: r.accion,
            total: r._count.accion,
        })),
    };
};

// ── Logs de una entidad específica ───────────────────────────
export const obtenerPorEntidad = async (entidad: string, idEntidad: number) => {
    return prisma.logSistema.findMany({
        where: { entidad, idEntidad },
        include: {
            usuario: { select: { idUsuario: true, telefono: true } },
        },
        orderBy: { fecha: 'desc' },
        take: 50,
    });
};