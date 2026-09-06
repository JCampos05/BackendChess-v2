import { z } from 'zod';

// La obligatoriedad real de nombre/apellido1/telefono/fecha_nacimiento para
// un jugador NUEVO ya la valida `resolverJugador` en runtime (mismo criterio
// que usa hoy el registro manual de un admin) — aquí se dejan opcionales
// porque también puede venir solo `idJugador` (jugador ya existente,
// resuelto vía el modal "¿eres tú?").
export const inscribirPublicoSchema = z.object({
    idJugador: z.number().int().positive().optional(),
    nombre: z.string().min(1).max(100).optional(),
    apellido1: z.string().min(1).max(100).optional(),
    apellido2: z.string().max(100).optional(),
    telefono: z.string().max(15).regex(/^\d+$/, 'Solo dígitos').optional(),
    fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
    idTorneo: z.number().int().positive('El idTorneo es requerido'),
    idCategoria: z.number().int().positive('El idCategoria es requerido'),
    notas: z.string().max(1000).optional(),
});

export const buscarJugadorPublicoSchema = z.object({
    q: z.string().min(2, 'Mínimo 2 caracteres'),
});

export type InscribirPublicoDto = z.infer<typeof inscribirPublicoSchema>;
