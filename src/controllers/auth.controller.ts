import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
    loginSchema,
    cambiarPasswordSchema,
    crearUsuarioSchema,
} from '../validations/auth.validations';
import * as authService from '../services/auth.service';

// POST /api/seguridad/login
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos     = loginSchema.parse(req.body);
        const ip        = (req.headers['x-forwarded-for'] as string) ?? req.ip ?? '';
        const userAgent = req.headers['user-agent'] ?? '';

        const resultado = await authService.login(datos, ip, userAgent);
        res.json({ ok: true, mensaje: 'Sesión iniciada', data: resultado });
    } catch (err) {
        next(err);
    }
};

// POST /api/seguridad/logout
export const logout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ip        = (req.headers['x-forwarded-for'] as string) ?? req.ip ?? '';
        const userAgent = req.headers['user-agent'] ?? '';

        // authService.logout recibe (token, idUsuario, ip, userAgent)
        const resultado = await authService.logout(
            req.token!,
            req.usuario!.idUsuario,
            ip,
            userAgent
        );
        res.json({ ok: true, data: resultado });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/seguridad/password
export const cambiarPassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos     = cambiarPasswordSchema.parse(req.body);
        const resultado = await authService.cambiarPassword(req.usuario!.idUsuario, datos);
        res.json({ ok: true, data: resultado });
    } catch (err) {
        next(err);
    }
};

// POST /api/seguridad/usuarios — solo adminGral
export const crearUsuario = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos   = crearUsuarioSchema.parse(req.body);
        const usuario = await authService.crearUsuario(datos);
        res.status(201).json({ ok: true, mensaje: 'Usuario creado', data: usuario });
    } catch (err) {
        next(err);
    }
};

// GET /api/seguridad/usuarios — solo adminGral
export const listarUsuarios = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const usuarios = await authService.listarUsuarios();
        res.json({ ok: true, data: usuarios, total: usuarios.length });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/seguridad/usuarios/:id/toggle — solo adminGral
export const toggleUsuario = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idUsuario = Number(req.params.id);
        if (isNaN(idUsuario)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        if (idUsuario === req.usuario!.idUsuario) {
            res.status(400).json({ ok: false, mensaje: 'No puedes desactivar tu propia cuenta' });
            return;
        }
        const { activo } = req.body as { activo: boolean };
        const usuario    = await authService.toggleUsuario(idUsuario, activo);
        if (!usuario) {
            res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
            return;
        }
        res.json({ ok: true, mensaje: `Usuario ${activo ? 'activado' : 'desactivado'}`, data: usuario });
    } catch (err) {
        next(err);
    }
};

// GET /api/seguridad/sesiones
export const misSesiones = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const sesiones = await authService.obtenerSesiones(req.usuario!.idUsuario);
        res.json({ ok: true, data: sesiones });
    } catch (err) {
        next(err);
    }
};