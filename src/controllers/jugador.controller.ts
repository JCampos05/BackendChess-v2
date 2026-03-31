import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
    crearJugadorSchema,
    actualizarJugadorSchema,
    filtrosJugadorSchema,
} from '../validations/jugador.validations';
import * as jugadorService from '../services/jugador.service';

// GET /api/jugadores
export const listar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const filtros   = filtrosJugadorSchema.parse(req.query);
        const resultado = await jugadorService.listarJugadores(filtros);
        res.json({ ok: true, ...resultado });
    } catch (err) {
        next(err);
    }
};

// GET /api/jugadores/buscar?q=termino
export const buscar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const termino = (req.query.q as string) ?? '';
        if (termino.length < 2) {
            res.status(400).json({ ok: false, mensaje: 'Mínimo 2 caracteres' });
            return;
        }
        const jugadores = await jugadorService.buscarJugadoresPorNombre(termino);
        res.json({ ok: true, data: jugadores });
    } catch (err) {
        next(err);
    }
};

// GET /api/jugadores/:id
export const obtenerUno = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idJugador = Number(req.params.id);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const jugador = await jugadorService.obtenerJugadorPorId(idJugador);
        res.json({ ok: true, data: jugador });
    } catch (err) {
        next(err);
    }
};

// POST /api/jugadores
export const crear = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos   = crearJugadorSchema.parse(req.body);
        const jugador = await jugadorService.crearJugador(datos);
        res.status(201).json({ ok: true, mensaje: 'Jugador registrado', data: jugador });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/jugadores/:id
export const actualizar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idJugador = Number(req.params.id);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const datos   = actualizarJugadorSchema.parse(req.body);
        const jugador = await jugadorService.actualizarJugador(idJugador, datos);
        res.json({ ok: true, mensaje: 'Jugador actualizado', data: jugador });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/jugadores/:id/estado
export const cambiarEstado = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idJugador = Number(req.params.id);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }

        const { estado } = req.body as { estado: string };
        const estadosValidos = ['pendiente_pago', 'activo', 'inactivo'] as const;
        type EstadoValido = typeof estadosValidos[number];

        if (!estadosValidos.includes(estado as EstadoValido)) {
            res.status(400).json({
                ok: false,
                mensaje: `Estado inválido. Opciones: ${estadosValidos.join(', ')}`,
            });
            return;
        }

        const jugador = await jugadorService.cambiarEstadoJugador(
            idJugador,
            estado as EstadoValido
        );
        res.json({ ok: true, mensaje: `Estado cambiado a ${estado}`, data: jugador });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/jugadores/:id/confirmar-pago
// Un adminGral o adminTorneo confirma el pago → jugador pasa a activo
export const confirmarPago = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idJugador = Number(req.params.id);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const jugador = await jugadorService.confirmarPagoJugador(idJugador);
        res.json({ ok: true, mensaje: 'Pago confirmado. Jugador activado.', data: jugador });
    } catch (err) {
        next(err);
    }
};

// GET /api/jugadores/:id/elegibilidad?idTorneo=1&idCategoria=2
// Verifica si un jugador puede inscribirse en un torneo/categoría
export const verificarElegibilidad = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idJugador  = Number(req.params.id);
        const idTorneo   = Number(req.query.idTorneo);
        const idCategoria = req.query.idCategoria ? Number(req.query.idCategoria) : undefined;

        if (isNaN(idJugador) || isNaN(idTorneo)) {
            res.status(400).json({
                ok: false,
                mensaje: 'Se requieren idJugador e idTorneo válidos',
            });
            return;
        }

        const resultado = await jugadorService.verificarElegibilidad(
            idJugador,
            idTorneo,
            idCategoria
        );
        res.json({ ok: true, data: resultado });
    } catch (err) {
        next(err);
    }
};