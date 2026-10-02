import { Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AuthRequest } from '../types';
import * as service from '../services/comprobantes.service';

const filtrosSchema = z.object({
    tipo:   z.enum(['todos', 'torneo', 'liga']).default('todos'),
    q:      z.string().trim().max(100).optional(),
    folio:  z.enum(['todos', 'con', 'sin']).default('todos'),
    pago:   z.enum(['todos', 'confirmado', 'pendiente']).default('todos'),
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(20),
});

const emitirSchema = z.object({
    tipo:       z.enum(['torneo', 'liga']),
    idRegistro: z.number().int().positive(),
});

const zodFail = (res: Response, error: ZodError): void => {
    const errores = error.errors.map(e => (e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message));
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};

// GET /api/comprobantes
export const listar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = filtrosSchema.safeParse(req.query);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const data = await service.listarComprobantes(parse.data);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

// GET /api/comprobantes/resumen
export const resumen = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        res.json({ ok: true, data: await service.resumenComprobantes() });
    } catch (err) { next(err); }
};

// POST /api/comprobantes/emitir
export const emitir = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = emitirSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const data = await service.emitirFolio(parse.data.tipo, parse.data.idRegistro);
        res.status(201).json({ ok: true, mensaje: 'Folio emitido', data });
    } catch (err) { next(err); }
};
