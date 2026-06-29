import { z } from 'zod';

export const crearTorneoSchema = z.object({
    nombre: z.string().max(255).optional(),
    lugar: z.string().min(1).max(255),
    direccion: z.string().min(1).max(255),
    url_maps: z.string().url().max(500).optional(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
    hora_inicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato HH:MM o HH:MM:SS'),
    hora_fin: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato HH:MM o HH:MM:SS'),
    rondas: z.number().int().min(1).max(20).default(5),
    cupo_maximo: z.number().int().positive().optional().nullable(),
    notas: z.string().optional(),
    cierre_inscripciones: z.string().datetime({ offset: true }).optional(),
    idZonaHoraria: z.number().int().min(1).max(24).optional(),
    idSistemaPago: z.number().int().positive().optional(),
    es_actual: z.boolean().default(true),
});

export const actualizarTorneoSchema = crearTorneoSchema.partial();

export const cambiarEstadoSchema = z.object({
    estado: z.enum(['borrador', 'publicado', 'en_curso', 'finalizado', 'cancelado']),
    notas: z.string().optional(),
});

export const filtrosTorneoSchema = z.object({
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(20),
    activo: z.coerce.boolean().optional(),
    estado: z.enum(['borrador', 'publicado', 'en_curso', 'finalizado', 'cancelado']).optional(),
    es_actual: z.coerce.boolean().optional(),
    soloConCategorias: z.coerce.boolean().optional(),
});

export const asignarCategoriaSchema = z.object({
    idCategoria: z.number().int().positive(),
    rondas: z.number().int().min(1).optional(),
    ritmo_juego: z.string().max(50).optional(),
    sistema_competencia: z.string().max(100).optional(),
    premios: z.record(z.unknown()).optional(),
    desempates: z.array(z.string()).optional(),
    calendario: z.record(z.unknown()).optional(),
});

export const actualizarCategoriaSchema = asignarCategoriaSchema.omit({ idCategoria: true }).partial();

export const asignarPatrocinadorSchema = z.object({
    idPatrocinador: z.number().int().positive(),
    nivel: z.enum(['principal', 'oro', 'plata', 'bronce', 'general']).default('general'),
    orden: z.number().int().min(0).default(0),
});

export const asignarAdminSchema = z.object({
    idUsuario: z.number().int().positive(),
    notas: z.string().max(255).optional(),
});

export type CrearTorneoDto = z.infer<typeof crearTorneoSchema>;
export type ActualizarTorneoDto = z.infer<typeof actualizarTorneoSchema>;
export type CambiarEstadoDto = z.infer<typeof cambiarEstadoSchema>;
export type FiltrosTorneoDto = z.infer<typeof filtrosTorneoSchema>;
export type AsignarCategoriaDto = z.infer<typeof asignarCategoriaSchema>;
export type ActualizarCategoriaDto = z.infer<typeof actualizarCategoriaSchema>;
export type AsignarPatrocinadorDto = z.infer<typeof asignarPatrocinadorSchema>;
export type AsignarAdminDto = z.infer<typeof asignarAdminSchema>;