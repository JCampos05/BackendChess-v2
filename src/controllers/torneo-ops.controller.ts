import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as TCSvc from '../services/torneo-categoria.service';
import * as RondaSvc from '../services/ronda.service';
import * as MesaSvc from '../services/mesa.service';
import * as PartidaSvc from '../services/partida.service';
import * as HistSvc from '../services/historial-emparejamiento.service';
import { ValidationError } from '../middleware/error.middleware';

// ════════════════════════════════════════════════════════════
// TORNEO-CATEGORÍA
// ════════════════════════════════════════════════════════════

export const upsertTorneoCategoria = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            idTorneo, idCategoria, rondas, ritmo_juego,
            sistema_competencia, calendario, premios, desempates, activo,
            cierre_inscripciones, cupo_maximo,
        } = req.body;

        if (!idTorneo || !idCategoria)
            throw new ValidationError('Torneo y categoría son obligatorios');
        if (calendario !== undefined && !Array.isArray(calendario))
            throw new ValidationError('El campo calendario debe ser un array');
        if (desempates !== undefined && !Array.isArray(desempates))
            throw new ValidationError('El campo desempates debe ser un array');
        if (cupo_maximo !== undefined && cupo_maximo !== null && (isNaN(Number(cupo_maximo)) || Number(cupo_maximo) < 1))
            throw new ValidationError('El cupo máximo debe ser un número positivo');

        const { data, created } = await TCSvc.upsertTorneoCategoria({
            idTorneo: Number(idTorneo),
            idCategoria: Number(idCategoria),
            rondas: rondas !== undefined ? parseInt(rondas) : undefined,
            ritmo_juego,
            sistema_competencia,
            calendario,
            premios,
            desempates,
            activo: activo !== undefined ? Boolean(activo) : undefined,
            cierre_inscripciones: cierre_inscripciones ?? undefined,
            cupo_maximo: cupo_maximo !== undefined ? (cupo_maximo === null ? null : Number(cupo_maximo)) : undefined,
        });

        res.status(created ? 201 : 200).json({
            ok: true,
            mensaje: created ? 'Categoría agregada al torneo' : 'Configuración actualizada',
            data,
        });
    } catch (e) { next(e); }
};

export const getCategoriasByTorneo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await TCSvc.getCategoriasByTorneo(parseInt(req.params.torneo_id));
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

export const getTorneoCategoria = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await TCSvc.getTorneoCategoria(
            parseInt(req.params.torneo_id),
            parseInt(req.params.categoria_id),
        );
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const deleteTorneoCategoria = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await TCSvc.deleteTorneoCategoria(
            parseInt(req.params.torneo_id),
            parseInt(req.params.categoria_id),
        );
        res.json({ ok: true, mensaje: 'Categoría eliminada del torneo' });
    } catch (e) { next(e); }
};

export const toggleActiveTorneoCategoria = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { activo } = req.body;
        const data = await TCSvc.toggleActiveTorneoCategoria(
            parseInt(req.params.torneo_id),
            parseInt(req.params.categoria_id),
            activo !== undefined ? Boolean(activo) : undefined,
        );
        res.json({
            ok: true,
            mensaje: `Categoría ${data.activo ? 'activada' : 'desactivada'} en el torneo`,
            data,
        });
    } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════
// RONDA
// ════════════════════════════════════════════════════════════

export const getAllRondas = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await RondaSvc.getAllRondas();
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getRondasByTorneo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await RondaSvc.getRondasByTorneo(parseInt(req.params.idTorneo));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getRondasByTorneoCategoria = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await RondaSvc.getRondasByTorneoCat(
            parseInt(req.params.idTorneo),
            parseInt(req.params.idTorneoCategoria),
        );
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getRondaById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await RondaSvc.getRondaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

/** Ruta pública — no usa AuthRequest pero Express lo pasa igual */
export const getRondasByTorneoPublico = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await RondaSvc.getRondasByTorneoPublico(parseInt(req.params.idTorneo));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const createRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await RondaSvc.createRonda(req.body);
        res.status(201).json({ ok: true, mensaje: 'Ronda creada exitosamente', data });
    } catch (e) { next(e); }
};

export const updateRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await RondaSvc.updateRonda(parseInt(req.params.id), req.body);
        res.json({ ok: true, mensaje: 'Ronda actualizada exitosamente', data });
    } catch (e) { next(e); }
};

export const deleteRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await RondaSvc.deleteRonda(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Ronda eliminada exitosamente' });
    } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════
