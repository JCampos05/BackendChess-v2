import { Request, Response, NextFunction } from 'express';
import * as service from '../services/inscripciones-generales.service';

const PERIODOS = ['dia', 'semana', 'mes', 'anio'] as const;
type Periodo = typeof PERIODOS[number];

// Si no viene periodo (o viene vacío) no se filtra por fecha: se muestra el histórico real.
const parsePeriodo = (valor: unknown): Periodo | undefined => {
    if (valor === undefined || valor === '') return undefined;
    return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : undefined;
};

export const getResumenGeneral = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const periodo = parsePeriodo(req.query.periodo);
        const resumen = await service.obtenerResumenGeneral(periodo);
        res.json({ ok: true, data: resumen });
    } catch (err) { next(err); }
};

export const getEvolucionTemporal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const periodo = parsePeriodo(req.query.periodo);
        const evolucion = await service.obtenerEvolucionTemporal(periodo);
        res.json({ ok: true, data: evolucion });
    } catch (err) { next(err); }
};

export const getResumenTorneos = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const resumen = await service.obtenerResumenTorneos();
        res.json({ ok: true, data: resumen });
    } catch (err) { next(err); }
};

export const getInscripcionesPorTorneo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limite = req.query.limite ? Number(req.query.limite) : 10;
        const datos = await service.obtenerInscripcionesPorTorneo(limite);
        res.json({ ok: true, data: datos });
    } catch (err) { next(err); }
};

export const getDistribucionCategoria = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const datos = await service.obtenerDistribucionCategoria(idTorneo);
        res.json({ ok: true, data: datos });
    } catch (err) { next(err); }
};

export const getTorneosSelector = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const torneos = await service.obtenerTorneosParaSelector();
        res.json({ ok: true, data: torneos });
    } catch (err) { next(err); }
};
