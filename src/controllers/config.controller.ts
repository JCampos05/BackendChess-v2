import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { actualizarConfigSchema, actualizarLimitesSchema, actualizarRitmosFideSchema } from '../validations/config.validations';
import * as ritmosRatingService from '../services/ritmo-rating-config.service';
import * as limitesService from '../services/rate-limit-config.service';
import { loggerService } from '../services/security/logger.service';
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

// GET /api/config/limites — solo adminGral. Límites de peticiones vigentes, con su origen y rango permitido.
export const obtenerLimites = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        res.json({ ok: true, data: await limitesService.obtenerLimitesParaPanel() });
    } catch (err) {
        next(err);
    }
};

// PUT /api/config/limites — solo adminGral. Cambia los límites y lo deja asentado en la bitácora.
export const actualizarLimites = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const cambios = actualizarLimitesSchema.parse(req.body);
        const { antes, despues } = await limitesService.guardarLimites(cambios);

        await loggerService.info(
            'actualizar_limites',
            'config_limites',
            1,
            `Límites de peticiones: antes ${JSON.stringify(antes)}, ahora ${JSON.stringify(despues)}`,
            req.usuario?.idUsuario,
            req
        );

        res.json({ ok: true, mensaje: 'Límites actualizados', data: await limitesService.obtenerLimitesParaPanel() });
    } catch (err) {
        next(err);
    }
};

// GET /api/config/ritmos-fide — solo adminGral. Lineamientos vigentes de clasificación de ritmos (blitz/rápido/estándar).
export const obtenerRitmosFide = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        res.json({ ok: true, data: await ritmosRatingService.obtenerUmbralesParaPanel() });
    } catch (err) {
        next(err);
    }
};

// PUT /api/config/ritmos-fide — solo adminGral. Cambia los lineamientos (o los restablece) y lo asienta en la bitácora.
export const actualizarRitmosFide = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = actualizarRitmosFideSchema.parse(req.body);
        const { antes, despues } = await ritmosRatingService.guardarUmbrales(
            'restablecer' in datos ? null : { blitzMaximo: datos.blitzMaximo, rapidoMaximo: datos.rapidoMaximo }
        );

        await loggerService.info(
            'actualizar_ritmos_fide',
            'config_ritmos_fide',
            1,
            `Lineamientos de ritmos: antes ${JSON.stringify(antes)}, ahora ${JSON.stringify(despues)}`,
            req.usuario?.idUsuario,
            req
        );

        res.json({ ok: true, mensaje: 'Lineamientos actualizados', data: await ritmosRatingService.obtenerUmbralesParaPanel() });
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