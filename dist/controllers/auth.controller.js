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
exports.obtenerProfile = exports.misSesiones = exports.toggleUsuario = exports.listarUsuarios = exports.crearUsuario = exports.cambiarPassword = exports.logout = exports.login = void 0;
const auth_validations_1 = require("../validations/auth.validations");
const authService = __importStar(require("../services/auth.service"));
// POST /api/seguridad/login
const login = async (req, res, next) => {
    try {
        const datos = auth_validations_1.loginSchema.parse(req.body);
        const ip = req.headers['x-forwarded-for'] ?? req.ip ?? '';
        const userAgent = req.headers['user-agent'] ?? '';
        const resultado = await authService.login(datos, ip, userAgent);
        res.json({ ok: true, mensaje: 'Sesión iniciada', data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// POST /api/seguridad/logout
const logout = async (req, res, next) => {
    try {
        const ip = req.headers['x-forwarded-for'] ?? req.ip ?? '';
        const userAgent = req.headers['user-agent'] ?? '';
        // authService.logout recibe (token, idUsuario, ip, userAgent)
        const resultado = await authService.logout(req.token, req.usuario.idUsuario, ip, userAgent);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.logout = logout;
// PATCH /api/seguridad/password
const cambiarPassword = async (req, res, next) => {
    try {
        const datos = auth_validations_1.cambiarPasswordSchema.parse(req.body);
        const resultado = await authService.cambiarPassword(req.usuario.idUsuario, datos);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.cambiarPassword = cambiarPassword;
// POST /api/seguridad/usuarios — solo adminGral
const crearUsuario = async (req, res, next) => {
    try {
        const datos = auth_validations_1.crearUsuarioSchema.parse(req.body);
        const usuario = await authService.crearUsuario(datos);
        res.status(201).json({ ok: true, mensaje: 'Usuario creado', data: usuario });
    }
    catch (err) {
        next(err);
    }
};
exports.crearUsuario = crearUsuario;
// GET /api/seguridad/usuarios — solo adminGral
const listarUsuarios = async (_req, res, next) => {
    try {
        const usuarios = await authService.listarUsuarios();
        res.json({ ok: true, data: usuarios, total: usuarios.length });
    }
    catch (err) {
        next(err);
    }
};
exports.listarUsuarios = listarUsuarios;
// PATCH /api/seguridad/usuarios/:id/toggle — solo adminGral
const toggleUsuario = async (req, res, next) => {
    try {
        const idUsuario = Number(req.params.id);
        if (isNaN(idUsuario)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        if (idUsuario === req.usuario.idUsuario) {
            res.status(400).json({ ok: false, mensaje: 'No puedes desactivar tu propia cuenta' });
            return;
        }
        const { activo } = req.body;
        const usuario = await authService.toggleUsuario(idUsuario, activo);
        if (!usuario) {
            res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
            return;
        }
        res.json({ ok: true, mensaje: `Usuario ${activo ? 'activado' : 'desactivado'}`, data: usuario });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleUsuario = toggleUsuario;
// GET /api/auth/sesiones
const misSesiones = async (req, res, next) => {
    try {
        const sesiones = await authService.obtenerSesiones(req.usuario.idUsuario);
        res.json({ ok: true, data: sesiones });
    }
    catch (err) {
        next(err);
    }
};
exports.misSesiones = misSesiones;
// GET /api/auth/profile
const obtenerProfile = async (req, res, next) => {
    try {
        const usuario = await authService.obtenerUsuarioPorId(req.usuario.idUsuario);
        res.json({ ok: true, data: usuario });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerProfile = obtenerProfile;
//# sourceMappingURL=auth.controller.js.map