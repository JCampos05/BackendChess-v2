import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as service from '../services/estadisticas-pago.service';
import { ForbiddenError } from '../middleware/error.middleware';

const parseIdTorneo = (val: unknown): number | undefined => {
    const n = Number(val);
    return val && val !== 'null' && !isNaN(n) ? n : undefined;
};

/**
 * Para adminTorneo, acota las estadísticas a los torneos que tiene
 * asignados: si pide un `idTorneo` puntual que no le pertenece, se
 * rechaza; si no pide ninguno (vista "todos los torneos"), se agregan
 * solo los suyos en vez de los de todo el sistema. adminGral no tiene
 * restricción.
 */
const resolverScopeTorneo = async (
    req: AuthRequest,
    idTorneo: number | undefined
): Promise<{ idTorneo?: number; idTorneoIn?: number[] }> => {
    if (req.usuario?.rol !== 'adminTorneo') {
        return { idTorneo };
    }

    const asignados = await service.obtenerTorneosAsignados(req.usuario.idUsuario);

    if (idTorneo !== undefined) {
        if (!asignados.includes(idTorneo)) {
            throw new ForbiddenError('No tienes acceso a las estadísticas de este torneo');
        }
        return { idTorneo };
    }

    return { idTorneoIn: asignados };
};

export const getEstadisticasGenerales = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const scope = await resolverScopeTorneo(req, parseIdTorneo(req.query.idTorneo));
        const data = await service.getEstadisticasGenerales({
            ...scope,
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
        const scope = await resolverScopeTorneo(req, parseIdTorneo(req.query.idTorneo));
        const data = await service.getEstadisticasPorCategoria({
            ...scope,
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
        const scope = await resolverScopeTorneo(req, parseIdTorneo(req.query.idTorneo));
        const data = await service.getEstadisticasPorTorneo({
            ...scope,
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
        const scope = await resolverScopeTorneo(req, parseIdTorneo(req.query.idTorneo));
        const data = await service.getEvolucionTemporal({
            ...scope,
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
        const scope = await resolverScopeTorneo(req, parseIdTorneo(req.query.idTorneo));
        const data = await service.getComparativaAnual(scope);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};
