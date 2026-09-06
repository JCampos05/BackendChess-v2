import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as svc from '../services/inscripcion-publica.service';
import { inscribirPublicoSchema, buscarJugadorPublicoSchema } from '../validations/inscripcion-publica.validations';

const zodFail = (res: Response, error: ZodError): void => {
    const errores = error.errors.map(e =>
        e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message
    );
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};

// GET /api/inscripciones-publicas/torneo/:idTorneo/categorias
export const obtenerCategorias = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        if (isNaN(idTorneo)) {
            res.status(400).json({ ok: false, mensaje: 'ID de torneo inválido' });
            return;
        }
        const categorias = await svc.listarCategoriasPublicas(idTorneo);
        res.json({ ok: true, data: categorias });
    } catch (err) { next(err); }
};

// GET /api/inscripciones-publicas/buscar-jugador?q=termino
export const buscarJugador = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parse = buscarJugadorPublicoSchema.safeParse(req.query);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const jugadores = await svc.buscarJugadorPublico(parse.data.q);
        res.json({ ok: true, data: jugadores });
    } catch (err) { next(err); }
};

// POST /api/inscripciones-publicas
export const crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parse = inscribirPublicoSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const inscripcion = await svc.inscribirPublico(parse.data);
        res.status(201).json({ ok: true, mensaje: 'Inscripción registrada', data: inscripcion });
    } catch (err) { next(err); }
};
