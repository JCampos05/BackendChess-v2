import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as service from '../services/inscripcion-admin.service';

export const crear = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { tipo, ...datos } = req.body;

        if (!tipo || (tipo !== 'torneo' && tipo !== 'liga')) {
            res.status(400).json({ ok: false, mensaje: 'El tipo debe ser "torneo" o "liga"' });
            return;
        }

        if (tipo === 'torneo') {
            const data = await service.inscribirEnTorneo(datos);
            res.status(201).json({ ok: true, tipo: 'torneo', data });
        } else {
            const data = await service.inscribirEnLiga(datos);
            res.status(201).json({ ok: true, tipo: 'liga', data });
        }
    } catch (err) { next(err); }
};

export const getEventosActivos = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await service.getEventosActivos();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getCategoriasByTorneo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        if (isNaN(idTorneo)) {
            res.status(400).json({ ok: false, mensaje: 'ID de torneo inválido' });
            return;
        }
        const data = await service.getCategoriasByTorneo(idTorneo);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getGruposByLiga = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idLiga = Number(req.params.idLiga);
        if (isNaN(idLiga)) {
            res.status(400).json({ ok: false, mensaje: 'ID de liga inválido' });
            return;
        }
        const data = await service.getGruposByLiga(idLiga);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const buscarJugador = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const q = String(req.query.q ?? '').trim();
        if (q.length < 2) {
            res.status(400).json({ ok: false, mensaje: 'El parámetro q debe tener al menos 2 caracteres' });
            return;
        }
        const data = await service.buscarJugadorSimilar(q);
        res.json({ ok: true, total: data.length, data });
    } catch (err) { next(err); }
};