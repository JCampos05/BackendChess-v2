import { z } from 'zod';

export const crearInscripcionSchema = z.object({
    idJugador: z.number().int().positive('El idJugador es requerido'),
    idTorneo: z.number().int().positive('El idTorneo es requerido'),
    idCategoria: z.number().int().positive().optional(),
    monto_pagado: z.number().min(0).default(0),
    pago_confirmado: z.boolean().default(false),
    notas: z.string().optional(),
});

export const actualizarInscripcionSchema = z.object({
    idCategoria: z.number().int().positive().optional(),
    monto_pagado: z.number().min(0).optional(),
    pago_confirmado: z.boolean().optional(),
    // Schema v2.1.0: pendiente_pago | confirmado | cancelado. 'pendiente' se
    // acepta también — el service (actualizarInscripcion) lo remapea a
    // 'pendiente_pago' por compatibilidad con el <select> de
    // edicion-inscripcion.ts, que todavía manda el valor viejo. Sin esto
    // aquí, ese remapeo nunca se alcanza porque Zod ya rechazó el payload.
    estado: z.enum(['pendiente_pago', 'pendiente', 'confirmado', 'cancelado']).optional(),
    // El frontend manda null explícito cuando el textarea de notas queda
    // vacío (ver edicion-inscripcion.ts) — sin .nullable() Zod lo rechaza.
    notas: z.string().optional().nullable(),
});

export const confirmarPagoSchema = z.object({
    monto_pagado: z.number().min(0, 'El monto no puede ser negativo'),
    notas: z.string().optional().nullable(),
});

export type CrearInscripcionDto = z.infer<typeof crearInscripcionSchema>;
export type ActualizarInscripcionDto = z.infer<typeof actualizarInscripcionSchema>;
export type ConfirmarPagoDto = z.infer<typeof confirmarPagoSchema>;