"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarPartidaLigaSchema = exports.generarMesasLigaSchema = exports.cambiarEstadoRondaLigaSchema = exports.crearRondaLigaSchema = exports.confirmarPagoLigaSchema = exports.inscribirJugadorLigaSchema = exports.actualizarGrupoSchema = exports.crearGrupoSchema = exports.filtrosLigaSchema = exports.actualizarLigaSchema = exports.crearLigaSchema = void 0;
const zod_1 = require("zod");
// ── Liga ─────────────────────────────────────────────────────
exports.crearLigaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(255),
    descripcion: zod_1.z.string().optional(),
    fecha_inicio: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
    fecha_fin: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
    lugar: zod_1.z.string().max(255).optional(),
    direccion: zod_1.z.string().max(255).optional(),
    url_maps: zod_1.z.string().url().optional(),
    tipo_sistema: zod_1.z.enum(['round_robin', 'suizo', 'grupos']).default('grupos'),
    num_grupos: zod_1.z.number().int().min(1).default(1),
    clasifican_por_grupo: zod_1.z.number().int().min(1).default(2),
    idRitmoJuego: zod_1.z.number().int().positive().optional(),
    costo_inscripcion: zod_1.z.number().min(0).default(0),
    cierre_inscripciones: zod_1.z.string().datetime({ offset: true }).optional(),
    max_jugadores: zod_1.z.number().int().positive().optional(),
    notas: zod_1.z.string().optional(),
});
exports.actualizarLigaSchema = exports.crearLigaSchema.partial();
exports.filtrosLigaSchema = zod_1.z.object({
    pagina: zod_1.z.coerce.number().int().min(1).default(1),
    limite: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    activo: zod_1.z.coerce.boolean().optional(),
});
// ── Grupos ───────────────────────────────────────────────────
exports.crearGrupoSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(100),
    descripcion: zod_1.z.string().optional(),
    max_jugadores: zod_1.z.number().int().positive().optional(),
    rondas: zod_1.z.number().int().min(1).default(5),
    premios: zod_1.z.record(zod_1.z.unknown()).optional(),
    desempates: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.actualizarGrupoSchema = exports.crearGrupoSchema.partial();
// ── Inscripción a liga ────────────────────────────────────────
exports.inscribirJugadorLigaSchema = zod_1.z.object({
    idJugador: zod_1.z.number().int().positive(),
    idGrupoLiga: zod_1.z.number().int().positive(),
    monto_pagado: zod_1.z.number().min(0).default(0),
    pago_confirmado: zod_1.z.boolean().default(false),
    notas: zod_1.z.string().optional(),
});
exports.confirmarPagoLigaSchema = zod_1.z.object({
    monto_pagado: zod_1.z.number().min(0),
    notas: zod_1.z.string().optional(),
});
// ── Rondas de liga ────────────────────────────────────────────
exports.crearRondaLigaSchema = zod_1.z.object({
    idGrupoLiga: zod_1.z.number().int().positive(),
    numeroRonda: zod_1.z.number().int().min(1),
    fecha_programada: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    hora_inicio: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
    notas: zod_1.z.string().optional(),
});
exports.cambiarEstadoRondaLigaSchema = zod_1.z.object({
    estado: zod_1.z.enum(['planificada', 'en_curso', 'finalizada', 'cancelada']),
    notas: zod_1.z.string().optional(),
});
// ── Mesas de liga ─────────────────────────────────────────────
exports.generarMesasLigaSchema = zod_1.z.object({
    idGrupoLiga: zod_1.z.number().int().positive(),
    numeroRonda: zod_1.z.number().int().min(1),
});
// ── Partidas de liga ──────────────────────────────────────────
exports.registrarPartidaLigaSchema = zod_1.z.object({
    idJugadorGanador: zod_1.z.number().int().positive().optional(),
    resultado: zod_1.z.enum(['1-0', '0-1', '0.5-0.5', '0-0']),
    tipo_finalizacion: zod_1.z.enum([
        'jaquemate', 'tiempo', 'rendicion', 'ilegales',
        'incomparecencia', 'empate_comun', 'empate_material',
        'empate_50_movidas', 'empate_triple_repeticion', 'otro',
    ]).optional(),
    descripcion_finalizacion: zod_1.z.string().optional(),
    duracion_minutos: zod_1.z.number().int().positive().optional(),
});
//# sourceMappingURL=liga.validations.js.map