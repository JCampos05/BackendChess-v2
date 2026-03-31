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
    // Schema v2.1.0: pendiente_pago | confirmado | cancelado
    estado: z.enum(['pendiente_pago', 'confirmado', 'cancelado']).optional(),
    notas: z.string().optional(),
});

export const confirmarPagoSchema = z.object({
    monto_pagado: z.number().min(0, 'El monto no puede ser negativo'),
    notas: z.string().optional(),
});

export type CrearInscripcionDto = z.infer<typeof crearInscripcionSchema>;
export type ActualizarInscripcionDto = z.infer<typeof actualizarInscripcionSchema>;
export type ConfirmarPagoDto = z.infer<typeof confirmarPagoSchema>;