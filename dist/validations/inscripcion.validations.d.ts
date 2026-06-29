import { z } from 'zod';
export declare const crearInscripcionSchema: z.ZodObject<{
    idJugador: z.ZodNumber;
    idTorneo: z.ZodNumber;
    idCategoria: z.ZodOptional<z.ZodNumber>;
    monto_pagado: z.ZodDefault<z.ZodNumber>;
    pago_confirmado: z.ZodDefault<z.ZodBoolean>;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    idTorneo: number;
    idJugador: number;
    pago_confirmado: boolean;
    monto_pagado: number;
    notas?: string | undefined;
    idCategoria?: number | undefined;
}, {
    idTorneo: number;
    idJugador: number;
    notas?: string | undefined;
    idCategoria?: number | undefined;
    pago_confirmado?: boolean | undefined;
    monto_pagado?: number | undefined;
}>;
export declare const actualizarInscripcionSchema: z.ZodObject<{
    idCategoria: z.ZodOptional<z.ZodNumber>;
    monto_pagado: z.ZodOptional<z.ZodNumber>;
    pago_confirmado: z.ZodOptional<z.ZodBoolean>;
    estado: z.ZodOptional<z.ZodEnum<["pendiente_pago", "confirmado", "cancelado"]>>;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notas?: string | undefined;
    estado?: "pendiente_pago" | "cancelado" | "confirmado" | undefined;
    idCategoria?: number | undefined;
    pago_confirmado?: boolean | undefined;
    monto_pagado?: number | undefined;
}, {
    notas?: string | undefined;
    estado?: "pendiente_pago" | "cancelado" | "confirmado" | undefined;
    idCategoria?: number | undefined;
    pago_confirmado?: boolean | undefined;
    monto_pagado?: number | undefined;
}>;
export declare const confirmarPagoSchema: z.ZodObject<{
    monto_pagado: z.ZodNumber;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    monto_pagado: number;
    notas?: string | undefined;
}, {
    monto_pagado: number;
    notas?: string | undefined;
}>;
export type CrearInscripcionDto = z.infer<typeof crearInscripcionSchema>;
export type ActualizarInscripcionDto = z.infer<typeof actualizarInscripcionSchema>;
export type ConfirmarPagoDto = z.infer<typeof confirmarPagoSchema>;
