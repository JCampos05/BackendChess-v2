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
exports.limpiarExpiradas = exports.cerrarTodasUsuario = exports.cerrarSesion = exports.getByUsuario = exports.getActivas = void 0;
const sesionesService = __importStar(require("../../services/security/sesiones-activas.service"));
// GET /api/seguridad/sesiones/activas
const getActivas = async (req, res, next) => {
    try {
        const sesiones = await sesionesService.obtenerActivas();
        res.json({ ok: true, data: sesiones, total: sesiones.length });
    }
    catch (err) {
        next(err);
    }
};
exports.getActivas = getActivas;
// GET /api/seguridad/sesiones/usuario/:idUsuario
const getByUsuario = async (req, res, next) => {
    try {
        const idUsuario = Number(req.params.idUsuario);
        if (isNaN(idUsuario)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido', code: 'INVALID_ID' });
            return;
        }
        const sesiones = await sesionesService.obtenerPorUsuario(idUsuario);
        res.json({ ok: true, data: sesiones, total: sesiones.length });
    }
    catch (err) {
        next(err);
    }
};
exports.getByUsuario = getByUsuario;
// DELETE /api/seguridad/sesiones/:idSesion
const cerrarSesion = async (req, res, next) => {
    try {
        const idSesion = Number(req.params.idSesion);
        if (isNaN(idSesion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido', code: 'INVALID_ID' });
            return;
        }
        await sesionesService.cerrarSesion(idSesion, req.token, req.usuario, req);
        res.json({ ok: true, mensaje: 'Sesión cerrada exitosamente' });
    }
    catch (err) {
        next(err);
    }
};
exports.cerrarSesion = cerrarSesion;
// POST /api/seguridad/sesiones/usuario/:idUsuario/cerrar-todas
const cerrarTodasUsuario = async (req, res, next) => {
    try {
        const idUsuario = Number(req.params.idUsuario);
        if (isNaN(idUsuario)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido', code: 'INVALID_ID' });
            return;
        }
        const { confirmar } = req.body;
        const count = await sesionesService.cerrarTodasDeUsuario(idUsuario, req.token, req.usuario, confirmar, req);
        res.json({
            ok: true,
            mensaje: `${count} sesión(es) cerrada(s) exitosamente`,
            sesionesCerradas: count,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.cerrarTodasUsuario = cerrarTodasUsuario;
// POST /api/seguridad/sesiones/limpiar-expiradas
const limpiarExpiradas = async (req, res, next) => {
    try {
        const count = await sesionesService.limpiarExpiradas(req.token, req.usuario, req);
        res.json({
            ok: true,
            mensaje: `${count} sesión(es) expirada(s) limpiada(s)`,
            sesionesLimpiadas: count,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.limpiarExpiradas = limpiarExpiradas;
//# sourceMappingURL=sesiones-activas.controller.js.map