"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limpiarExpiradas = exports.cerrarTodasDeUsuario = exports.cerrarSesion = exports.obtenerPorUsuario = exports.obtenerActivas = void 0;
const database_1 = __importDefault(require("../../config/database"));
const logger_service_1 = require("./logger.service");
const error_middleware_1 = require("../../middleware/error.middleware");
const fecha_utils_1 = require("../../utils/fecha.utils");
const luxon_1 = require("luxon");
// ── Fecha actual en zona del sistema ─────────────────────────
const ahoraEnSistema = async () => {
    const zona = await (0, fecha_utils_1.obtenerZonaSistema)();
    return luxon_1.DateTime.now().setZone(zona).toJSDate();
};
// ── Obtener todas las sesiones activas y no expiradas ────────
const obtenerActivas = async () => {
    const ahora = await ahoraEnSistema();
    return database_1.default.sesionActiva.findMany({
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
exports.obtenerActivas = obtenerActivas;
// ── Sesiones activas de un usuario específico ────────────────
const obtenerPorUsuario = async (idUsuario) => {
    return database_1.default.sesionActiva.findMany({
        where: { idUsuario, activa: 1 },
        orderBy: { ultimo_acceso: 'desc' },
    });
};
exports.obtenerPorUsuario = obtenerPorUsuario;
// ── Cerrar una sesión específica ─────────────────────────────
const cerrarSesion = async (idSesion, tokenActual, usuarioReq, req) => {
    const sesion = await database_1.default.sesionActiva.findUnique({
        where: { idSesion },
        include: {
            usuario: { select: { idUsuario: true, telefono: true } },
        },
    });
    if (!sesion)
        throw new error_middleware_1.NotFoundError('Sesión no encontrada');
    if (!sesion.activa)
        throw new error_middleware_1.ConflictError('La sesión ya está cerrada');
    if (sesion.token === tokenActual) {
        throw new error_middleware_1.ForbiddenError('No puedes cerrar tu sesión actual desde aquí. Usa el endpoint de logout.');
    }
    await database_1.default.sesionActiva.update({
        where: { idSesion },
        data: { activa: 0 },
    });
    await logger_service_1.loggerService.warning('cerrar_sesion_remota', 'sesion', idSesion, `Sesión de ${sesion.usuario?.telefono} cerrada remotamente por usuario ${usuarioReq.telefono}`, usuarioReq.idUsuario, req);
};
exports.cerrarSesion = cerrarSesion;
// ── Cerrar todas las sesiones de un usuario (excepto la actual) ──
const cerrarTodasDeUsuario = async (idUsuario, tokenActual, usuarioReq, confirmar, req) => {
    if (idUsuario === usuarioReq.idUsuario && !confirmar) {
        throw new error_middleware_1.ForbiddenError('Debes confirmar el cierre de todas tus sesiones');
    }
    const resultado = await database_1.default.sesionActiva.updateMany({
        where: {
            idUsuario,
            activa: 1,
            NOT: { token: tokenActual },
        },
        data: { activa: 0 },
    });
    await logger_service_1.loggerService.warning('cerrar_todas_sesiones', 'sesion', idUsuario, `${resultado.count} sesiones cerradas para usuario ${idUsuario} por usuario ${usuarioReq.idUsuario}`, usuarioReq.idUsuario, req);
    return resultado.count;
};
exports.cerrarTodasDeUsuario = cerrarTodasDeUsuario;
// ── Limpiar sesiones expiradas ───────────────────────────────
const limpiarExpiradas = async (tokenActual, usuarioReq, req) => {
    const ahora = await ahoraEnSistema();
    const resultado = await database_1.default.sesionActiva.updateMany({
        where: {
            activa: 1,
            fecha_expiracion: { lt: ahora },
            NOT: { token: tokenActual },
        },
        data: { activa: 0 },
    });
    await logger_service_1.loggerService.info('limpiar_sesiones_expiradas', 'sesion', null, `${resultado.count} sesiones expiradas limpiadas`, usuarioReq.idUsuario, req);
    return resultado.count;
};
exports.limpiarExpiradas = limpiarExpiradas;
//# sourceMappingURL=sesiones-activas.service.js.map