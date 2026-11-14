import { z } from 'zod';

export const actualizarConfigSchema = z.object({
    idZonaHoraria:     z.number().int().min(1).max(24).optional(),
    facebook:          z.string().url().max(255).optional().nullable(),
    instagram:         z.string().url().max(255).optional().nullable(),
    twitter:           z.string().url().max(255).optional().nullable(),
    youtube:           z.string().url().max(255).optional().nullable(),
    whatsapp:          z.string().max(20).optional().nullable(),
    nombreComite:      z.string().min(1).max(255).optional(),
    descripcion:       z.string().optional().nullable(),
    telefono:          z.string().max(20).optional().nullable(),
    email:             z.string().email().max(100).optional().nullable(),
    ciudad:            z.string().max(100).optional().nullable(),
    estado:            z.string().max(100).optional().nullable(),
    pais:              z.string().max(100).optional(),
    diasAutoDesactivar: z.number().int().min(1).max(30).optional(),
    extras:            z.record(z.unknown()).optional(),
});

export type ActualizarConfigDto = z.infer<typeof actualizarConfigSchema>;

// Límites de peticiones ajustables desde el panel. `null` quita el ajuste (vuelve al valor por defecto).
// Los rangos deben coincidir con los de services/rate-limit-config.service.ts.
export const actualizarLimitesSchema = z.object({
    generalPorMinuto:    z.number().int().min(60, 'Mínimo 60 por minuto').max(3000, 'Máximo 3000 por minuto').nullable().optional(),
    inscripcionPor15Min: z.number().int().min(5, 'Mínimo 5').max(500, 'Máximo 500').nullable().optional(),
}).refine(d => Object.values(d).some(v => v !== undefined), { message: 'Indica al menos un límite' });

export type ActualizarLimitesDto = z.infer<typeof actualizarLimitesSchema>;

// Lineamientos de clasificación de ritmos (blitz / rápido / estándar). `restablecer: true` vuelve a los valores
// por defecto de FIDE. Los rangos deben coincidir con los de services/ritmo-rating-config.service.ts.
export const actualizarRitmosFideSchema = z.union([
    z.object({ restablecer: z.literal(true) }),
    z.object({
        blitzMaximo:  z.number().int().min(1, 'El blitz debe durar al menos 1 minuto').max(30, 'El blitz no puede pasar de 30 minutos'),
        rapidoMaximo: z.number().int().min(2, 'Mínimo 2 minutos').max(180, 'El rápido no puede pasar de 180 minutos'),
    }).refine(d => d.rapidoMaximo > d.blitzMaximo, { message: 'El límite del rápido debe ser mayor que el del blitz', path: ['rapidoMaximo'] }),
]);

export type ActualizarRitmosFideDto = z.infer<typeof actualizarRitmosFideSchema>;
