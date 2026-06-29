"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertTorneoCategoria = upsertTorneoCategoria;
exports.getCategoriasByTorneo = getCategoriasByTorneo;
exports.getTorneoCategoria = getTorneoCategoria;
exports.deleteTorneoCategoria = deleteTorneoCategoria;
exports.toggleActiveTorneoCategoria = toggleActiveTorneoCategoria;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const client_1 = require("@prisma/client");
// ─── INCLUDE BASE ─────────────────────────────────────────────────────────────
const includeCategoria = {
    categoria: {
        select: {
            idCategoria: true,
            nombre: true,
            costo: true,
            edadMinima: true,
            edadMaxima: true,
        },
    },
};
// ─── SERVICE ──────────────────────────────────────────────────────────────────
async function upsertTorneoCategoria(dto) {
    const { idTorneo, idCategoria, rondas, ritmo_juego, sistema_competencia, calendario, premios, desempates, activo, cierre_inscripciones, cupo_maximo, } = dto;
    const torneo = await database_1.default.torneo.findUnique({ where: { idTorneo } });
    if (!torneo)
        throw new error_middleware_1.NotFoundError('Torneo no encontrado');
    const categoria = await database_1.default.categoria.findUnique({ where: { idCategoria } });
    if (!categoria)
        throw new error_middleware_1.NotFoundError('Categoría no encontrada');
    if (rondas !== undefined && rondas < 1)
        throw new error_middleware_1.ValidationError('Las rondas deben ser un número mayor o igual a 1');
    const existente = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (existente) {
        const updated = await database_1.default.torneoCategoria.update({
            where: { idTorneoCat: existente.idTorneoCat },
            data: {
                ...(rondas !== undefined && { rondas }),
                ...(ritmo_juego !== undefined && { ritmo_juego: ritmo_juego?.trim() ?? null }),
                ...(sistema_competencia !== undefined && {
                    sistema_competencia: sistema_competencia?.trim() ?? null,
                }),
                // null se persiste explícitamente; undefined omite el campo (sin cambio)
                ...(calendario !== undefined && { calendario: calendario ?? client_1.Prisma.JsonNull }),
                ...(premios !== undefined && { premios: premios ?? client_1.Prisma.JsonNull }),
                ...(desempates !== undefined && { desempates: desempates ?? client_1.Prisma.JsonNull }),
                ...(activo !== undefined && { activo }),
                ...(cierre_inscripciones !== undefined && {
                    cierre_inscripciones: cierre_inscripciones ? new Date(cierre_inscripciones) : null,
                }),
                ...(cupo_maximo !== undefined && { cupo_maximo: cupo_maximo ?? null }),
            },
            include: includeCategoria,
        });
        return { data: updated, created: false };
    }
    const created = await database_1.default.torneoCategoria.create({
        data: {
            idTorneo,
            idCategoria,
            rondas: rondas ?? 5,
            ritmo_juego: ritmo_juego?.trim() ?? null,
            sistema_competencia: sistema_competencia?.trim() ?? null,
            // En create: null se persiste; undefined deja el default de la BD
            calendario: calendario ?? undefined,
            premios: premios ?? undefined,
            desempates: desempates ?? undefined,
            activo: activo ?? true,
            cierre_inscripciones: cierre_inscripciones ? new Date(cierre_inscripciones) : undefined,
            cupo_maximo: cupo_maximo ?? undefined,
        },
        include: includeCategoria,
    });
    return { data: created, created: true };
}
async function getCategoriasByTorneo(idTorneo) {
    return database_1.default.torneoCategoria.findMany({
        where: { idTorneo },
        include: includeCategoria,
        orderBy: { categoria: { nombre: 'asc' } },
    });
}
async function getTorneoCategoria(idTorneo, idCategoria) {
    const tc = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
        include: {
            ...includeCategoria,
            torneo: {
                select: {
                    idTorneo: true,
                    nombre: true,
                    lugar: true,
                    direccion: true,
                    fecha: true,
                },
            },
        },
    });
    if (!tc)
        throw new error_middleware_1.NotFoundError('Configuración no encontrada');
    return tc;
}
async function deleteTorneoCategoria(idTorneo, idCategoria) {
    const tc = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (!tc)
        throw new error_middleware_1.NotFoundError('Configuración no encontrada');
    await database_1.default.torneoCategoria.delete({ where: { idTorneoCat: tc.idTorneoCat } });
}
async function toggleActiveTorneoCategoria(idTorneo, idCategoria, activo) {
    const tc = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (!tc)
        throw new error_middleware_1.NotFoundError('Configuración no encontrada');
    const nuevoEstado = activo !== undefined ? activo : !tc.activo;
    return database_1.default.torneoCategoria.update({
        where: { idTorneoCat: tc.idTorneoCat },
        data: { activo: nuevoEstado },
        include: includeCategoria,
    });
}
//# sourceMappingURL=torneo-categoria.service.js.map