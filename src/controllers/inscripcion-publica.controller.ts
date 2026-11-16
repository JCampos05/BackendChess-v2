import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as svc from '../services/inscripcion-publica.service';
import { inscribirPublicoSchema, inscribirPublicoLigaSchema, buscarJugadorPublicoSchema } from '../validations/inscripcion-publica.validations';

const zodFail = (res: Response, error: ZodError): void => {
    const errores = error.errors.map(e =>
        e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message
    );
    res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
};


// Si la persona dijo que es nueva pero ya existe un jugador con sus mismos datos, no se inscribe: se devuelve el
// perfil para que verifique su información o lo seleccione. Devuelve true si ya respondió.
const responderSiJugadorExiste = async (res: Response, datos: Parameters<typeof svc.detectarJugadorExistente>[0]): Promise<boolean> => {
    const existente = await svc.detectarJugadorExistente(datos);
    if (!existente) return false;
    if (existente.tipo === 'misma_persona') {
        res.status(409).json({
            ok: false,
            code: 'JUGADOR_EXISTENTE',
            mensaje: 'Este jugador ya existe. Verifica tu información o selecciona tu perfil.',
            candidatos: existente.candidatos,
        });
    } else {
        res.status(409).json({
            ok: false,
            code: 'JUGADOR_HOMONIMO',
            mensaje: 'Ya existe un jugador registrado con ese nombre pero con otra fecha de nacimiento. Revisa tus datos o contacta a un administrador del Comité.',
        });
    }
    return true;
};

// GET /api/inscripciones-publicas/torneo/:idTorneo/categorias
export const obtenerCategorias = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        if (isNaN(idTorneo)) {
            res.status(400).json({ ok: false, mensaje: 'ID de torneo inválido' });
            return;
        }
        const categorias = await svc.listarCategoriasPublicas(idTorneo);
        res.json({ ok: true, data: categorias });
    } catch (err) { next(err); }
};

// GET /api/inscripciones-publicas/buscar-jugador?q=termino
export const buscarJugador = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parse = buscarJugadorPublicoSchema.safeParse(req.query);
        if (!parse.success) { zodFail(res, parse.error); return; }

        const jugadores = await svc.buscarJugadorPublico(parse.data.q);
        res.json({ ok: true, data: jugadores });
    } catch (err) { next(err); }
};

// POST /api/inscripciones-publicas
export const crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parse = inscribirPublicoSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        if (await responderSiJugadorExiste(res, parse.data)) return;
        const inscripcion = await svc.inscribirPublico(parse.data);
        res.status(201).json({ ok: true, mensaje: 'Inscripción registrada', data: inscripcion });
    } catch (err) { next(err); }
};

// GET /api/inscripciones-publicas/liga/slug/:slug
export const obtenerLigaPorSlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const liga = await svc.obtenerLigaPublicaPorSlug(req.params.slug);
        res.json({ ok: true, data: liga });
    } catch (err) { next(err); }
};

// POST /api/inscripciones-publicas/liga
export const crearLiga = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parse = inscribirPublicoLigaSchema.safeParse(req.body);
        if (!parse.success) { zodFail(res, parse.error); return; }

        if (await responderSiJugadorExiste(res, parse.data)) return;
        const inscripcion = await svc.inscribirPublicoLiga(parse.data);
        res.status(201).json({ ok: true, mensaje: 'Inscripción registrada', data: inscripcion });
    } catch (err) { next(err); }
};
