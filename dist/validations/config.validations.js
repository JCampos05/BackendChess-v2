"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarConfigSchema = void 0;
const zod_1 = require("zod");
exports.actualizarConfigSchema = zod_1.z.object({
    idZonaHoraria: zod_1.z.number().int().min(1).max(24).optional(),
    facebook: zod_1.z.string().url().max(255).optional().nullable(),
    instagram: zod_1.z.string().url().max(255).optional().nullable(),
    twitter: zod_1.z.string().url().max(255).optional().nullable(),
    youtube: zod_1.z.string().url().max(255).optional().nullable(),
    whatsapp: zod_1.z.string().max(20).optional().nullable(),
    nombreComite: zod_1.z.string().min(1).max(255).optional(),
    descripcion: zod_1.z.string().optional().nullable(),
    telefono: zod_1.z.string().max(20).optional().nullable(),
    email: zod_1.z.string().email().max(100).optional().nullable(),
    ciudad: zod_1.z.string().max(100).optional().nullable(),
    estado: zod_1.z.string().max(100).optional().nullable(),
    pais: zod_1.z.string().max(100).optional(),
    diasAutoDesactivar: zod_1.z.number().int().min(1).max(30).optional(),
    extras: zod_1.z.record(zod_1.z.unknown()).optional(),
});
//# sourceMappingURL=config.validations.js.map