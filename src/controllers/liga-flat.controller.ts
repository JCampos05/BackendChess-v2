import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ZodError } from 'zod';
import * as ligaService from '../services/liga.service';
import * as flatService from '../services/liga-flat.service';
import {
    filtrosLigaSchema,
    crearLigaSchema,
    actualizarLigaSchema,
    crearGrupoFlatSchema,
    actualizarGrupoSchema,
    crearRondaLigaFlatSchema,
    actualizarRondaLigaSchema,
    crearMesaLigaSchema,
    actualizarMesaLigaSchema,
    registrarPartidaLigaSchema,
    inscribirJugadorLigaFlatSchema,
    actualizarJugadorLigaSchema,
    crearPartidaLigaSchema,
    actualizarPartidaLigaSchema,
} from '../validations/liga.validations';

const zodFail = (res: Response, error: ZodError): void => {
    const errores = error.errors.map(e =>
        e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message
    );
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};

// ============================================================
// INFO LIGA  (/api/liga/info)
// ============================================================

export const listarInfoLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = filtrosLigaSchema.safeParse(req.query);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const resultado = await ligaService.listarLigas(parse.data);
        res.json({ ok: true, data: resultado.items, total: resultado.total });
    } catch (err) { next(err); }
};

export const listarTodasLigasPublico = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const ligas = await flatService.listarTodasLigas();
        res.json({ ok: true, data: ligas });
    } catch (err) { next(err); }
};

export const listarLigasActivasPublico = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const ligas = await flatService.listarLigasActivas();
        res.json({ ok: true, data: ligas });
    } catch (err) { next(err); }
};

export const obtenerInfoLiga = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const liga   = await ligaService.obtenerLigaPorId(idLiga);
        res.json({ ok: true, data: liga });
    } catch (err) { next(err); }
};

export const obtenerStatsLiga = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const stats  = await flatService.obtenerStatsLiga(idLiga);
        res.json({ ok: true, data: stats });
    } catch (err) { next(err); }
};

export const crearInfoLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = crearLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const liga = await ligaService.crearLiga(parse.data);
        res.status(201).json({ ok: true, data: liga });
    } catch (err) { next(err); }
};

export const actualizarInfoLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const parse  = actualizarLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const liga = await ligaService.actualizarLiga(idLiga, parse.data);
        res.json({ ok: true, data: liga });
    } catch (err) { next(err); }
};

export const eliminarInfoLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.id);
        const liga   = await flatService.eliminarLiga(idLiga);
        res.json({ ok: true, mensaje: 'Liga desactivada', data: liga });
    } catch (err) { next(err); }
};

// ============================================================
// GRUPOS  (/api/liga/grupos)
// ============================================================

export const listarGrupos = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga = req.query.idLiga ? Number(req.query.idLiga) : undefined;
        const grupos = await flatService.listarGruposFlat(idLiga);
        res.json({ ok: true, data: grupos });
    } catch (err) { next(err); }
};

export const listarGruposPorLiga = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.idLiga);
        const grupos = await flatService.listarGruposFlat(idLiga);
        res.json({ ok: true, data: grupos });
    } catch (err) { next(err); }
};

export const obtenerGrupo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idGrupoLiga = Number(req.params.id);
        const grupo       = await flatService.obtenerGrupoPorId(idGrupoLiga);
        res.json({ ok: true, data: grupo });
    } catch (err) { next(err); }
};

export const obtenerTablaGrupo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idGrupoLiga = Number(req.params.id);
        const tabla       = await flatService.obtenerTablaGrupo(idGrupoLiga);
        res.json({ ok: true, data: tabla });
    } catch (err) { next(err); }
};

export const crearGrupo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = crearGrupoFlatSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const grupo = await flatService.crearGrupoFlat(parse.data);
        res.status(201).json({ ok: true, data: grupo });
    } catch (err) { next(err); }
};

export const actualizarGrupo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idGrupoLiga = Number(req.params.id);
        const parse       = actualizarGrupoSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const grupo = await flatService.actualizarGrupoFlat(idGrupoLiga, parse.data);
        res.json({ ok: true, data: grupo });
    } catch (err) { next(err); }
};

