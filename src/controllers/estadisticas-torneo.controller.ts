import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as service from '../services/estadisticas-torneo.service';

// ── Públicas ─────────────────────────────────────────────────

export const getListaInicialPublica = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const data = await service.getListaInicialPublica(idTorneo, idTorneoCategoria);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getRankingFinalPublico = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const result = await service.getRankingFinalPublico(idTorneo, idTorneoCategoria);
        res.json({ ok: true, data: result.ranking, sistemasDesempate: result.sistemasDesempate });
    } catch (err) { next(err); }
};

// ── Protegidas ───────────────────────────────────────────────

export const getAllEstadisticas = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await service.getAllEstadisticas();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getEstadisticasByTorneo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const data = await service.getEstadisticasByTorneo(idTorneo);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getEstadisticasByTorneoCategoria = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const data = await service.getEstadisticasByTorneoCategoria(idTorneo, idTorneoCategoria);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const getEstadisticasByTorneoCategoriaHastaRonda = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const numeroRonda = Number(req.params.numeroRonda);
        const data = await service.getEstadisticasHastaRonda(idTorneo, idTorneoCategoria, numeroRonda);
        res.json({ ok: true, data, numeroRonda });
    } catch (err) { next(err); }
};

export const getEstadisticaByJugador = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idJugador = Number(req.params.idJugador);
        const idTorneo = Number(req.params.idTorneo);
        const data = await service.getEstadisticaByJugador(idJugador, idTorneo);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const createEstadistica = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { idJugador, idTorneo, idTorneoCategoria } = req.body;
        if (!idJugador || !idTorneo || !idTorneoCategoria) {
            res.status(400).json({ ok: false, mensaje: 'Faltan campos: idJugador, idTorneo, idTorneoCategoria' });
            return;
        }
        const data = await service.createEstadistica(req.body);
        res.status(201).json({ ok: true, data });
    } catch (err) { next(err); }
};

export const updateEstadistica = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idEstadistica = Number(req.params.id);
        const data = await service.updateEstadistica(idEstadistica, req.body);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const deleteEstadistica = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idEstadistica = Number(req.params.id);
        const data = await service.deleteEstadistica(idEstadistica);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const recalcularPosiciones = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const idTorneoCategoria = Number(req.params.idTorneoCategoria);
        const data = await service.recalcularPosiciones(idTorneo, idTorneoCategoria);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const cargarRankingFinal = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { idTorneo, idTorneoCategoria, jugadores } = req.body;
        if (!idTorneo || !idTorneoCategoria || !Array.isArray(jugadores)) {
            res.status(400).json({ ok: false, mensaje: 'Faltan: idTorneo, idTorneoCategoria, jugadores[]' });
            return;
        }
        const data = await service.cargarRankingFinal(idTorneo, idTorneoCategoria, jugadores);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};