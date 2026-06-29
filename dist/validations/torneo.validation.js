"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asignarAdminSchema = exports.asignarPatrocinadorSchema = exports.actualizarCategoriaSchema = exports.asignarCategoriaSchema = exports.filtrosTorneoSchema = exports.cambiarEstadoSchema = exports.actualizarTorneoSchema = exports.crearTorneoSchema = void 0;
const zod_1 = require("zod");
exports.crearTorneoSchema = zod_1.z.object({
    nombre: zod_1.z.string().max(255).optional(),
    lugar: zod_1.z.string().min(1).max(255),
    direccion: zod_1.z.string().min(1).max(255),
    url_maps: zod_1.z.string().url().max(500).optional(),
    fecha: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
    hora: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
    rondas: zod_1.z.number().int().min(1).max(20).default(5),
    cupo_maximo: zod_1.z.number().int().positive().optional().nullable(),
    notas: zod_1.z.string().optional(),
    cierre_inscripciones: zod_1.z.string().datetime({ offset: true }).optional(),
    idZonaHoraria: zod_1.z.number().int().min(1).max(24).optional(),
    idSistemaPago: zod_1.z.number().int().positive().optional(),
    es_actual: zod_1.z.boolean().default(true),
});
exports.actualizarTorneoSchema = exports.crearTorneoSchema.partial();
exports.cambiarEstadoSchema = zod_1.z.object({
    estado: zod_1.z.enum(['borrador', 'publicado', 'en_curso', 'finalizado', 'cancelado']),
    notas: zod_1.z.string().optional(),
});
exports.filtrosTorneoSchema = zod_1.z.object({
    pagina: zod_1.z.coerce.number().int().min(1).default(1),
    limite: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    activo: zod_1.z.coerce.boolean().optional(),
    estado: zod_1.z.enum(['borrador', 'publicado', 'en_curso', 'finalizado', 'cancelado']).optional(),
    es_actual: zod_1.z.coerce.boolean().optional(),
    soloConCategorias: zod_1.z.coerce.boolean().optional(),
});
exports.asignarCategoriaSchema = zod_1.z.object({
    idCategoria: zod_1.z.number().int().positive(),
    rondas: zod_1.z.number().int().min(1).optional(),
    ritmo_juego: zod_1.z.string().max(50).optional(),
    sistema_competencia: zod_1.z.string().max(100).optional(),
    premios: zod_1.z.record(zod_1.z.unknown()).optional(),
    desempates: zod_1.z.array(zod_1.z.string()).optional(),
    calendario: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.actualizarCategoriaSchema = exports.asignarCategoriaSchema.omit({ idCategoria: true }).partial();
exports.asignarPatrocinadorSchema = zod_1.z.object({
    idPatrocinador: zod_1.z.number().int().positive(),
    nivel: zod_1.z.enum(['principal', 'oro', 'plata', 'bronce', 'general']).default('general'),
    orden: zod_1.z.number().int().min(0).default(0),
});
exports.asignarAdminSchema = zod_1.z.object({
    idUsuario: zod_1.z.number().int().positive(),
    notas: zod_1.z.string().max(255).optional(),
});
//# sourceMappingURL=torneo.validation.js.map