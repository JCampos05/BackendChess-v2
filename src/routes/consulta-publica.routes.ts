import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { NotFoundError } from '../middleware/error.middleware';
import { slugify } from '../utils/slug';
import * as Ops from '../controllers/torneo-ops.controller';
import * as torneoCtrl from '../controllers/torneo.controller';
import * as estCtrl from '../controllers/estadisticas-torneo.controller';
import * as inscPubCtrl from '../controllers/inscripcion-publica.controller';
import * as ligaCtrl from '../controllers/liga-flat.controller';

// ════════════════════════════════════════════════════════════
// /api/consulta — consultas públicas SIN ids numéricos en la ruta.
// Torneo y liga se identifican por slug; categoría y grupo por el slug de su nombre; ronda por su número.
// Cada ruta resuelve los slugs a ids internos y delega en el controlador original (misma respuesta de siempre),
// así las rutas con ids quedan solo para el panel (autenticadas).
// ════════════════════════════════════════════════════════════
const router = Router();

type Params = Record<string, string>;
type Resolutor = (req: Request, p: Params) => Promise<void>;

const noEncontrado = (que: string): never => { throw new NotFoundError(`${que} no encontrado`); };

const idTorneo = async (slug: string): Promise<number> =>
    (await prisma.torneo.findUnique({ where: { slug }, select: { idTorneo: true } }))?.idTorneo
    ?? noEncontrado('Torneo');

const idTorneoCat = async (torneoId: number, slugCategoria: string): Promise<number> => {
    const filas = await prisma.torneoCategoria.findMany({
        where: { idTorneo: torneoId },
        select: { idTorneoCat: true, categoria: { select: { nombre: true } } },
    });
    return filas.find(f => slugify(f.categoria?.nombre ?? '') === slugCategoria)?.idTorneoCat
        ?? noEncontrado('Categoría');
};

const idRonda = async (torneoId: number, torneoCatId: number, numero: string): Promise<number> => {
    const n = Number(numero);
    if (!Number.isInteger(n)) noEncontrado('Ronda');
    return (await prisma.ronda.findFirst({
        where: { idTorneo: torneoId, idTorneoCategoria: torneoCatId, numeroRonda: n },
        select: { idRonda: true },
    }))?.idRonda ?? noEncontrado('Ronda');
};

const idLiga = async (slug: string): Promise<number> =>
    (await prisma.infoLiga.findUnique({ where: { slug }, select: { idLiga: true } }))?.idLiga
    ?? noEncontrado('Liga');

const idGrupo = async (ligaId: number, slugGrupo: string): Promise<number> => {
    const grupos = await prisma.grupoLiga.findMany({ where: { idLiga: ligaId }, select: { idGrupoLiga: true, nombre: true } });
    return grupos.find(g => slugify(g.nombre) === slugGrupo)?.idGrupoLiga ?? noEncontrado('Grupo');
};

const idRondaLiga = async (ligaId: number, grupoId: number, numero: string): Promise<number> => {
    const n = Number(numero);
    if (!Number.isInteger(n)) noEncontrado('Ronda');
    return (await prisma.rondaLiga.findFirst({
        where: { idLiga: ligaId, idGrupoLiga: grupoId, numeroRonda: n },
        select: { idRondaLiga: true },
    }))?.idRondaLiga ?? noEncontrado('Ronda');
};

/** Resuelve los slugs de la ruta, deja los ids en req.params y llama al controlador original. */
const via = (resolver: Resolutor, handler: (req: any, res: Response, next: NextFunction) => unknown) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await resolver(req, req.params as Params);
            await handler(req, res, next);
        } catch (err) { next(err); }
    };

// ── Torneos ──────────────────────────────────────────────────
const torneo: Resolutor = async (_r, p) => { p.idTorneo = String(await idTorneo(p.slug)); p.id = p.idTorneo; };
const torneoYCategoria: Resolutor = async (r, p) => {
    await torneo(r, p);
    p.idTorneoCategoria = String(await idTorneoCat(Number(p.idTorneo), p.categoria));
};
const torneoCategoriaRonda: Resolutor = async (r, p) => {
    await torneoYCategoria(r, p);
    p.idRonda = String(await idRonda(Number(p.idTorneo), Number(p.idTorneoCategoria), p.numero));
};

router.get('/torneos/:slug/categorias', via(torneo, Ops.getCategoriasByTorneo));
router.get('/torneos/:slug/categorias-inscripcion', via(torneo, inscPubCtrl.obtenerCategorias));
router.get('/torneos/:slug/clasificacion-ritmos', via(torneo, torneoCtrl.clasificacionRitmos));
router.get('/torneos/:slug/rondas', via(torneo, Ops.getRondasByTorneoPublico));
router.get('/torneos/:slug/categorias/:categoria/lista-inicial', via(torneoYCategoria, estCtrl.getListaInicialPublica));
router.get('/torneos/:slug/categorias/:categoria/ranking-final', via(torneoYCategoria, estCtrl.getRankingFinalPublico));
router.get('/torneos/:slug/categorias/:categoria/rondas/:numero/mesas', via(torneoCategoriaRonda, Ops.getMesasByRondaPublico));

// ── Ligas ────────────────────────────────────────────────────
const liga: Resolutor = async (_r, p) => { p.idLiga = String(await idLiga(p.slug)); };
const ligaYGrupo: Resolutor = async (r, p) => {
    await liga(r, p);
    p.idGrupo = String(await idGrupo(Number(p.idLiga), p.grupo));
    p.id = p.idGrupo;
};
const ligaGrupoRonda: Resolutor = async (r, p) => {
    await ligaYGrupo(r, p);
    p.idRonda = String(await idRondaLiga(Number(p.idLiga), Number(p.idGrupo), p.numero));
};

router.get('/ligas/:slug/grupos', via(liga, ligaCtrl.listarGruposPorLiga));
router.get('/ligas/:slug/grupos/:grupo/tabla', via(ligaYGrupo, ligaCtrl.obtenerTablaGrupo));
router.get('/ligas/:slug/grupos/:grupo/rondas', via(ligaYGrupo, ligaCtrl.listarRondasPorGrupo));
router.get('/ligas/:slug/grupos/:grupo/rondas/:numero/mesas', via(ligaGrupoRonda, ligaCtrl.listarMesasPorRonda));

export default router;
