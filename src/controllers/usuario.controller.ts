import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
    crearUsuarioSchema,
    actualizarUsuarioSchema,
    cambiarPasswordAdminSchema,
} from '../validations/auth.validations';
import * as authService from '../services/auth.service';
import prisma from '../config/database';

// GET /api/usuarios?orden=&direccion=
export const listarUsuarios = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const usuarios = await authService.listarUsuarios();
        res.json({ success: true, message: 'Usuarios obtenidos', data: usuarios, total: usuarios.length });
    } catch (err) {
        next(err);
    }
};

// GET /api/usuarios/:id
export const obtenerUsuario = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idUsuario = Number(req.params.id);
        const usuario   = await authService.obtenerUsuarioPorId(idUsuario);
        res.json({ success: true, message: 'Usuario obtenido', data: usuario });
    } catch (err) {
        next(err);
    }
};

// POST /api/usuarios
export const crearUsuario = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos   = crearUsuarioSchema.parse(req.body);
        const usuario = await authService.crearUsuario(datos);
        res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: usuario });
    } catch (err) {
        next(err);
    }
};

// PUT /api/usuarios/:id
export const actualizarUsuario = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idUsuario = Number(req.params.id);
        const datos     = actualizarUsuarioSchema.parse(req.body);
        const usuario   = await authService.actualizarUsuario(idUsuario, datos);
        res.json({ success: true, message: 'Usuario actualizado exitosamente', data: usuario });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/usuarios/:id
export const eliminarUsuario = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idUsuario = Number(req.params.id);
        if (idUsuario === req.usuario!.idUsuario) {
            res.status(400).json({ success: false, message: 'No puedes eliminar tu propio usuario', data: null });
            return;
        }
        await authService.eliminarUsuario(idUsuario);
        res.json({ success: true, message: 'Usuario eliminado exitosamente', data: null });
    } catch (err) {
        next(err);
    }
};

// GET /api/usuarios/:id/torneos — torneos donde el usuario es adminTorneo activo
export const getTorneosAsignados = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idUsuario = Number(req.params.id);
        if (isNaN(idUsuario)) {
            res.status(400).json({ success: false, message: 'ID de usuario inválido', data: null });
            return;
        }
        const asignaciones = await prisma.usuarioTorneo.findMany({
            where: { idUsuario, activo: true },
            include: {
                torneo: {
                    select: {
                        idTorneo: true,
                        nombre: true,
                        fecha: true,
                        lugar: true,
                        estado: true,
                        activo: true,
                        es_actual: true,
                    },
                },
            },
            orderBy: { fechaAsignacion: 'desc' },
        });
        const torneos = asignaciones.map(a => ({ ...a.torneo, idUsuarioTorneo: a.idUsuarioTorneo, fechaAsignacion: a.fechaAsignacion }));
        res.json({ success: true, message: 'Torneos asignados obtenidos', data: torneos, total: torneos.length });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/usuarios/:id/cambiar-password
export const cambiarPassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idUsuario        = Number(req.params.id);
        const { passwordActual, passwordNuevo } = cambiarPasswordAdminSchema.parse(req.body);
        await authService.cambiarPassword(idUsuario, {
            password_actual:    passwordActual,
            password_nueva:     passwordNuevo,
            confirmar_password: passwordNuevo,
        });
        res.json({ success: true, message: 'Contraseña actualizada exitosamente', data: null });
    } catch (err) {
        next(err);
    }
};
