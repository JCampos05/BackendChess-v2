"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const fecha_utils_1 = require("../../utils/fecha.utils");
const luxon_1 = require("luxon");
// ── Obtener fecha actual en la zona configurada del sistema ──
const ahoraEnSistema = async () => {
    const zona = await (0, fecha_utils_1.obtenerZonaSistema)();
    return luxon_1.DateTime.now().setZone(zona).toJSDate();
};
// ── Extraer IP del request ───────────────────────────────────
const extraerIp = (req) => {
    if (!req)
        return null;
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
        return ip.trim();
    }
    return req.socket?.remoteAddress ?? null;
};
// ── Función base de log ──────────────────────────────────────
const log = async (nivel, accion, entidad, idEntidad, detalles, idUsuario, req) => {
    try {
        const fecha = await ahoraEnSistema();
        await database_1.default.logSistema.create({
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
    }
    catch {
        // El logger nunca debe romper el flujo principal
    }
};
// ── API pública del servicio ─────────────────────────────────
exports.loggerService = {
    info: (accion, entidad, idEntidad, detalles, idUsuario, req) => log('info', accion, entidad, idEntidad, detalles, idUsuario, req),
    warning: (accion, entidad, idEntidad, detalles, idUsuario, req) => log('warning', accion, entidad, idEntidad, detalles, idUsuario, req),
    error: (accion, entidad, idEntidad, detalles, idUsuario, req) => log('error', accion, entidad, idEntidad, detalles, idUsuario, req),
    otro: (accion, entidad, idEntidad, detalles, idUsuario, req) => log('otro', accion, entidad, idEntidad, detalles, idUsuario, req),
};
//# sourceMappingURL=logger.service.js.map