// MESA
// ════════════════════════════════════════════════════════════

export const getAllMesas = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await MesaSvc.getAllMesas();
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getMesasByRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await MesaSvc.getMesasByRonda(parseInt(req.params.idRonda));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getMesasByRondaPublico = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await MesaSvc.getMesasByRondaPublico(parseInt(req.params.idRonda));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getMesaById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await MesaSvc.getMesaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const createMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await MesaSvc.createMesa(req.body);
        res.status(201).json({ ok: true, mensaje: 'Mesa creada exitosamente', data });
    } catch (e) { next(e); }
};

export const updateMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // req.usuario viene garantizado por authMiddleware
        const data = await MesaSvc.updateMesa(parseInt(req.params.id), req.body, req.usuario!.telefono);
        res.json({ ok: true, mensaje: 'Mesa actualizada exitosamente', data });
    } catch (e) { next(e); }
};

export const deleteMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await MesaSvc.deleteMesa(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Mesa eliminada exitosamente' });
    } catch (e) { next(e); }
};

export const verificarDisponibilidadMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await MesaSvc.verificarDisponibilidadMesa(parseInt(req.params.id));
        res.json({ ok: true, ...result });
    } catch (e) { next(e); }
};

export const bloquearMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { modoEdicion } = req.body;
        const data = await MesaSvc.bloquearMesa(
            parseInt(req.params.id),
            req.usuario!.telefono,
            Boolean(modoEdicion),
        );
        res.json({ ok: true, mensaje: 'Mesa bloqueada exitosamente', data });
    } catch (e) { next(e); }
};

export const liberarMesa = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await MesaSvc.liberarMesa(parseInt(req.params.id), req.usuario!.telefono);
        res.json({ ok: true, mensaje: 'Mesa liberada exitosamente' });
    } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════
// PARTIDA
// ════════════════════════════════════════════════════════════

export const getAllPartidas = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await PartidaSvc.getAllPartidas();
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getPartidaById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await PartidaSvc.getPartidaById(parseInt(req.params.id));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getPartidasByJugadorTorneo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await PartidaSvc.getPartidasByJugadorTorneo(
            parseInt(req.params.idJugador),
            parseInt(req.params.idTorneo),
        );
        res.json({ ok: true, data, total: data.length });
    } catch (e) { next(e); }
};

export const createPartida = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await PartidaSvc.createPartida(req.body);
        res.status(201).json({ ok: true, mensaje: 'Partida registrada y estadísticas actualizadas exitosamente', data });
    } catch (e) { next(e); }
};

export const updatePartida = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await PartidaSvc.updatePartida(parseInt(req.params.id), req.body);
        res.json({ ok: true, mensaje: 'Partida y estadísticas actualizadas exitosamente', data });
    } catch (e) { next(e); }
};

export const deletePartida = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await PartidaSvc.deletePartida(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Partida eliminada exitosamente' });
    } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════
// HISTORIAL EMPAREJAMIENTO
// ════════════════════════════════════════════════════════════

export const getAllHistorial = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await HistSvc.getAllHistorial();
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getHistorialByTorneo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await HistSvc.getHistorialByTorneo(parseInt(req.params.idTorneo));
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const getHistorialByJugador = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await HistSvc.getHistorialByJugador(
            parseInt(req.params.idJugador),
            parseInt(req.params.idTorneo),
        );
        res.json({ ok: true, data });
    } catch (e) { next(e); }
};

export const verificarEnfrentamiento = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await HistSvc.verificarEnfrentamiento(
            parseInt(req.params.idJugador1),
            parseInt(req.params.idJugador2),
            parseInt(req.params.idTorneo),
        );
        res.json({ ok: true, ...result });
    } catch (e) { next(e); }
};

export const createHistorial = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = await HistSvc.createHistorial(req.body);
        res.status(201).json({ ok: true, mensaje: 'Emparejamiento registrado exitosamente', data });
    } catch (e) { next(e); }
};

export const createHistorialRonda = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { emparejamientos } = req.body;
        const data = await HistSvc.createHistorialRonda(emparejamientos);
        res.status(201).json({
            ok: true,
            mensaje: `${data.length} emparejamientos registrados exitosamente`,
            data,
        });
    } catch (e) { next(e); }
};

export const deleteHistorial = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await HistSvc.deleteHistorial(parseInt(req.params.id));
        res.json({ ok: true, mensaje: 'Registro de historial eliminado exitosamente' });
    } catch (e) { next(e); }
};