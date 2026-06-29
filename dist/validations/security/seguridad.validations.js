"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtrosLogsSchema = exports.filtrosHistorialSchema = void 0;
const zod_1 = require("zod");
// ── Historial de accesos ──────────────────────────────────────
exports.filtrosHistorialSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['login_exitoso', 'login_fallido', 'logout', 'otro']).optional(),
    idUsuario: zod_1.z.coerce.number().int().positive().optional(),
    fechaInicio: zod_1.z.string().datetime({ offset: true }).optional(),
    fechaFin: zod_1.z.string().datetime({ offset: true }).optional(),
    pagina: zod_1.z.coerce.number().int().min(1).default(1),
    limite: zod_1.z.coerce.number().int().min(1).max(100).default(100),
});
// ── Logs del sistema ─────────────────────────────────────────
exports.filtrosLogsSchema = zod_1.z.object({
    nivel: zod_1.z.enum(['info', 'warning', 'error', 'otro']).optional(),
    entidad: zod_1.z.string().max(50).optional(),
    accion: zod_1.z.string().max(100).optional(),
    idUsuario: zod_1.z.coerce.number().int().positive().optional(),
    fechaInicio: zod_1.z.string().datetime({ offset: true }).optional(),
    fechaFin: zod_1.z.string().datetime({ offset: true }).optional(),
    pagina: zod_1.z.coerce.number().int().min(1).default(1),
    limite: zod_1.z.coerce.number().int().min(1).max(100).default(100),
});
//# sourceMappingURL=seguridad.validations.js.map