import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
    crearInscripcionSchema,
    actualizarInscripcionSchema,
    confirmarPagoSchema,
} from '../validations/inscripcion.validations';
import * as inscripcionService from '../services/inscripcion.service';

// GET /api/inscripciones/torneo/:idTorneo
export const listarPorTorneo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        if (isNaN(idTorneo)) {
            res.status(400).json({ ok: false, mensaje: 'ID de torneo inválido' });
            return;
        }
        const soloConfirmados = req.query.estado === 'confirmado';
        // Nombre correcto del servicio: listarInscripcionesTorneo
        const inscripciones = await inscripcionService.listarInscripcionesTorneo(
            idTorneo,
            soloConfirmados
        );
        res.json({ ok: true, data: inscripciones, total: inscripciones.length });
    } catch (err) {
        next(err);
    }
};

// GET /api/inscripciones/jugador/:idJugador
export const listarPorJugador = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idJugador = Number(req.params.idJugador);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID de jugador inválido' });
            return;
        }
        // Nombre correcto: listarInscripcionesJugador
        const inscripciones = await inscripcionService.listarInscripcionesJugador(idJugador);
        res.json({ ok: true, data: inscripciones });
    } catch (err) {
        next(err);
    }
};

// GET /api/inscripciones/:id
export const obtenerUna = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idInscripcion = Number(req.params.id);
        if (isNaN(idInscripcion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const inscripcion = await inscripcionService.obtenerInscripcionPorId(idInscripcion);
        res.json({ ok: true, data: inscripcion });
    } catch (err) {
        next(err);
    }
};

// POST /api/inscripciones
export const crear = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = crearInscripcionSchema.parse(req.body);
        const inscripcion = await inscripcionService.crearInscripcion(datos);
        res.status(201).json({ ok: true, mensaje: 'Jugador inscrito', data: inscripcion });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/inscripciones/:id
export const actualizar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idInscripcion = Number(req.params.id);
        if (isNaN(idInscripcion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const datos = actualizarInscripcionSchema.parse(req.body);
        const inscripcion = await inscripcionService.actualizarInscripcion(idInscripcion, datos);
        res.json({ ok: true, mensaje: 'Inscripción actualizada', data: inscripcion });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/inscripciones/:id/confirmar-pago
export const confirmarPago = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idInscripcion = Number(req.params.id);
        if (isNaN(idInscripcion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const datos = confirmarPagoSchema.parse(req.body);

        // confirmarPago recibe (idInscripcion, datos, idAdminConfirmo)
        const inscripcion = await inscripcionService.confirmarPago(
            idInscripcion,
            datos,
            req.usuario!.idUsuario
        );
        res.json({ ok: true, mensaje: 'Pago confirmado', data: inscripcion });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/inscripciones/:id — cancelación lógica
export const cancelar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idInscripcion = Number(req.params.id);
        if (isNaN(idInscripcion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const inscripcion = await inscripcionService.cancelarInscripcion(idInscripcion);
        res.json({ ok: true, mensaje: 'Inscripción cancelada', data: inscripcion });
    } catch (err) {
        next(err);
    }
};