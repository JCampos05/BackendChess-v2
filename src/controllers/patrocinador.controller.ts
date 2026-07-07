import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as svc from '../services/patrocinador.service';

// GET /api/patrocinadores?activo=true|false
export const listar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { activo } = req.query as Record<string, string>;
        const activoBool = activo !== undefined ? activo === 'true' || activo === '1' : undefined;
        const data = await svc.listar(activoBool);
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

// GET /api/patrocinadores/:id
export const obtener = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await svc.obtenerPorId(Number(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

// POST /api/patrocinadores
export const crear = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { nombre, logo_url, sitio_web, descripcion, contacto, activo } = req.body;
        if (!nombre?.trim()) {
            res.status(400).json({ ok: false, mensaje: 'El nombre es obligatorio' });
            return;
        }
        const data = await svc.crear({ nombre: nombre.trim(), logo_url, sitio_web, descripcion, contacto, activo });
        res.status(201).json({ ok: true, mensaje: 'Patrocinador creado exitosamente', data });
    } catch (e) { next(e); }
};

// PUT /api/patrocinadores/:id
export const actualizar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { nombre, logo_url, sitio_web, descripcion, contacto, activo } = req.body;
        const data = await svc.actualizar(Number(req.params.id), {
            ...(nombre !== undefined && { nombre: nombre.trim() }),
            ...(logo_url !== undefined && { logo_url }),
            ...(sitio_web !== undefined && { sitio_web }),
            ...(descripcion !== undefined && { descripcion }),
            ...(contacto !== undefined && { contacto }),
            ...(activo !== undefined && { activo }),
        });
        res.json({ ok: true, mensaje: 'Patrocinador actualizado exitosamente', data });
    } catch (e) { next(e); }
};

// DELETE /api/patrocinadores/:id
export const eliminar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        await svc.eliminar(Number(req.params.id));
        res.json({ ok: true, mensaje: 'Patrocinador eliminado exitosamente' });
    } catch (e) { next(e); }
};

// PATCH /api/patrocinadores/:id/toggle
export const toggle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await svc.toggleActivo(Number(req.params.id));
        res.json({ ok: true, mensaje: `Patrocinador ${data.activo ? 'activado' : 'desactivado'}`, data });
    } catch (e) { next(e); }
};
