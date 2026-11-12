import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Verifica que un adminTorneo tenga acceso al torneo del parámetro de la ruta.
// adminGral siempre pasa — tiene acceso a todos los torneos.
// Por convención las rutas usan /:id — se puede pasar otro nombre si difiere.

export const verificarAccesoTorneo = (paramName = 'id') =>
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        if (!req.usuario) {
            res.status(401).json({ ok: false, mensaje: 'No autenticado', code: 'UNAUTHORIZED' });
            return;
        }

        // adminGral tiene acceso total
        if (req.usuario.rol === 'adminGral') {
            next();
            return;
        }

        const idTorneo = Number(req.params[paramName]);
        if (isNaN(idTorneo)) {
            res.status(400).json({ ok: false, mensaje: 'ID de torneo inválido', code: 'INVALID_ID' });
            return;
        }

        try {
            await _verificarAsignacion(req.usuario.idUsuario, idTorneo, res, next);
        } catch {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al verificar acceso al torneo',
                code: 'AUTH_ERROR',
            });
        }
    };

// Variante para rutas cuyo parámetro NO es directamente el idTorneo (ej. :idRonda,
// :idMesa, :idPartida) — resuelve el idTorneo vía un lookup a Prisma antes de
// aplicar el mismo chequeo de asignación que verificarAccesoTorneo.
export const verificarAccesoTorneoResuelto = (resolverIdTorneo: (req: AuthRequest) => Promise<number | null>) =>
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        if (!req.usuario) {
            res.status(401).json({ ok: false, mensaje: 'No autenticado', code: 'UNAUTHORIZED' });
            return;
        }

        if (req.usuario.rol === 'adminGral') {
            next();
            return;
        }

        try {
            const idTorneo = await resolverIdTorneo(req);
            if (idTorneo === null) {
                res.status(404).json({ ok: false, mensaje: 'Recurso no encontrado', code: 'NOT_FOUND' });
                return;
            }
            await _verificarAsignacion(req.usuario.idUsuario, idTorneo, res, next);
        } catch {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al verificar acceso al torneo',
                code: 'AUTH_ERROR',
            });
        }
    };

// ── Resolvers de idTorneo para recursos hijos ─────────────────

/**
 * idTorneo de un folio de comprobante. Los folios de liga (CMAA-L-…) devuelven null: un adminTorneo
 * no gestiona ligas, así que para él ese folio "no existe" (adminGral no pasa por el resolver).
 */
export const resolverIdTorneoDesdeFolio = async (req: AuthRequest): Promise<number | null> => {
    const folio = String(req.params.folio ?? '').trim().toUpperCase();
    if (!folio.startsWith('CMAA-T-')) return null;
    const inscripcion = await prisma.inscripcion.findUnique({
        where: { folio },
        select: { idTorneo: true },
    });
    return inscripcion?.idTorneo ?? null;
};

export const resolverIdTorneoDesdeSlug = async (req: AuthRequest): Promise<number | null> => {
    const torneo = await prisma.torneo.findUnique({
        where: { slug: req.params.slug },
        select: { idTorneo: true },
    });
    return torneo?.idTorneo ?? null;
};

export const resolverIdTorneoDesdeRonda = async (req: AuthRequest): Promise<number | null> => {
    const idRonda = Number(req.params.idRonda ?? req.params.id);
    if (isNaN(idRonda)) return null;
    const ronda = await prisma.ronda.findUnique({ where: { idRonda }, select: { idTorneo: true } });
    return ronda?.idTorneo ?? null;
};

export const resolverIdTorneoDesdeMesa = async (req: AuthRequest): Promise<number | null> => {
    const idMesa = Number(req.params.id);
    if (isNaN(idMesa)) return null;
    const mesa = await prisma.mesa.findUnique({
        where: { idMesa },
        select: { ronda: { select: { idTorneo: true } } },
    });
    return mesa?.ronda.idTorneo ?? null;
};

