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
exports.cambiarPassword = exports.eliminarUsuario = exports.actualizarUsuario = exports.crearUsuario = exports.obtenerUsuario = exports.listarUsuarios = void 0;
const auth_validations_1 = require("../validations/auth.validations");
const authService = __importStar(require("../services/auth.service"));
// GET /api/usuarios?orden=&direccion=
const listarUsuarios = async (_req, res, next) => {
    try {
        const usuarios = await authService.listarUsuarios();
        res.json({ success: true, message: 'Usuarios obtenidos', data: usuarios, total: usuarios.length });
    }
    catch (err) {
        next(err);
    }
};
exports.listarUsuarios = listarUsuarios;
// GET /api/usuarios/:id
const obtenerUsuario = async (req, res, next) => {
    try {
        const idUsuario = Number(req.params.id);
        const usuario = await authService.obtenerUsuarioPorId(idUsuario);
        res.json({ success: true, message: 'Usuario obtenido', data: usuario });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerUsuario = obtenerUsuario;
// POST /api/usuarios
const crearUsuario = async (req, res, next) => {
    try {
        const datos = auth_validations_1.crearUsuarioSchema.parse(req.body);
        const usuario = await authService.crearUsuario(datos);
        res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: usuario });
    }
    catch (err) {
        next(err);
    }
};
exports.crearUsuario = crearUsuario;
// PUT /api/usuarios/:id
const actualizarUsuario = async (req, res, next) => {
    try {
        const idUsuario = Number(req.params.id);
        const datos = auth_validations_1.actualizarUsuarioSchema.parse(req.body);
        const usuario = await authService.actualizarUsuario(idUsuario, datos);
        res.json({ success: true, message: 'Usuario actualizado exitosamente', data: usuario });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarUsuario = actualizarUsuario;
// DELETE /api/usuarios/:id
const eliminarUsuario = async (req, res, next) => {
    try {
        const idUsuario = Number(req.params.id);
        if (idUsuario === req.usuario.idUsuario) {
            res.status(400).json({ success: false, message: 'No puedes eliminar tu propio usuario', data: null });
            return;
        }
        await authService.eliminarUsuario(idUsuario);
        res.json({ success: true, message: 'Usuario eliminado exitosamente', data: null });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarUsuario = eliminarUsuario;
// PATCH /api/usuarios/:id/cambiar-password
const cambiarPassword = async (req, res, next) => {
    try {
        const idUsuario = Number(req.params.id);
        const { passwordActual, passwordNuevo } = auth_validations_1.cambiarPasswordAdminSchema.parse(req.body);
        await authService.cambiarPassword(idUsuario, {
            password_actual: passwordActual,
            password_nueva: passwordNuevo,
            confirmar_password: passwordNuevo,
        });
        res.json({ success: true, message: 'Contraseña actualizada exitosamente', data: null });
    }
    catch (err) {
        next(err);
    }
};
exports.cambiarPassword = cambiarPassword;
//# sourceMappingURL=usuario.controller.js.map