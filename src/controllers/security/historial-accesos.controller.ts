import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import * as historialService from '../../services/security/historial-acceso.service';
import { filtrosHistorialSchema } from '../../validations/security/seguridad.validations';

// GET /api/seguridad/historial
export const getAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const filtros = filtrosHistorialSchema.parse(req.query);
        const resultado = await historialService.listarHistorial(filtros);
        res.json({ ok: true, ...resultado });
    } catch (err) {
        next(err);
    }
};

// GET /api/seguridad/historial/estadisticas
export const getEstadisticas = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { fechaInicio, fechaFin } = req.query as Record<string, string | undefined>;
        const data = await historialService.obtenerEstadisticas(fechaInicio, fechaFin);
        res.json({ ok: true, data });
    } catch (err) {
        next(err);
    }
};