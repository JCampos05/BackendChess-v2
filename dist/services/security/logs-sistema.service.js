"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPorEntidad = exports.obtenerEstadisticas = exports.listarLogs = void 0;
const database_1 = __importDefault(require("../../config/database"));
const fecha_utils_1 = require("../../utils/fecha.utils");
const luxon_1 = require("luxon");
// ── Listado paginado con filtros ─────────────────────────────
const listarLogs = async (filtros) => {
    const { nivel, entidad, accion, idUsuario, fechaInicio, fechaFin, pagina, limite } = filtros;
    const skip = (pagina - 1) * limite;
    const where = {};
    if (nivel)
        where.nivel = nivel;
    if (entidad)
        where.entidad = entidad;
    if (accion)
        where.accion = { contains: accion };
    if (idUsuario)
        where.idUsuario = idUsuario;
    if (fechaInicio || fechaFin) {
        where.fecha = {};
        if (fechaInicio)
            where.fecha.gte = new Date(fechaInicio);
        if (fechaFin)
            where.fecha.lte = new Date(fechaFin);
    }
    const [total, items] = await Promise.all([
        database_1.default.logSistema.count({ where }),
        database_1.default.logSistema.findMany({
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
exports.listarLogs = listarLogs;
// ── Estadísticas ─────────────────────────────────────────────
const obtenerEstadisticas = async (fechaInicio, fechaFin) => {
    const whereBase = {};
    if (fechaInicio || fechaFin) {
        whereBase.fecha = {};
        if (fechaInicio)
            whereBase.fecha.gte = new Date(fechaInicio);
        if (fechaFin)
            whereBase.fecha.lte = new Date(fechaFin);
    }
    // Por nivel
    const porNivelRaw = await database_1.default.logSistema.groupBy({
        by: ['nivel'],
        where: whereBase,
        _count: { nivel: true },
    });
    // Top 10 entidades
    const porEntidadRaw = await database_1.default.logSistema.groupBy({
        by: ['entidad'],
        where: whereBase,
        _count: { entidad: true },
        orderBy: { _count: { entidad: 'desc' } },
        take: 10,
    });
    // Top 10 usuarios
    const porUsuarioRaw = await database_1.default.logSistema.groupBy({
        by: ['idUsuario'],
        where: { ...whereBase, idUsuario: { not: null } },
        _count: { idUsuario: true },
        orderBy: { _count: { idUsuario: 'desc' } },
        take: 10,
    });
    const usuariosIds = porUsuarioRaw
        .map((r) => r.idUsuario)
        .filter((id) => id !== null);
    const usuarios = await database_1.default.usuario.findMany({
        where: { idUsuario: { in: usuariosIds } },
        select: { idUsuario: true, telefono: true },
    });
    const usuariosMap = new Map(usuarios.map((u) => [u.idUsuario, u.telefono]));
    // Por día — últimos 7 días en zona del sistema
    const zona = await (0, fecha_utils_1.obtenerZonaSistema)();
    const hace7Dias = luxon_1.DateTime.now().setZone(zona).minus({ days: 7 }).toJSDate();
    const porDiaRaw = await database_1.default.$queryRaw `
        SELECT DATE(fecha) AS dia, COUNT(idLog) AS total
        FROM logs_sistema
        WHERE fecha >= ${hace7Dias}
        GROUP BY DATE(fecha)
        ORDER BY dia ASC
    `;
    // Top 10 acciones
    const accionesFrecuentesRaw = await database_1.default.logSistema.groupBy({
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
exports.obtenerEstadisticas = obtenerEstadisticas;
// ── Logs de una entidad específica ───────────────────────────
const obtenerPorEntidad = async (entidad, idEntidad) => {
    return database_1.default.logSistema.findMany({
        where: { entidad, idEntidad },
        include: {
            usuario: { select: { idUsuario: true, telefono: true } },
        },
        orderBy: { fecha: 'desc' },
        take: 50,
    });
};
exports.obtenerPorEntidad = obtenerPorEntidad;
//# sourceMappingURL=logs-sistema.service.js.map