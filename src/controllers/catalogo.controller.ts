import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as CatSvc from '../services/catalogo.service';

// ════════════════════════════════════════════════════════════
// CATEGORÍA
// ════════════════════════════════════════════════════════════

export const getAllCategorias = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { orden = 'nombre', direccion = 'asc' } = req.query as Record<string, string>;
        const data = await CatSvc.getAllCategorias(orden, direccion as 'asc' | 'desc');
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

export const getCategoriaById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await CatSvc.getCategoriaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const createCategoria = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { nombre, costo, nota, edadMinima, edadMaxima } = req.body;
        const data = await CatSvc.createCategoria({
            nombre,
            costo: parseFloat(costo),
            nota,
            edadMinima: edadMinima != null && edadMinima !== '' ? parseInt(edadMinima) : null,
            edadMaxima: edadMaxima != null && edadMaxima !== '' ? parseInt(edadMaxima) : null,
        });
        res.status(201).json({ ok: true, mensaje: 'Categoría creada exitosamente', data });
    } catch (e) { next(e); }
};

export const updateCategoria = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { nombre, costo, nota, edadMinima, edadMaxima } = req.body;
        const data = await CatSvc.updateCategoria(parseInt(req.params.id), {
            ...(nombre !== undefined && { nombre }),
            ...(costo !== undefined && { costo: parseFloat(costo) }),
            ...(nota !== undefined && { nota }),
            ...(edadMinima !== undefined && {
                edadMinima: edadMinima != null && edadMinima !== '' ? parseInt(edadMinima) : null,
            }),
            ...(edadMaxima !== undefined && {
                edadMaxima: edadMaxima != null && edadMaxima !== '' ? parseInt(edadMaxima) : null,
            }),
        });
        res.json({ ok: true, mensaje: 'Categoría actualizada exitosamente', data });
    } catch (e) { next(e); }
};

export const deleteCategoria = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await CatSvc.deleteCategoria(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Categoría eliminada exitosamente' });
    } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════
// RITMO DE JUEGO
// ════════════════════════════════════════════════════════════

export const getAllRitmos = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { activo, orden = 'minutos', direccion = 'asc' } = req.query as Record<string, string>;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await CatSvc.getAllRitmos(activoBool, orden, direccion as 'asc' | 'desc');
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

export const getRitmoById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await CatSvc.getRitmoById(parseInt(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const createRitmo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { nombre, descripcion, minutos, incremento, activo } = req.body;
        const data = await CatSvc.createRitmo({
            nombre,
            descripcion,
            minutos: parseInt(minutos),
            incremento: incremento !== undefined ? parseInt(incremento) : 0,
            activo: activo !== undefined ? Boolean(activo) : true,
        });
        res.status(201).json({ ok: true, mensaje: 'Ritmo de juego creado exitosamente', data });
    } catch (e) { next(e); }
};

export const updateRitmo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { nombre, descripcion, minutos, incremento, activo } = req.body;
        const data = await CatSvc.updateRitmo(parseInt(req.params.id), {
            ...(nombre !== undefined && { nombre }),
            ...(descripcion !== undefined && { descripcion }),
            ...(minutos !== undefined && { minutos: parseInt(minutos) }),
            ...(incremento !== undefined && { incremento: parseInt(incremento) }),
            ...(activo !== undefined && { activo: Boolean(activo) }),
        });
        res.json({ ok: true, mensaje: 'Ritmo de juego actualizado exitosamente', data });
    } catch (e) { next(e); }
};

export const deleteRitmo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await CatSvc.deleteRitmo(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Ritmo de juego eliminado exitosamente' });
    } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════
// SISTEMA DE COMPETENCIA
// ════════════════════════════════════════════════════════════

export const getAllSistemasCompetencia = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { activo, orden = 'nombre', direccion = 'asc' } = req.query as Record<string, string>;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await CatSvc.getAllSistemasCompetencia(activoBool, orden, direccion as 'asc' | 'desc');
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

