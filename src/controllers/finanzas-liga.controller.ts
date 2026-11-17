import { Request, Response, NextFunction } from 'express';
import * as service from '../services/finanzas-liga.service';
import { ValidationError } from '../middleware/error.middleware';

export const getResumen = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json({ ok: true, data: await service.getResumenLigas() });
    } catch (err) { next(err); }
};

export const getDetalle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.idLiga);
        if (!Number.isInteger(idLiga) || idLiga <= 0) throw new ValidationError('Liga inválida');
        res.json({ ok: true, data: await service.getDetalleLiga(idLiga) });
    } catch (err) { next(err); }
};
