import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ZodError } from 'zod';
import * as torneoService from '../services/torneo.service';
import {
    crearTorneoSchema,
    actualizarTorneoSchema,
    cambiarEstadoSchema,
    filtrosTorneoSchema,
    asignarCategoriaSchema,
    actualizarCategoriaSchema,
    asignarPatrocinadorSchema,
    asignarAdminSchema,
} from '../validations/torneo.validation';

// Helper local — convierte ZodError en respuesta 400
const zodFail = (res: Response, error: ZodError): void => {
    const errores = error.errors.map(e =>
        e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message
    );
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};

// ── Público — sin autenticación ───────────────────────────────

// GET /api/torneos/publicos
// Devuelve torneos activos y publicados para la landing page
export const listarTorneosPublicos = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const resultado = await torneoService.listarTorneos({
            pagina:  1,
            limite:  10,
            activo:  true,
            es_actual: true,
        });
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    } catch (err) { next(err); }
};

// GET /api/torneos/activos
// Devuelve todos los torneos activos (para el frontend autenticado)
export const listarTorneosActivos = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const resultado = await torneoService.listarTorneos({
            pagina:  1,
            limite:  100,
            activo:  true,
        });
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    } catch (err) { next(err); }
};

// GET /api/torneos/proximos
// Devuelve torneos próximos a ocurrir
export const listarTorneosProximos = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const resultado = await torneoService.listarTorneos({
            pagina:  1,
            limite:  50,
            activo:  true,
        });
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    } catch (err) { next(err); }
};

// GET /api/torneos/todos
// Devuelve TODOS los torneos (incluyendo inactivos y pasados)
export const listarTodosTorneos = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const resultado = await torneoService.listarTorneos({
            pagina:  1,
            limite:  1000,
        });
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    } catch (err) { next(err); }
};

// ── Torneos CRUD ──────────────────────────────────────────────

export const listarTorneos = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const parse = filtrosTorneoSchema.safeParse(req.query);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const resultado = await torneoService.listarTorneos(parse.data);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

export const obtenerTorneo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.id);
        const torneo   = await torneoService.obtenerTorneoPorId(idTorneo);
        res.json({ ok: true, data: torneo });
    } catch (err) { next(err); }
};

export const crearTorneo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const parse = crearTorneoSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const torneo = await torneoService.crearTorneo(parse.data);
        res.status(201).json({ ok: true, data: torneo });
    } catch (err) { next(err); }
};

export const actualizarTorneo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse    = actualizarTorneoSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const torneo = await torneoService.actualizarTorneo(idTorneo, parse.data);
        res.json({ ok: true, data: torneo });
    } catch (err) { next(err); }
};

export const eliminarTorneo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo  = Number(req.params.id);
        const resultado = await torneoService.eliminarTorneo(idTorneo);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

// ── Estado ────────────────────────────────────────────────────

export const cambiarEstado = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse    = cambiarEstadoSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const torneo = await torneoService.cambiarEstado(idTorneo, parse.data);
        res.json({ ok: true, data: torneo });
    } catch (err) { next(err); }
};

export const toggleActivo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo  = Number(req.params.id);
        const activo    = Boolean(req.body.activo);
        const resultado = await torneoService.toggleActivo(idTorneo, activo);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

export const toggleEsActual = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo  = Number(req.params.id);
        const es_actual = Boolean(req.body.es_actual);
        const resultado = await torneoService.toggleEsActual(idTorneo, es_actual);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

// ── Categorías ────────────────────────────────────────────────

export const asignarCategoria = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse    = asignarCategoriaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const resultado = await torneoService.asignarCategoria(idTorneo, parse.data);
        res.status(201).json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

export const actualizarCategoria = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo    = Number(req.params.id);
        const idCategoria = Number(req.params.idCategoria);
        const parse       = actualizarCategoriaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const resultado = await torneoService.actualizarCategoriaTorneo(
            idTorneo, idCategoria, parse.data
        );
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

export const desasignarCategoria = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo    = Number(req.params.id);
        const idCategoria = Number(req.params.idCategoria);
        const resultado   = await torneoService.desasignarCategoria(idTorneo, idCategoria);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

// ── Patrocinadores ────────────────────────────────────────────

export const listarPatrocinadores = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo  = Number(req.params.id);
        const resultado = await torneoService.listarPatrocinadoresTorneo(idTorneo);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

export const asignarPatrocinador = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse    = asignarPatrocinadorSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const resultado = await torneoService.asignarPatrocinador(idTorneo, parse.data);
        res.status(201).json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

export const removerPatrocinador = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo       = Number(req.params.id);
        const idPatrocinador = Number(req.params.idPatrocinador);
        const resultado      = await torneoService.removerPatrocinador(idTorneo, idPatrocinador);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

// ── Admins ────────────────────────────────────────────────────

export const asignarAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo = Number(req.params.id);
        const parse    = asignarAdminSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const resultado = await torneoService.asignarAdmin(idTorneo, parse.data);
        res.status(201).json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

export const removerAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const idTorneo  = Number(req.params.id);
        const idUsuario = Number(req.params.idUsuario);
        const resultado = await torneoService.removerAdmin(idTorneo, idUsuario);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};