export const eliminarGrupo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idGrupoLiga = Number(req.params.id);
        const grupo       = await flatService.eliminarGrupoFlat(idGrupoLiga);
        res.json({ ok: true, mensaje: 'Grupo eliminado', data: grupo });
    } catch (err) { next(err); }
};

// ============================================================
// RONDAS  (/api/liga/rondas)
// ============================================================

export const listarRondas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga      = req.query.idLiga      ? Number(req.query.idLiga)      : undefined;
        const idGrupoLiga = req.query.idGrupoLiga  ? Number(req.query.idGrupoLiga) : undefined;
        const rondas      = await flatService.listarRondasFlat(idLiga, idGrupoLiga);
        res.json({ ok: true, data: rondas });
    } catch (err) { next(err); }
};

export const listarRondasPorLiga = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idLiga = Number(req.params.idLiga);
        const rondas = await flatService.listarRondasFlat(idLiga);
        res.json({ ok: true, data: rondas });
    } catch (err) { next(err); }
};

export const listarRondasPorGrupo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idGrupoLiga = Number(req.params.idGrupo);
        const rondas      = await flatService.listarRondasFlat(undefined, idGrupoLiga);
        res.json({ ok: true, data: rondas });
    } catch (err) { next(err); }
};

export const obtenerRonda = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const ronda       = await flatService.obtenerRondaPorId(idRondaLiga);
        res.json({ ok: true, data: ronda });
    } catch (err) { next(err); }
};

export const crearRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = crearRondaLigaFlatSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const ronda = await flatService.crearRondaFlat(parse.data);
        res.status(201).json({ ok: true, data: ronda });
    } catch (err) { next(err); }
};

export const actualizarRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const parse       = actualizarRondaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const ronda = await flatService.actualizarRondaFlat(idRondaLiga, parse.data);
        res.json({ ok: true, data: ronda });
    } catch (err) { next(err); }
};

export const iniciarRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const ronda       = await flatService.iniciarRondaFlat(idRondaLiga);
        res.json({ ok: true, data: ronda });
    } catch (err) { next(err); }
};

export const finalizarRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const ronda       = await flatService.finalizarRondaFlat(idRondaLiga);
        res.json({ ok: true, data: ronda });
    } catch (err) { next(err); }
};

export const eliminarRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = Number(req.params.id);
        const resultado   = await flatService.eliminarRondaFlat(idRondaLiga);
        res.json({ ok: true, mensaje: 'Ronda eliminada', data: resultado });
    } catch (err) { next(err); }
};

// ============================================================
// MESAS  (/api/liga/mesas)
// ============================================================

export const listarMesas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = req.query.idRondaLiga ? Number(req.query.idRondaLiga) : undefined;
        const mesas       = await flatService.listarMesasFlat(idRondaLiga);
        res.json({ ok: true, data: mesas });
    } catch (err) { next(err); }
};

export const listarMesasPorRonda = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idRondaLiga = Number(req.params.idRonda);
        const mesas       = await flatService.listarMesasFlat(idRondaLiga);
        res.json({ ok: true, data: mesas });
    } catch (err) { next(err); }
};

export const obtenerMesa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idMesaLiga = Number(req.params.id);
        const mesa        = await flatService.obtenerMesaPorId(idMesaLiga);
        res.json({ ok: true, data: mesa });
    } catch (err) { next(err); }
};

export const crearMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = crearMesaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const mesa = await flatService.crearMesaFlat(parse.data);
        res.status(201).json({ ok: true, data: mesa });
    } catch (err) { next(err); }
};

export const actualizarMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idMesaLiga = Number(req.params.id);
        const parse       = actualizarMesaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const mesa = await flatService.actualizarMesaFlat(idMesaLiga, parse.data);
        res.json({ ok: true, data: mesa });
    } catch (err) { next(err); }
};

export const finalizarMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idMesaLiga = Number(req.params.id);
        const parse       = registrarPartidaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const partida = await flatService.finalizarMesaFlat(idMesaLiga, parse.data);
        res.status(201).json({ ok: true, mensaje: 'Partida registrada', data: partida });
    } catch (err) { next(err); }
};

export const eliminarMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idMesaLiga = Number(req.params.id);
        const resultado   = await flatService.eliminarMesaFlat(idMesaLiga);
        res.json({ ok: true, mensaje: 'Mesa eliminada', data: resultado });
    } catch (err) { next(err); }
};

