"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerEstadisticas = exports.listarHistorial = void 0;
const database_1 = __importDefault(require("../../config/database"));
const fecha_utils_1 = require("../../utils/fecha.utils");
const luxon_1 = require("luxon");
// ── Listado paginado con filtros ─────────────────────────────
const listarHistorial = async (filtros) => {
    const { tipo, idUsuario, fechaInicio, fechaFin, pagina, limite } = filtros;
    const skip = (pagina - 1) * limite;
    const where = {};
    if (tipo)
        where.tipo = tipo;
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
        database_1.default.historialAcceso.count({ where }),
        database_1.default.historialAcceso.findMany({
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
exports.listarHistorial = listarHistorial;
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
    // Por tipo
    const porTipoRaw = await database_1.default.historialAcceso.groupBy({
        by: ['tipo'],
        where: whereBase,
        _count: { tipo: true },
    });
    // Top 10 usuarios
    const porUsuarioRaw = await database_1.default.historialAcceso.groupBy({
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
exports.obtenerEstadisticas = obtenerEstadisticas;
//# sourceMappingURL=historial-acceso.service.js.map