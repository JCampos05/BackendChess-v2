import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ZodError } from 'zod';
import * as ligaService from '../services/liga.service';
import {
    crearLigaSchema,
    actualizarLigaSchema,
    filtrosLigaSchema,
    crearGrupoSchema,
    actualizarGrupoSchema,
    inscribirJugadorLigaSchema,
    confirmarPagoLigaSchema,
    crearRondaLigaSchema,
    cambiarEstadoRondaLigaSchema,
    registrarPartidaLigaSchema,
} from '../validations/liga.validations';

const zodFail = (res: Response, error: ZodError): void => {
    const errores = error.errors.map(e =>
        e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message
    );
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};

// ── Liga ─────────────────────────────────────────────────────

export const listarLigas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = filtrosLigaSchema.safeParse(req.query);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const resultado = await ligaService.listarLigas(parse.data);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

// GET público para la landing
export const listarLigasPublicas = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const resultado = await ligaService.listarLigas({ pagina: 1, limite: 10, activo: true });
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    } catch (err) { next(err); }
};

export const obtenerLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const liga   = await ligaService.obtenerLigaPorId(idLiga);
        res.json({ ok: true, data: liga });
    } catch (err) { next(err); }
};

export const crearLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = crearLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const liga = await ligaService.crearLiga(parse.data);
        res.status(201).json({ ok: true, data: liga });
    } catch (err) { next(err); }
};

export const actualizarLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const parse  = actualizarLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const liga = await ligaService.actualizarLiga(idLiga, parse.data);
        res.json({ ok: true, data: liga });
    } catch (err) { next(err); }
};

export const toggleActivo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga  = Number(req.params.id);
        const activo  = Boolean(req.body.activo);
        const resultado = await ligaService.toggleActivoLiga(idLiga, activo);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

// ── Grupos ────────────────────────────────────────────────────

export const listarGrupos = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const grupos = await ligaService.listarGrupos(idLiga);
        res.json({ ok: true, data: grupos });
    } catch (err) { next(err); }
};

export const crearGrupo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const parse  = crearGrupoSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const grupo = await ligaService.crearGrupo(idLiga, parse.data);
        res.status(201).json({ ok: true, data: grupo });
    } catch (err) { next(err); }
};

export const actualizarGrupo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga      = Number(req.params.id);
        const idGrupoLiga = Number(req.params.idGrupo);
        const parse       = actualizarGrupoSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const grupo = await ligaService.actualizarGrupo(idLiga, idGrupoLiga, parse.data);
        res.json({ ok: true, data: grupo });
    } catch (err) { next(err); }
};

// ── Jugadores de liga ─────────────────────────────────────────

export const listarJugadoresLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga      = Number(req.params.id);
        const idGrupoLiga = req.query.idGrupo ? Number(req.query.idGrupo) : undefined;
        const jugadores   = await ligaService.listarJugadoresLiga(idLiga, idGrupoLiga);
        res.json({ ok: true, data: jugadores, total: jugadores.length });
    } catch (err) { next(err); }
};

export const inscribirJugador = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const parse  = inscribirJugadorLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const resultado = await ligaService.inscribirJugadorLiga(idLiga, parse.data);
        res.status(201).json({ ok: true, mensaje: 'Jugador inscrito en la liga', data: resultado });
    } catch (err) { next(err); }
};

export const confirmarPagoLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idJugadorLiga = Number(req.params.idJugadorLiga);
        const parse         = confirmarPagoLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const resultado = await ligaService.confirmarPagoLiga(idJugadorLiga, parse.data);
        res.json({ ok: true, mensaje: 'Pago confirmado', data: resultado });
    } catch (err) { next(err); }
};

export const cancelarInscripcionLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idJugadorLiga = Number(req.params.idJugadorLiga);
        const resultado     = await ligaService.cancelarInscripcionLiga(idJugadorLiga);
        res.json({ ok: true, mensaje: 'Inscripción cancelada', data: resultado });
    } catch (err) { next(err); }
};

// ── Rondas ────────────────────────────────────────────────────

export const listarRondas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga      = Number(req.params.id);
        const idGrupoLiga = req.query.idGrupo ? Number(req.query.idGrupo) : undefined;
        const rondas      = await ligaService.listarRondasLiga(idLiga, idGrupoLiga);
        res.json({ ok: true, data: rondas });
    } catch (err) { next(err); }
};

export const crearRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const parse  = crearRondaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const ronda = await ligaService.crearRondaLiga(idLiga, parse.data);
        res.status(201).json({ ok: true, data: ronda });
    } catch (err) { next(err); }
};

export const cambiarEstadoRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = Number(req.params.idRonda);
        const parse       = cambiarEstadoRondaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const ronda = await ligaService.cambiarEstadoRondaLiga(idRondaLiga, parse.data);
        res.json({ ok: true, data: ronda });
    } catch (err) { next(err); }
};

// ── Mesas ─────────────────────────────────────────────────────

export const listarMesas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = Number(req.params.idRonda);
        const mesas       = await ligaService.listarMesasLiga(idRondaLiga);
        res.json({ ok: true, data: mesas });
    } catch (err) { next(err); }
};

export const generarMesas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga      = Number(req.params.id);
        const idRondaLiga = Number(req.params.idRonda);
        const mesas       = await ligaService.generarMesasLiga(idLiga, idRondaLiga);
        res.status(201).json({ ok: true, data: mesas, total: mesas.length });
    } catch (err) { next(err); }
};

// ── Partidas ──────────────────────────────────────────────────

export const registrarPartida = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idMesaLiga = Number(req.params.idMesa);
        const parse      = registrarPartidaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const partida = await ligaService.registrarPartidaLiga(idMesaLiga, parse.data);
        res.status(201).json({ ok: true, mensaje: 'Partida registrada', data: partida });
    } catch (err) { next(err); }
};

// ── Tabla de posiciones ───────────────────────────────────────

export const tablaPosiciones = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idLiga      = Number(req.params.id);
        const idGrupoLiga = req.query.idGrupo ? Number(req.query.idGrupo) : undefined;
        const tabla       = await ligaService.obtenerTablaPosiciones(idLiga, idGrupoLiga);
        res.json({ ok: true, data: tabla });
    } catch (err) { next(err); }
};