// ============================================================
// JUGADORES DE LIGA  (/api/liga/jugadores)
// ============================================================

export const listarJugadoresLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga      = req.query.idLiga      ? Number(req.query.idLiga)      : undefined;
        const idGrupoLiga = req.query.idGrupoLiga ? Number(req.query.idGrupoLiga) : undefined;
        const jugadores    = await flatService.listarJugadoresLigaFlat(idLiga, idGrupoLiga);
        res.json({ ok: true, data: jugadores, total: jugadores.length });
    } catch (err) { next(err); }
};

export const listarJugadoresPorLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idLiga    = Number(req.params.idLiga);
        const jugadores = await flatService.listarJugadoresLigaFlat(idLiga);
        res.json({ ok: true, data: jugadores, total: jugadores.length });
    } catch (err) { next(err); }
};

export const listarJugadoresPorGrupo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idGrupoLiga = Number(req.params.idGrupo);
        const jugadores    = await flatService.listarJugadoresLigaFlat(undefined, idGrupoLiga);
        res.json({ ok: true, data: jugadores, total: jugadores.length });
    } catch (err) { next(err); }
};

export const obtenerJugadorLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idJugadorLiga = Number(req.params.id);
        const jugadorLiga    = await flatService.obtenerJugadorLigaPorId(idJugadorLiga);
        res.json({ ok: true, data: jugadorLiga });
    } catch (err) { next(err); }
};

export const crearJugadorLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = inscribirJugadorLigaFlatSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const resultado = await flatService.crearJugadorLigaFlat(parse.data);
        res.status(201).json({ ok: true, mensaje: 'Jugador inscrito en la liga', data: resultado });
    } catch (err) { next(err); }
};

export const actualizarJugadorLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idJugadorLiga = Number(req.params.id);
        const parse          = actualizarJugadorLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const resultado = await flatService.actualizarJugadorLigaFlat(idJugadorLiga, parse.data);
        res.json({ ok: true, data: resultado });
    } catch (err) { next(err); }
};

export const confirmarPagoJugadorLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idJugadorLiga = Number(req.params.id);
        const monto_pagado   = req.body?.monto_pagado !== undefined ? Number(req.body.monto_pagado) : undefined;
        const resultado = await flatService.confirmarPagoFlat(idJugadorLiga, monto_pagado);
        res.json({ ok: true, mensaje: 'Pago confirmado', data: resultado });
    } catch (err) { next(err); }
};

export const eliminarJugadorLiga = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idJugadorLiga = Number(req.params.id);
        const resultado      = await flatService.eliminarJugadorLigaFlat(idJugadorLiga);
        res.json({ ok: true, mensaje: 'Inscripción cancelada', data: resultado });
    } catch (err) { next(err); }
};

// ============================================================
// PARTIDAS DE LIGA  (/api/liga/partidas)
// ============================================================

export const listarPartidas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idMesaLiga = req.query.idMesaLiga ? Number(req.query.idMesaLiga) : undefined;
        const partidas     = await flatService.listarPartidasFlat(idMesaLiga);
        res.json({ ok: true, data: partidas });
    } catch (err) { next(err); }
};

export const obtenerPartida = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idPartidaLiga = Number(req.params.id);
        const partida         = await flatService.obtenerPartidaPorId(idPartidaLiga);
        res.json({ ok: true, data: partida });
    } catch (err) { next(err); }
};

export const crearPartida = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const parse = crearPartidaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const partida = await flatService.crearPartidaFlat(parse.data);
        res.status(201).json({ ok: true, mensaje: 'Partida registrada', data: partida });
    } catch (err) { next(err); }
};

export const actualizarPartida = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idPartidaLiga = Number(req.params.id);
        const parse           = actualizarPartidaLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }
        const partida = await flatService.actualizarPartidaFlat(idPartidaLiga, parse.data);
        res.json({ ok: true, data: partida });
    } catch (err) { next(err); }
};

export const eliminarPartida = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const idPartidaLiga = Number(req.params.id);
        const resultado        = await flatService.eliminarPartidaFlat(idPartidaLiga);
        res.json({ ok: true, mensaje: 'Partida eliminada', data: resultado });
    } catch (err) { next(err); }
};
