import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import * as sesionesService from '../../services/security/sesiones-activas.service';

// GET /api/seguridad/sesiones/activas
export const getActivas = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const sesiones = await sesionesService.obtenerActivas();
        res.json({ ok: true, data: sesiones, total: sesiones.length });
    } catch (err) {
        next(err);
    }
};

// GET /api/seguridad/sesiones/usuario/:idUsuario
export const getByUsuario = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idUsuario = Number(req.params.idUsuario);
        if (isNaN(idUsuario)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido', code: 'INVALID_ID' });
            return;
        }
        const sesiones = await sesionesService.obtenerPorUsuario(idUsuario);
        res.json({ ok: true, data: sesiones, total: sesiones.length });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/seguridad/sesiones/:idSesion
export const cerrarSesion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idSesion = Number(req.params.idSesion);
        if (isNaN(idSesion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido', code: 'INVALID_ID' });
            return;
        }
        await sesionesService.cerrarSesion(idSesion, req.token!, req.usuario!, req);
        res.json({ ok: true, mensaje: 'Sesión cerrada exitosamente' });
    } catch (err) {
        next(err);
    }
};

// POST /api/seguridad/sesiones/usuario/:idUsuario/cerrar-todas
export const cerrarTodasUsuario = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idUsuario = Number(req.params.idUsuario);
        if (isNaN(idUsuario)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido', code: 'INVALID_ID' });
            return;
        }
        const { confirmar } = req.body as { confirmar?: boolean };
        const count = await sesionesService.cerrarTodasDeUsuario(
            idUsuario,
            req.token!,
            req.usuario!,
            confirmar,
            req
        );
        res.json({
            ok: true,
            mensaje: `${count} sesión(es) cerrada(s) exitosamente`,
            sesionesCerradas: count,
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/seguridad/sesiones/limpiar-expiradas
export const limpiarExpiradas = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const count = await sesionesService.limpiarExpiradas(req.token!, req.usuario!, req);
        res.json({
            ok: true,
            mensaje: `${count} sesión(es) expirada(s) limpiada(s)`,
            sesionesLimpiadas: count,
        });
    } catch (err) {
        next(err);
    }
};