export const resolverIdTorneoDesdePartida = async (req: AuthRequest): Promise<number | null> => {
    const idPartida = Number(req.params.id);
    if (isNaN(idPartida)) return null;
    const partida = await prisma.partida.findUnique({
        where: { idPartida },
        select: { mesa: { select: { ronda: { select: { idTorneo: true } } } } },
    });
    return partida?.mesa.ronda.idTorneo ?? null;
};

/** idTorneo de una inscripción (parámetro :id). */
export const resolverIdTorneoDesdeInscripcion = async (req: AuthRequest): Promise<number | null> => {
    const idInscripcion = Number(req.params.id);
    if (isNaN(idInscripcion)) return null;
    const inscripcion = await prisma.inscripcion.findUnique({ where: { idInscripcion }, select: { idTorneo: true } });
    return inscripcion?.idTorneo ?? null;
};

/** idTorneo de una estadística de torneo (parámetro :id). */
export const resolverIdTorneoDesdeEstadistica = async (req: AuthRequest): Promise<number | null> => {
    const idEstadistica = Number(req.params.id);
    if (isNaN(idEstadistica)) return null;
    const estadistica = await prisma.estadisticaTorneo.findUnique({ where: { idEstadistica }, select: { idTorneo: true } });
    return estadistica?.idTorneo ?? null;
};

// ── Resolvers para rutas de CREACIÓN: el torneo no viene en la URL sino en el cuerpo de la petición ──

const aEnteroPositivo = (valor: unknown): number | null => {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
};

/** El cuerpo trae directamente `idTorneo` (o el campo indicado). */
export const resolverIdTorneoDesdeCuerpo = (campo = 'idTorneo') =>
    async (req: AuthRequest): Promise<number | null> => aEnteroPositivo(req.body?.[campo]);

/** El cuerpo trae `idRonda`: se busca a qué torneo pertenece. */
export const resolverIdTorneoDesdeCuerpoRonda = async (req: AuthRequest): Promise<number | null> => {
    const idRonda = aEnteroPositivo(req.body?.idRonda);
    if (!idRonda) return null;
    const ronda = await prisma.ronda.findUnique({ where: { idRonda }, select: { idTorneo: true } });
    return ronda?.idTorneo ?? null;
};

/** El cuerpo trae `idMesa`: se busca a qué torneo pertenece. */
export const resolverIdTorneoDesdeCuerpoMesa = async (req: AuthRequest): Promise<number | null> => {
    const idMesa = aEnteroPositivo(req.body?.idMesa);
    if (!idMesa) return null;
    const mesa = await prisma.mesa.findUnique({ where: { idMesa }, select: { ronda: { select: { idTorneo: true } } } });
    return mesa?.ronda.idTorneo ?? null;
};

/** El cuerpo trae `emparejamientos[]`: todos deben ser del mismo torneo (si no, se rechaza). */
export const resolverIdTorneoDesdeCuerpoEmparejamientos = async (req: AuthRequest): Promise<number | null> => {
    const lista = req.body?.emparejamientos;
    if (!Array.isArray(lista) || lista.length === 0) return null;
    const ids = new Set(lista.map((e: any) => aEnteroPositivo(e?.idTorneo)));
    if (ids.size !== 1) return null;
    const [unico] = [...ids];
    return unico;
};

// ── Helper privado compartido ──────────────────────────────────

const _verificarAsignacion = async (
    idUsuario: number,
    idTorneo: number,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // El modelo en Prisma se llama 'usuarioTorneo' (camelCase del @@map("usuario_torneo"))
    const asignacion = await prisma.usuarioTorneo.findUnique({
        where: { idUsuario_idTorneo: { idUsuario, idTorneo } },
        select: { activo: true },
    });

    if (!asignacion?.activo) {
        res.status(403).json({
            ok: false,
            mensaje: 'No tienes acceso a este torneo',
            code: 'TORNEO_FORBIDDEN',
        });
        return;
    }

    next();
};