import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { actualizarConfigSchema } from '../validations/config.validations';
import * as configService from '../services/config.service';

// GET /api/config
// Público — el frontend necesita datos del comité (nombre, redes, etc.)
export const obtenerConfig = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const config = await configService.obtenerConfig();

        // Para respuesta pública omitir campos sensibles
        const { zona_horaria, nombreComite, descripcion,
                facebook, instagram, twitter, youtube,
                whatsapp, telefono, email, ciudad, estado, pais } = config;

        res.json({
            ok: true,
            data: {
                nombreComite, descripcion, telefono, email,
                ciudad, estado, pais,
                redes: { facebook, instagram, twitter, youtube, whatsapp },
                zona_horaria: {
                    nombreZona:    zona_horaria?.nombreZona,
                    nombreMostrar: zona_horaria?.nombreMostrar,
                    offsetUTC:     zona_horaria?.offsetUTC,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/config/completa — solo adminGral (incluye diasAutoDesactivar, extras, etc.)
export const obtenerConfigCompleta = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const config = await configService.obtenerConfig();
        res.json({ ok: true, data: config });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/config — solo adminGral
export const actualizarConfig = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos  = actualizarConfigSchema.parse(req.body);
        const config = await configService.actualizarConfig(datos);
        res.json({ ok: true, mensaje: 'Configuración actualizada', data: config });
    } catch (err) {
        next(err);
    }
};

// ── Catálogos ─────────────────────────────────────────────────
// Todos públicos — el frontend los usa para los formularios de inscripción

export const listarZonasHorarias = async (
    _req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const data = await configService.listarZonasHorarias();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const listarCategorias = async (
    _req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const data = await configService.listarCategorias();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const listarRitmosJuego = async (
    _req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const data = await configService.listarRitmosJuego();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const listarSistemasCompetencia = async (
    _req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const data = await configService.listarSistemasCompetencia();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const listarSistemasDesempate = async (
    _req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const data = await configService.listarSistemasDesempate();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const listarSistemasPago = async (
    _req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const data = await configService.listarSistemasPago();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};

export const listarPatrocinadores = async (
    _req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const data = await configService.listarPatrocinadores();
        res.json({ ok: true, data });
    } catch (err) { next(err); }
};