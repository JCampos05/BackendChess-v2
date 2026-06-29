"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearUsuarioSchema = exports.cambiarPasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    telefono: zod_1.z
        .string()
        .min(10, 'El teléfono debe tener al menos 10 dígitos')
        .max(15)
        .regex(/^\d+$/, 'El teléfono solo puede contener dígitos'),
    password: zod_1.z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
exports.cambiarPasswordSchema = zod_1.z.object({
    password_actual: zod_1.z.string().min(6),
    password_nueva: zod_1.z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100),
    confirmar_password: zod_1.z.string().min(6),
}).refine((data) => data.password_nueva === data.confirmar_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar_password'],
});
exports.crearUsuarioSchema = zod_1.z.object({
    telefono: zod_1.z
        .string()
        .min(10)
        .max(15)
        .regex(/^\d+$/, 'Solo dígitos'),
    password: zod_1.z
        .string()
        .min(6)
        .max(100),
    rol: zod_1.z.enum(['adminGral', 'adminTorneo']).default('adminTorneo'),
});
//# sourceMappingURL=auth.validations.js.map