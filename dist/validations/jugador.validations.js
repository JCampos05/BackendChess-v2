"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtrosJugadorSchema = exports.actualizarJugadorSchema = exports.crearJugadorSchema = void 0;
const zod_1 = require("zod");
exports.crearJugadorSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'El nombre es requerido').max(100),
    apellido1: zod_1.z.string().min(1, 'El primer apellido es requerido').max(100),
    apellido2: zod_1.z.string().max(100).optional(),
    telefono: zod_1.z.string().max(15).regex(/^\d+$/, 'Solo dígitos').optional(),
    fecha_nacimiento: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
    idCategoria: zod_1.z.number().int().positive().optional(),
    notas: zod_1.z.string().optional(),
    rating: zod_1.z.number().int().min(0).max(9999).default(0),
});
exports.actualizarJugadorSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(100).optional(),
    apellido1: zod_1.z.string().min(1).max(100).optional(),
    apellido2: zod_1.z.string().max(100).optional(),
    telefono: zod_1.z.string().max(15).regex(/^\d+$/, 'Solo dígitos').optional(),
    fecha_nacimiento: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
    idCategoria: zod_1.z.number().int().positive().optional(),
    notas: zod_1.z.string().optional(),
    rating: zod_1.z.number().int().min(0).max(9999).optional(),
    // Schema v2.1.0: pendiente_pago | activo | inactivo
    estado: zod_1.z.enum(['pendiente_pago', 'activo', 'inactivo']).optional(),
});
exports.filtrosJugadorSchema = zod_1.z.object({
    nombre: zod_1.z.string().optional(),
    // Schema v2.1.0: pendiente_pago | activo | inactivo
    estado: zod_1.z.enum(['pendiente_pago', 'activo', 'inactivo']).optional(),
    idCategoria: zod_1.z.coerce.number().int().positive().optional(),
    pagina: zod_1.z.coerce.number().int().min(1).default(1),
    limite: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=jugador.validations.js.map