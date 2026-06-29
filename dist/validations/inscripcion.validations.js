"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmarPagoSchema = exports.actualizarInscripcionSchema = exports.crearInscripcionSchema = void 0;
const zod_1 = require("zod");
exports.crearInscripcionSchema = zod_1.z.object({
    idJugador: zod_1.z.number().int().positive('El idJugador es requerido'),
    idTorneo: zod_1.z.number().int().positive('El idTorneo es requerido'),
    idCategoria: zod_1.z.number().int().positive().optional(),
    monto_pagado: zod_1.z.number().min(0).default(0),
    pago_confirmado: zod_1.z.boolean().default(false),
    notas: zod_1.z.string().optional(),
});
exports.actualizarInscripcionSchema = zod_1.z.object({
    idCategoria: zod_1.z.number().int().positive().optional(),
    monto_pagado: zod_1.z.number().min(0).optional(),
    pago_confirmado: zod_1.z.boolean().optional(),
    // Schema v2.1.0: pendiente_pago | confirmado | cancelado
    estado: zod_1.z.enum(['pendiente_pago', 'confirmado', 'cancelado']).optional(),
    notas: zod_1.z.string().optional(),
});
exports.confirmarPagoSchema = zod_1.z.object({
    monto_pagado: zod_1.z.number().min(0, 'El monto no puede ser negativo'),
    notas: zod_1.z.string().optional(),
});
//# sourceMappingURL=inscripcion.validations.js.map