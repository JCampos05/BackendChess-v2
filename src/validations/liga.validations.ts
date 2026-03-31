import { z } from 'zod';

// ── Liga ─────────────────────────────────────────────────────

export const crearLigaSchema = z.object({
    nombre:               z.string().min(1).max(255),
    descripcion:          z.string().optional(),
    fecha_inicio:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
    fecha_fin:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
    lugar:                z.string().max(255).optional(),
    direccion:            z.string().max(255).optional(),
    url_maps:             z.string().url().optional(),
    tipo_sistema:         z.enum(['round_robin', 'suizo', 'grupos']).default('grupos'),
    num_grupos:           z.number().int().min(1).default(1),
    clasifican_por_grupo: z.number().int().min(1).default(2),
    idRitmoJuego:         z.number().int().positive().optional(),
    costo_inscripcion:    z.number().min(0).default(0),
    cierre_inscripciones: z.string().datetime({ offset: true }).optional(),
    max_jugadores:        z.number().int().positive().optional(),
    notas:                z.string().optional(),
});

export const actualizarLigaSchema = crearLigaSchema.partial();

export const filtrosLigaSchema = z.object({
    pagina:   z.coerce.number().int().min(1).default(1),
    limite:   z.coerce.number().int().min(1).max(100).default(20),
    activo:   z.coerce.boolean().optional(),
});

// ── Grupos ───────────────────────────────────────────────────

export const crearGrupoSchema = z.object({
    nombre:        z.string().min(1).max(100),
    descripcion:   z.string().optional(),
    max_jugadores: z.number().int().positive().optional(),
    rondas:        z.number().int().min(1).default(5),
    premios:       z.record(z.unknown()).optional(),
    desempates:    z.array(z.string()).optional(),
});

export const actualizarGrupoSchema = crearGrupoSchema.partial();

// ── Inscripción a liga ────────────────────────────────────────

export const inscribirJugadorLigaSchema = z.object({
    idJugador:      z.number().int().positive(),
    idGrupoLiga:    z.number().int().positive(),
    monto_pagado:   z.number().min(0).default(0),
    pago_confirmado: z.boolean().default(false),
    notas:          z.string().optional(),
});

export const confirmarPagoLigaSchema = z.object({
    monto_pagado: z.number().min(0),
    notas:        z.string().optional(),
});

// ── Rondas de liga ────────────────────────────────────────────

export const crearRondaLigaSchema = z.object({
    idGrupoLiga:      z.number().int().positive(),
    numeroRonda:      z.number().int().min(1),
    fecha_programada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    hora_inicio:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
    notas:            z.string().optional(),
});

export const cambiarEstadoRondaLigaSchema = z.object({
    estado: z.enum(['planificada', 'en_curso', 'finalizada', 'cancelada']),
    notas:  z.string().optional(),
});

// ── Mesas de liga ─────────────────────────────────────────────

export const generarMesasLigaSchema = z.object({
    idGrupoLiga: z.number().int().positive(),
    numeroRonda: z.number().int().min(1),
});

// ── Partidas de liga ──────────────────────────────────────────

export const registrarPartidaLigaSchema = z.object({
    idJugadorGanador:         z.number().int().positive().optional(),
    resultado:                z.enum(['1-0', '0-1', '0.5-0.5', '0-0']),
    tipo_finalizacion:        z.enum([
        'jaquemate', 'tiempo', 'rendicion', 'ilegales',
        'incomparecencia', 'empate_comun', 'empate_material',
        'empate_50_movidas', 'empate_triple_repeticion', 'otro',
    ]).optional(),
    descripcion_finalizacion: z.string().optional(),
    duracion_minutos:         z.number().int().positive().optional(),
});

// ── Types ─────────────────────────────────────────────────────

export type CrearLigaDto               = z.infer<typeof crearLigaSchema>;
export type ActualizarLigaDto          = z.infer<typeof actualizarLigaSchema>;
export type FiltrosLigaDto             = z.infer<typeof filtrosLigaSchema>;
export type CrearGrupoDto              = z.infer<typeof crearGrupoSchema>;
export type ActualizarGrupoDto         = z.infer<typeof actualizarGrupoSchema>;
export type InscribirJugadorLigaDto    = z.infer<typeof inscribirJugadorLigaSchema>;
export type ConfirmarPagoLigaDto       = z.infer<typeof confirmarPagoLigaSchema>;
export type CrearRondaLigaDto          = z.infer<typeof crearRondaLigaSchema>;
export type CambiarEstadoRondaLigaDto  = z.infer<typeof cambiarEstadoRondaLigaSchema>;
export type GenerarMesasLigaDto        = z.infer<typeof generarMesasLigaSchema>;
export type RegistrarPartidaLigaDto    = z.infer<typeof registrarPartidaLigaSchema>;