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
exports.toggleActiveSistemaPago = exports.deleteSistemaPago = exports.updateSistemaPago = exports.createSistemaPago = exports.getSistemaPagoById = exports.getSistemasPagoActivos = exports.getAllSistemasPago = exports.deleteSistemaDesempate = exports.updateSistemaDesempate = exports.createSistemaDesempate = exports.getSistemaDesempateById = exports.getAllSistemasDesempate = exports.deleteSistemaCompetencia = exports.updateSistemaCompetencia = exports.createSistemaCompetencia = exports.getSistemaCompetenciaById = exports.getAllSistemasCompetencia = exports.deleteRitmo = exports.updateRitmo = exports.createRitmo = exports.getRitmoById = exports.getAllRitmos = exports.deleteCategoria = exports.updateCategoria = exports.createCategoria = exports.getCategoriaById = exports.getAllCategorias = void 0;
const CatSvc = __importStar(require("../services/catalogo.service"));
// ════════════════════════════════════════════════════════════
// CATEGORÍA
// ════════════════════════════════════════════════════════════
const getAllCategorias = async (req, res, next) => {
    try {
        const { orden = 'nombre', direccion = 'asc' } = req.query;
        const data = await CatSvc.getAllCategorias(orden, direccion);
        res.json({ ok: true, data, total: data.length });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllCategorias = getAllCategorias;
const getCategoriaById = async (req, res, next) => {
    try {
        const data = await CatSvc.getCategoriaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getCategoriaById = getCategoriaById;
const createCategoria = async (req, res, next) => {
    try {
        const { nombre, costo, nota, edadMinima, edadMaxima } = req.body;
        const data = await CatSvc.createCategoria({
            nombre,
            costo: parseFloat(costo),
            nota,
            edadMinima: edadMinima != null && edadMinima !== '' ? parseInt(edadMinima) : null,
            edadMaxima: edadMaxima != null && edadMaxima !== '' ? parseInt(edadMaxima) : null,
        });
        res.status(201).json({ ok: true, mensaje: 'Categoría creada exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createCategoria = createCategoria;
const updateCategoria = async (req, res, next) => {
    try {
        const { nombre, costo, nota, edadMinima, edadMaxima } = req.body;
        const data = await CatSvc.updateCategoria(parseInt(req.params.id), {
            ...(nombre !== undefined && { nombre }),
            ...(costo !== undefined && { costo: parseFloat(costo) }),
            ...(nota !== undefined && { nota }),
            ...(edadMinima !== undefined && {
                edadMinima: edadMinima != null && edadMinima !== '' ? parseInt(edadMinima) : null,
            }),
            ...(edadMaxima !== undefined && {
                edadMaxima: edadMaxima != null && edadMaxima !== '' ? parseInt(edadMaxima) : null,
            }),
        });
        res.json({ ok: true, mensaje: 'Categoría actualizada exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.updateCategoria = updateCategoria;
const deleteCategoria = async (req, res, next) => {
    try {
        await CatSvc.deleteCategoria(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Categoría eliminada exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteCategoria = deleteCategoria;
// ════════════════════════════════════════════════════════════
// RITMO DE JUEGO
// ════════════════════════════════════════════════════════════
const getAllRitmos = async (req, res, next) => {
    try {
        const { activo, orden = 'minutos', direccion = 'asc' } = req.query;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await CatSvc.getAllRitmos(activoBool, orden, direccion);
        res.json({ ok: true, data, total: data.length });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllRitmos = getAllRitmos;
const getRitmoById = async (req, res, next) => {
    try {
        const data = await CatSvc.getRitmoById(parseInt(req.params.id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getRitmoById = getRitmoById;
const createRitmo = async (req, res, next) => {
    try {
        const { nombre, descripcion, minutos, incremento, activo } = req.body;
        const data = await CatSvc.createRitmo({
            nombre,
            descripcion,
            minutos: parseInt(minutos),
            incremento: incremento !== undefined ? parseInt(incremento) : 0,
            activo: activo !== undefined ? Boolean(activo) : true,
        });
        res.status(201).json({ ok: true, mensaje: 'Ritmo de juego creado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createRitmo = createRitmo;
const updateRitmo = async (req, res, next) => {
    try {
        const { nombre, descripcion, minutos, incremento, activo } = req.body;
        const data = await CatSvc.updateRitmo(parseInt(req.params.id), {
            ...(nombre !== undefined && { nombre }),
            ...(descripcion !== undefined && { descripcion }),
            ...(minutos !== undefined && { minutos: parseInt(minutos) }),
            ...(incremento !== undefined && { incremento: parseInt(incremento) }),
            ...(activo !== undefined && { activo: Boolean(activo) }),
        });
        res.json({ ok: true, mensaje: 'Ritmo de juego actualizado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.updateRitmo = updateRitmo;
const deleteRitmo = async (req, res, next) => {
    try {
        await CatSvc.deleteRitmo(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Ritmo de juego eliminado exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteRitmo = deleteRitmo;
// ════════════════════════════════════════════════════════════
// SISTEMA DE COMPETENCIA
// ════════════════════════════════════════════════════════════
const getAllSistemasCompetencia = async (req, res, next) => {
    try {
        const { activo, orden = 'nombre', direccion = 'asc' } = req.query;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await CatSvc.getAllSistemasCompetencia(activoBool, orden, direccion);
        res.json({ ok: true, data, total: data.length });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllSistemasCompetencia = getAllSistemasCompetencia;
const getSistemaCompetenciaById = async (req, res, next) => {
    try {
        const data = await CatSvc.getSistemaCompetenciaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getSistemaCompetenciaById = getSistemaCompetenciaById;
const createSistemaCompetencia = async (req, res, next) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const data = await CatSvc.createSistemaCompetencia({
            nombre, descripcion, activo: activo !== undefined ? Boolean(activo) : true,
        });
        res.status(201).json({ ok: true, mensaje: 'Sistema de competencia creado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createSistemaCompetencia = createSistemaCompetencia;
const updateSistemaCompetencia = async (req, res, next) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const data = await CatSvc.updateSistemaCompetencia(parseInt(req.params.id), {
            ...(nombre !== undefined && { nombre }),
            ...(descripcion !== undefined && { descripcion }),
            ...(activo !== undefined && { activo: Boolean(activo) }),
        });
        res.json({ ok: true, mensaje: 'Sistema de competencia actualizado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.updateSistemaCompetencia = updateSistemaCompetencia;
const deleteSistemaCompetencia = async (req, res, next) => {
    try {
        await CatSvc.deleteSistemaCompetencia(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Sistema de competencia eliminado exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteSistemaCompetencia = deleteSistemaCompetencia;
// ════════════════════════════════════════════════════════════
// SISTEMA DE DESEMPATE
// ════════════════════════════════════════════════════════════
const getAllSistemasDesempate = async (req, res, next) => {
    try {
        const { activo, orden = 'nombre', direccion = 'asc' } = req.query;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await CatSvc.getAllSistemasDesempate(activoBool, orden, direccion);
        res.json({ ok: true, data, total: data.length });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllSistemasDesempate = getAllSistemasDesempate;
const getSistemaDesempateById = async (req, res, next) => {
    try {
        const data = await CatSvc.getSistemaDesempateById(parseInt(req.params.id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getSistemaDesempateById = getSistemaDesempateById;
const createSistemaDesempate = async (req, res, next) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const data = await CatSvc.createSistemaDesempate({
            nombre, descripcion, activo: activo !== undefined ? Boolean(activo) : true,
        });
        res.status(201).json({ ok: true, mensaje: 'Sistema de desempate creado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createSistemaDesempate = createSistemaDesempate;
const updateSistemaDesempate = async (req, res, next) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const data = await CatSvc.updateSistemaDesempate(parseInt(req.params.id), {
            ...(nombre !== undefined && { nombre }),
            ...(descripcion !== undefined && { descripcion }),
            ...(activo !== undefined && { activo: Boolean(activo) }),
        });
        res.json({ ok: true, mensaje: 'Sistema de desempate actualizado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.updateSistemaDesempate = updateSistemaDesempate;
const deleteSistemaDesempate = async (req, res, next) => {
    try {
        await CatSvc.deleteSistemaDesempate(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Sistema de desempate eliminado exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteSistemaDesempate = deleteSistemaDesempate;
// ════════════════════════════════════════════════════════════
// SISTEMA DE PAGO
// ════════════════════════════════════════════════════════════
const getAllSistemasPago = async (req, res, next) => {
    try {
        const { activo } = req.query;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await CatSvc.getAllSistemasPago(activoBool);
        res.json({ ok: true, data, total: data.length });
    }
    catch (e) {
        next(e);
    }
};
exports.getAllSistemasPago = getAllSistemasPago;
const getSistemasPagoActivos = async (_req, res, next) => {
    try {
        const data = await CatSvc.getSistemasPagoActivos();
        res.json({ ok: true, data, total: data.length });
    }
    catch (e) {
        next(e);
    }
};
exports.getSistemasPagoActivos = getSistemasPagoActivos;
const getSistemaPagoById = async (req, res, next) => {
    try {
        const data = await CatSvc.getSistemaPagoById(parseInt(req.params.id));
        res.json({ ok: true, data });
    }
    catch (e) {
        next(e);
    }
};
exports.getSistemaPagoById = getSistemaPagoById;
const createSistemaPago = async (req, res, next) => {
    try {
        const data = await CatSvc.createSistemaPago(req.body);
        res.status(201).json({ ok: true, mensaje: 'Sistema de pago creado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.createSistemaPago = createSistemaPago;
const updateSistemaPago = async (req, res, next) => {
    try {
        const data = await CatSvc.updateSistemaPago(parseInt(req.params.id), req.body);
        res.json({ ok: true, mensaje: 'Sistema de pago actualizado exitosamente', data });
    }
    catch (e) {
        next(e);
    }
};
exports.updateSistemaPago = updateSistemaPago;
const deleteSistemaPago = async (req, res, next) => {
    try {
        await CatSvc.deleteSistemaPago(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Sistema de pago eliminado exitosamente' });
    }
    catch (e) {
        next(e);
    }
};
exports.deleteSistemaPago = deleteSistemaPago;
const toggleActiveSistemaPago = async (req, res, next) => {
    try {
        const { activo } = req.body;
        const data = await CatSvc.toggleActiveSistemaPago(parseInt(req.params.id), activo !== undefined ? Boolean(activo) : undefined);
        res.json({
            ok: true,
            mensaje: `Sistema de pago ${data.activo ? 'activado' : 'desactivado'} exitosamente`,
            data,
        });
    }
    catch (e) {
        next(e);
    }
};
exports.toggleActiveSistemaPago = toggleActiveSistemaPago;
//# sourceMappingURL=catalogo.controller.js.map