"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.removerAdmin = exports.asignarAdmin = exports.removerPatrocinador = exports.asignarPatrocinador = exports.listarPatrocinadores = exports.desasignarCategoria = exports.actualizarCategoria = exports.asignarCategoria = exports.toggleEsActual = exports.toggleActivo = exports.cambiarEstado = exports.eliminarTorneo = exports.actualizarTorneo = exports.crearTorneo = exports.obtenerTorneo = exports.listarTorneos = exports.listarTorneosActivos = exports.listarTorneosPublicos = void 0;
const torneoService = __importStar(require("../services/torneo.service"));
const torneo_validation_1 = require("../validations/torneo.validation");
// Helper local — convierte ZodError en respuesta 400
const zodFail = (res, error) => {
    const errores = error.errors.map(e => e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message);
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};
// ── Público — sin autenticación ───────────────────────────────
// GET /api/torneos/publicos
// Devuelve torneos activos y publicados para la landing page
const listarTorneosPublicos = async (_req, res, next) => {
    try {
        const resultado = await torneoService.listarTorneos({
            pagina: 1,
            limite: 10,
            activo: true,
            es_actual: true,
        });
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    }
    catch (err) {
        next(err);
    }
};
exports.listarTorneosPublicos = listarTorneosPublicos;
// GET /api/torneos/activos
// Devuelve todos los torneos activos (para el frontend autenticado)
const listarTorneosActivos = async (_req, res, next) => {
    try {
        const resultado = await torneoService.listarTorneos({
            pagina: 1,
            limite: 100,
            activo: true,
        });
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    }
    catch (err) {
        next(err);
    }
};
exports.listarTorneosActivos = listarTorneosActivos;
// ── Torneos CRUD ──────────────────────────────────────────────
const listarTorneos = async (req, res, next) => {
    try {
        const parse = torneo_validation_1.filtrosTorneoSchema.safeParse(req.query);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await torneoService.listarTorneos(parse.data);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.listarTorneos = listarTorneos;
const obtenerTorneo = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const torneo = await torneoService.obtenerTorneoPorId(idTorneo);
        res.json({ ok: true, data: torneo });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerTorneo = obtenerTorneo;
const crearTorneo = async (req, res, next) => {
    try {
        const parse = torneo_validation_1.crearTorneoSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const torneo = await torneoService.crearTorneo(parse.data);
        res.status(201).json({ ok: true, data: torneo });
    }
    catch (err) {
        next(err);
    }
};
exports.crearTorneo = crearTorneo;
const actualizarTorneo = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse = torneo_validation_1.actualizarTorneoSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const torneo = await torneoService.actualizarTorneo(idTorneo, parse.data);
        res.json({ ok: true, data: torneo });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarTorneo = actualizarTorneo;
const eliminarTorneo = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const resultado = await torneoService.eliminarTorneo(idTorneo);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarTorneo = eliminarTorneo;
// ── Estado ────────────────────────────────────────────────────
const cambiarEstado = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse = torneo_validation_1.cambiarEstadoSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const torneo = await torneoService.cambiarEstado(idTorneo, parse.data);
        res.json({ ok: true, data: torneo });
    }
    catch (err) {
        next(err);
    }
};
exports.cambiarEstado = cambiarEstado;
const toggleActivo = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const activo = Boolean(req.body.activo);
        const resultado = await torneoService.toggleActivo(idTorneo, activo);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleActivo = toggleActivo;
const toggleEsActual = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const es_actual = Boolean(req.body.es_actual);
        const resultado = await torneoService.toggleEsActual(idTorneo, es_actual);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleEsActual = toggleEsActual;
// ── Categorías ────────────────────────────────────────────────
const asignarCategoria = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse = torneo_validation_1.asignarCategoriaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await torneoService.asignarCategoria(idTorneo, parse.data);
        res.status(201).json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.asignarCategoria = asignarCategoria;
const actualizarCategoria = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const idCategoria = Number(req.params.idCategoria);
        const parse = torneo_validation_1.actualizarCategoriaSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await torneoService.actualizarCategoriaTorneo(idTorneo, idCategoria, parse.data);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarCategoria = actualizarCategoria;
const desasignarCategoria = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const idCategoria = Number(req.params.idCategoria);
        const resultado = await torneoService.desasignarCategoria(idTorneo, idCategoria);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.desasignarCategoria = desasignarCategoria;
// ── Patrocinadores ────────────────────────────────────────────
const listarPatrocinadores = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const resultado = await torneoService.listarPatrocinadoresTorneo(idTorneo);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.listarPatrocinadores = listarPatrocinadores;
const asignarPatrocinador = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse = torneo_validation_1.asignarPatrocinadorSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await torneoService.asignarPatrocinador(idTorneo, parse.data);
        res.status(201).json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.asignarPatrocinador = asignarPatrocinador;
const removerPatrocinador = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const idPatrocinador = Number(req.params.idPatrocinador);
        const resultado = await torneoService.removerPatrocinador(idTorneo, idPatrocinador);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.removerPatrocinador = removerPatrocinador;
// ── Admins ────────────────────────────────────────────────────
const asignarAdmin = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse = torneo_validation_1.asignarAdminSchema.safeParse(req.body);
        if (!parse.success) {
            zodFail(res, parse.error);
            return;
        }
        const resultado = await torneoService.asignarAdmin(idTorneo, parse.data);
        res.status(201).json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.asignarAdmin = asignarAdmin;
const removerAdmin = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.id);
        const idUsuario = Number(req.params.idUsuario);
        const resultado = await torneoService.removerAdmin(idTorneo, idUsuario);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.removerAdmin = removerAdmin;
//# sourceMappingURL=torneo.controller.js.map