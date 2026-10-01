import { z } from 'zod';

// ── Liga ─────────────────────────────────────────────────────

// Los formularios del frontend mandan null (no undefined) en los campos opcionales
// vacíos, por eso se aceptan con .nullish(). cierre_inscripciones llega de un
// <input type="datetime-local"> ("2026-10-10T18:00", sin offset), así que basta
// con que sea una fecha-hora interpretable.
const fechaHoraOpcional = z.string()
    .refine(v => !Number.isNaN(Date.parse(v)), 'Fecha y hora inválida')
    .nullish();

export const crearLigaSchema = z.object({
    nombre:               z.string().min(1).max(255),
    descripcion:          z.string().nullish(),
    fecha_inicio:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
    fecha_fin:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').nullish(),
    lugar:                z.string().max(255).nullish(),
    direccion:            z.string().max(255).nullish(),
    url_maps:             z.string().url().nullish(),
    tipo_sistema:         z.enum(['round_robin', 'suizo', 'grupos']).default('grupos'),
    num_grupos:           z.number().int().min(1).default(1),
    clasifican_por_grupo: z.number().int().min(1).default(2),
    idRitmoJuego:         z.number().int().positive().nullish(),
    idSistemaPago:        z.number().int().positive().nullish(),
    costo_inscripcion:    z.number().min(0).default(0),
    cierre_inscripciones: fechaHoraOpcional,
    max_jugadores:        z.number().int().positive().nullish(),
    notas:                z.string().nullish(),
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
    descripcion:   z.string().nullish(),
    max_jugadores: z.number().int().positive().nullish(),
    rondas:        z.number().int().min(1).default(5),
    premios:       z.record(z.unknown()).nullish(),
    desempates:    z.array(z.string()).nullish(),
});

// Liga + sus grupos en una sola petición: se crean juntos en una transacción
// (todo o nada), sin dejar ligas huérfanas si un grupo falla.
export const crearLigaConGruposSchema = crearLigaSchema.extend({
    grupos: z.array(crearGrupoSchema).optional(),
});

// Edición de liga + grupos en una sola petición (transacción). Los grupos con
// idGrupoLiga se actualizan; los que no lo traen se crean.
export const actualizarLigaConGruposSchema = actualizarLigaSchema.extend({
    grupos: z.array(crearGrupoSchema.extend({
        idGrupoLiga: z.number().int().positive().optional(),
    })).optional(),
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

// ── Recursos planos (módulo de Ligas, rutas /api/liga/...) ─────

export const crearGrupoFlatSchema = crearGrupoSchema.extend({
    idLiga: z.number().int().positive(),
});

export const crearRondaLigaFlatSchema = crearRondaLigaSchema.extend({
    idLiga: z.number().int().positive(),
});

export const actualizarRondaLigaSchema = z.object({
    fecha_programada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    hora_inicio:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
    notas:            z.string().optional(),
});

export const crearMesaLigaSchema = z.object({
    idRondaLiga:     z.number().int().positive(),
    numeroMesa:      z.number().int().positive(),
    idJugadorBlanco: z.number().int().positive(),
    idJugadorNegro:  z.number().int().positive(),
    notas:           z.string().optional(),
});

export const actualizarMesaLigaSchema = z.object({
    numeroMesa:      z.number().int().positive().optional(),
    idJugadorBlanco: z.number().int().positive().optional(),
    idJugadorNegro:  z.number().int().positive().optional(),
    estado:          z.enum(['pendiente', 'finalizada']).optional(),
    notas:           z.string().optional(),
});

export const inscribirJugadorLigaFlatSchema = inscribirJugadorLigaSchema.extend({
    idLiga: z.number().int().positive(),
});

export const actualizarJugadorLigaSchema = z.object({
    idGrupoLiga: z.number().int().positive().optional(),
    posicion:    z.number().int().positive().optional(),
    estado:      z.enum(['inscrito', 'confirmado', 'cancelado']).optional(),
    notas:       z.string().optional(),
});

export const crearPartidaLigaSchema = registrarPartidaLigaSchema.extend({
    idMesaLiga: z.number().int().positive(),
});

export const actualizarPartidaLigaSchema = registrarPartidaLigaSchema.partial();

// ── Types ─────────────────────────────────────────────────────

export type CrearLigaDto               = z.infer<typeof crearLigaSchema>;
export type CrearLigaConGruposDto      = z.infer<typeof crearLigaConGruposSchema>;
export type ActualizarLigaConGruposDto = z.infer<typeof actualizarLigaConGruposSchema>;
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

export type CrearGrupoFlatDto           = z.infer<typeof crearGrupoFlatSchema>;
export type CrearRondaLigaFlatDto       = z.infer<typeof crearRondaLigaFlatSchema>;
export type ActualizarRondaLigaDto      = z.infer<typeof actualizarRondaLigaSchema>;
export type CrearMesaLigaDto            = z.infer<typeof crearMesaLigaSchema>;
export type ActualizarMesaLigaDto       = z.infer<typeof actualizarMesaLigaSchema>;
export type InscribirJugadorLigaFlatDto = z.infer<typeof inscribirJugadorLigaFlatSchema>;
export type ActualizarJugadorLigaDto    = z.infer<typeof actualizarJugadorLigaSchema>;
export type CrearPartidaLigaDto         = z.infer<typeof crearPartidaLigaSchema>;
export type ActualizarPartidaLigaDto    = z.infer<typeof actualizarPartidaLigaSchema>;