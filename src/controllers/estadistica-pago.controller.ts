import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as service from '../services/estadisticas-pago.service';

const parseIdTorneo = (val: unknown): number | undefined => {
    const n = Number(val);
    return val && val !== 'null' && !isNaN(n) ? n : undefined;
};

export const getEstadisticasGenerales = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await service.getEstadisticasGenerales({
            idTorneo: parseIdTorneo(req.query.idTorneo),
            fechaInicio: req.query.fecha_inicio as string | undefined,
            fechaFin: req.query.fecha_fin as string | undefined,
        });
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getEstadisticasPorCategoria = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await service.getEstadisticasPorCategoria({
            idTorneo: parseIdTorneo(req.query.idTorneo),
            fechaInicio: req.query.fecha_inicio as string | undefined,
            fechaFin: req.query.fecha_fin as string | undefined,
        });
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getEstadisticasPorTorneo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await service.getEstadisticasPorTorneo({
            idTorneo: parseIdTorneo(req.query.idTorneo),
            fechaInicio: req.query.fecha_inicio as string | undefined,
            fechaFin: req.query.fecha_fin as string | undefined,
        });
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getEvolucionTemporal = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await service.getEvolucionTemporal({
            idTorneo: parseIdTorneo(req.query.idTorneo),
            fechaInicio: req.query.fecha_inicio as string | undefined,
            fechaFin: req.query.fecha_fin as string | undefined,
            agrupacion: req.query.agrupacion as 'dia' | 'semana' | 'mes' | 'anio' | undefined,
        });
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getComparativaAnual = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await service.getComparativaAnual({
            idTorneo: parseIdTorneo(req.query.idTorneo),
        });
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};