export const getSistemaCompetenciaById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await CatSvc.getSistemaCompetenciaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const createSistemaCompetencia = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const data = await CatSvc.createSistemaCompetencia({
            nombre, descripcion, activo: activo !== undefined ? Boolean(activo) : true,
        });
        res.status(201).json({ ok: true, mensaje: 'Sistema de competencia creado exitosamente', data });
    } catch (e) { next(e); }
};

export const updateSistemaCompetencia = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const data = await CatSvc.updateSistemaCompetencia(parseInt(req.params.id), {
            ...(nombre !== undefined && { nombre }),
            ...(descripcion !== undefined && { descripcion }),
            ...(activo !== undefined && { activo: Boolean(activo) }),
        });
        res.json({ ok: true, mensaje: 'Sistema de competencia actualizado exitosamente', data });
    } catch (e) { next(e); }
};

export const deleteSistemaCompetencia = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await CatSvc.deleteSistemaCompetencia(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Sistema de competencia eliminado exitosamente' });
    } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════
// SISTEMA DE DESEMPATE
// ════════════════════════════════════════════════════════════

export const getAllSistemasDesempate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { activo, orden = 'nombre', direccion = 'asc' } = req.query as Record<string, string>;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await CatSvc.getAllSistemasDesempate(activoBool, orden, direccion as 'asc' | 'desc');
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

export const getSistemaDesempateById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await CatSvc.getSistemaDesempateById(parseInt(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const createSistemaDesempate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const data = await CatSvc.createSistemaDesempate({
            nombre, descripcion, activo: activo !== undefined ? Boolean(activo) : true,
        });
        res.status(201).json({ ok: true, mensaje: 'Sistema de desempate creado exitosamente', data });
    } catch (e) { next(e); }
};

export const updateSistemaDesempate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const data = await CatSvc.updateSistemaDesempate(parseInt(req.params.id), {
            ...(nombre !== undefined && { nombre }),
            ...(descripcion !== undefined && { descripcion }),
            ...(activo !== undefined && { activo: Boolean(activo) }),
        });
        res.json({ ok: true, mensaje: 'Sistema de desempate actualizado exitosamente', data });
    } catch (e) { next(e); }
};

export const deleteSistemaDesempate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await CatSvc.deleteSistemaDesempate(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Sistema de desempate eliminado exitosamente' });
    } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════
// SISTEMA DE PAGO
// ════════════════════════════════════════════════════════════

export const getAllSistemasPago = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { activo } = req.query as Record<string, string>;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await CatSvc.getAllSistemasPago(activoBool);
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

export const getSistemasPagoActivos = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await CatSvc.getSistemasPagoActivos();
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

export const getSistemaPagoById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await CatSvc.getSistemaPagoById(parseInt(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const createSistemaPago = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await CatSvc.createSistemaPago(req.body);
        res.status(201).json({ ok: true, mensaje: 'Sistema de pago creado exitosamente', data });
    } catch (e) { next(e); }
};

export const updateSistemaPago = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await CatSvc.updateSistemaPago(parseInt(req.params.id), req.body);
        res.json({ ok: true, mensaje: 'Sistema de pago actualizado exitosamente', data });
    } catch (e) { next(e); }
};

export const deleteSistemaPago = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await CatSvc.deleteSistemaPago(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Sistema de pago eliminado exitosamente' });
    } catch (e) { next(e); }
};

export const toggleActiveSistemaPago = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { activo } = req.body;
        const data = await CatSvc.toggleActiveSistemaPago(
            parseInt(req.params.id),
            activo !== undefined ? Boolean(activo) : undefined,
        );
        res.json({
            ok: true,
            mensaje: `Sistema de pago ${data.activo ? 'activado' : 'desactivado'} exitosamente`,
            data,
        });
    } catch (e) { next(e); }
};