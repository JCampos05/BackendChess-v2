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