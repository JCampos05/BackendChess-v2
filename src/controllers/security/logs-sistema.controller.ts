import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import * as logsService from '../../services/security/logs-sistema.service';
import { filtrosLogsSchema } from '../../validations/security/seguridad.validations';

// GET /api/seguridad/logs
export const getAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const filtros = filtrosLogsSchema.parse(req.query);
        const resultado = await logsService.listarLogs(filtros);
        res.json({ ok: true, ...resultado });
    } catch (err) {
        next(err);
    }
};

// GET /api/seguridad/logs/estadisticas
export const getEstadisticas = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { fechaInicio, fechaFin } = req.query as Record<string, string | undefined>;
        const data = await logsService.obtenerEstadisticas(fechaInicio, fechaFin);
        res.json({ ok: true, data });
    } catch (err) {
        next(err);
    }
};

// GET /api/seguridad/logs/:entidad/:idEntidad
export const getByEntidad = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { entidad } = req.params;
        const idEntidad = Number(req.params.idEntidad);
        if (isNaN(idEntidad)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido', code: 'INVALID_ID' });
            return;
        }
        const logs = await logsService.obtenerPorEntidad(entidad, idEntidad);
        res.json({ ok: true, data: logs, total: logs.length });
    } catch (err) {
        next(err);
    }
};