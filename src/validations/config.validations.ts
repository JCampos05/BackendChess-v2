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