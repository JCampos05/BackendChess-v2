import { TipoRating } from '@prisma/client';
import prisma from '../config/database';
import {
    ClaseRitmo,
    cargarCatalogoRitmos,
    claseDeRitmoPorNombre,
    obtenerUmbrales,
} from '../services/ritmo-rating-config.service';

/**
 * Qué rating aplica según el tipo de rating del torneo.
 *
 * - `sin_rating`: el torneo no cuenta para rating → siempre 0 (se muestra como "sin rating").
 * - `estatal`:    rating estatal del jugador (`rating_estatal`), uno solo.
 * - `nacional`:   rating nacional (FENAMAC), UNO POR RITMO: el de la clase de ritmo de la categoría
 *                 (`rating_nacional_estandar` / `_rapido` / `_blitz`). Sin ritmo definido vale 0.
 *
 * Para habilitar FIDE más adelante: agregar `fide` al enum `TipoRating` del schema, la(s) columna(s) del jugador,
 * el valor en `torneo.validation.ts` y un caso aquí. Un jugador sin rating del tipo aplicable vale 0.
 */
export const TIPOS_RATING: readonly TipoRating[] = ['sin_rating', 'estatal', 'nacional'] as const;

export type CampoRatingNacional = 'rating_nacional_estandar' | 'rating_nacional_rapido' | 'rating_nacional_blitz';

type ConRatings = {
    rating_estatal?: number | null;
    rating_nacional_estandar?: number | null;
    rating_nacional_rapido?: number | null;
    rating_nacional_blitz?: number | null;
};

/** Campo del jugador donde vive el rating nacional de una clase de ritmo. */
export const campoRatingNacional = (clase: ClaseRitmo): CampoRatingNacional => `rating_nacional_${clase}`;

export const ratingSegunTipo = (
    jugador: ConRatings,
    tipo: TipoRating | null | undefined,
    clase?: ClaseRitmo | null
): number => {
    switch (tipo) {
        case 'sin_rating': return 0;
        case 'nacional':   return clase ? jugador[campoRatingNacional(clase)] ?? 0 : 0;
        case 'estatal':
        default:           return jugador.rating_estatal ?? 0;
    }
};

export const obtenerTipoRatingTorneo = async (idTorneo: number): Promise<TipoRating> => {
    const torneo = await prisma.torneo.findUnique({ where: { idTorneo }, select: { tipo_rating: true } });
    return torneo?.tipo_rating ?? 'estatal';
};

// ── Resolución del campo `rating` en las respuestas ──────────────────────────────────────────────────────────
// Los jugadores salen de la BD con `rating_estatal` y los tres `rating_nacional_*`. Las pantallas de torneo (mesas,
// listas, resultados, inscripciones...) siguen leyendo `rating`: aquí se calcula según el tipo de rating del torneo
// y, si es nacional, el ritmo de la CATEGORÍA a la que pertenece cada fila. El contexto sale de los ids de la fila:
//   idTorneoCategoria / idTorneoCat → categoría del torneo (tipo + ritmo)
//   idRonda                          → ronda → su categoría del torneo
//   idTorneo + idCategoria           → categoría del torneo (inscripciones)
//   idTorneo solo                    → tipo del torneo y, si todas sus categorías comparten ritmo, ese ritmo
// Donde no hay torneo (ligas, ficha del jugador) `rating` es el estatal. Si una fila ya trae `rating` no se toca.

interface Contexto {
    tipo: TipoRating;
    clase: ClaseRitmo | null;
}

const CONTEXTO_POR_DEFECTO: Contexto = { tipo: 'estatal', clase: null };

const esObjetoPlano = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

const PROFUNDIDAD_MAXIMA = 12;

const esJugador = (o: Record<string, unknown>) => 'rating_estatal' in o && !('rating' in o);

const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);

interface Ids {
    torneos: Set<number>;
    rondas: Set<number>;
    torneoCats: Set<number>;
}

const recolectar = (v: unknown, prof: number, ids: Ids): boolean => {
    if (prof > PROFUNDIDAD_MAXIMA) return false;
    let hayJugador = false;
    if (Array.isArray(v)) {
        for (const x of v) if (recolectar(x, prof + 1, ids)) hayJugador = true;
    } else if (esObjetoPlano(v)) {
        if (esJugador(v)) hayJugador = true;
        const idTorneo = num(v.idTorneo), idRonda = num(v.idRonda);
        const idTC = num(v.idTorneoCategoria) ?? num(v.idTorneoCat);
        if (idTorneo !== null) ids.torneos.add(idTorneo);
        if (idRonda !== null) ids.rondas.add(idRonda);
        if (idTC !== null) ids.torneoCats.add(idTC);
        for (const k of Object.keys(v)) if (recolectar(v[k], prof + 1, ids)) hayJugador = true;
    }
    return hayJugador;
};

interface Mapas {
    tipoPorTorneo: Map<number, TipoRating>;
    claseHomogeneaPorTorneo: Map<number, ClaseRitmo | null>;
    contextoPorTorneoCat: Map<number, Contexto>;
    contextoPorRonda: Map<number, Contexto>;
    contextoPorTorneoYCategoria: Map<string, Contexto>;
}

const contextoDeFila = (o: Record<string, unknown>, m: Mapas): Contexto | null => {
    const idTC = num(o.idTorneoCategoria) ?? num(o.idTorneoCat);
    if (idTC !== null && m.contextoPorTorneoCat.has(idTC)) return m.contextoPorTorneoCat.get(idTC)!;

    const idRonda = num(o.idRonda);
    if (idRonda !== null && m.contextoPorRonda.has(idRonda)) return m.contextoPorRonda.get(idRonda)!;

    const idTorneo = num(o.idTorneo), idCategoria = num(o.idCategoria);
    if (idTorneo !== null && idCategoria !== null) {
        const c = m.contextoPorTorneoYCategoria.get(`${idTorneo}:${idCategoria}`);
        if (c) return c;
    }
    if (idTorneo !== null && m.tipoPorTorneo.has(idTorneo)) {
        return { tipo: m.tipoPorTorneo.get(idTorneo)!, clase: m.claseHomogeneaPorTorneo.get(idTorneo) ?? null };
    }
    return null;
};

const aplicar = (v: unknown, prof: number, ctx: Contexto, m: Mapas): void => {
    if (prof > PROFUNDIDAD_MAXIMA) return;
    if (Array.isArray(v)) {
        for (const x of v) aplicar(x, prof + 1, ctx, m);
    } else if (esObjetoPlano(v)) {
        const propio = contextoDeFila(v, m) ?? ctx;
        if (esJugador(v)) v.rating = ratingSegunTipo(v as ConRatings, propio.tipo, propio.clase);
        for (const k of Object.keys(v)) aplicar(v[k], prof + 1, propio, m);
    }
};

/** Agrega `rating` a cada jugador de `datos` según el tipo de rating y el ritmo de su torneo/categoría. */
export const resolverRatingsEnDatos = async <T>(datos: T): Promise<T> => {
    const ids: Ids = { torneos: new Set(), rondas: new Set(), torneoCats: new Set() };
    if (!recolectar(datos, 0, ids)) return datos;

    // 1. Rondas → torneo y categoría del torneo
    const rondaInfo = new Map<number, { idTorneo: number; idTorneoCat: number }>();
    if (ids.rondas.size > 0) {
        const filas = await prisma.ronda.findMany({
            where: { idRonda: { in: [...ids.rondas] } },
            select: { idRonda: true, idTorneo: true, idTorneoCategoria: true },
        });
        for (const f of filas) {
            rondaInfo.set(f.idRonda, { idTorneo: f.idTorneo, idTorneoCat: f.idTorneoCategoria });
            ids.torneos.add(f.idTorneo);
            ids.torneoCats.add(f.idTorneoCategoria);
        }
    }

    // 2. Categorías de los torneos involucrados (para el ritmo) y tipo de cada torneo
    const [torneos, categorias] = await Promise.all([
        ids.torneos.size > 0
            ? prisma.torneo.findMany({ where: { idTorneo: { in: [...ids.torneos] } }, select: { idTorneo: true, tipo_rating: true } })
            : [],
        ids.torneos.size > 0 || ids.torneoCats.size > 0
            ? prisma.torneoCategoria.findMany({
                where: {
                    OR: [
                        ...(ids.torneos.size > 0 ? [{ idTorneo: { in: [...ids.torneos] } }] : []),
                        ...(ids.torneoCats.size > 0 ? [{ idTorneoCat: { in: [...ids.torneoCats] } }] : []),
                    ],
                },
                select: { idTorneoCat: true, idTorneo: true, idCategoria: true, ritmo_juego: true, activo: true },
            })
            : [],
    ]);

    const tipoPorTorneo = new Map<number, TipoRating>(torneos.map(t => [t.idTorneo, t.tipo_rating]));
    for (const c of categorias) {
        if (!tipoPorTorneo.has(c.idTorneo)) {
            const t = await prisma.torneo.findUnique({ where: { idTorneo: c.idTorneo }, select: { tipo_rating: true } });
            tipoPorTorneo.set(c.idTorneo, t?.tipo_rating ?? 'estatal');
        }
    }

    // 3. Clase de ritmo de cada categoría (solo hace falta si algún torneo es nacional)
    const hayNacional = [...tipoPorTorneo.values()].includes('nacional');
    const [catalogo, umbrales] = hayNacional ? await Promise.all([cargarCatalogoRitmos(), obtenerUmbrales()]) : [null, null];

    const mapas: Mapas = {
        tipoPorTorneo,
        claseHomogeneaPorTorneo: new Map(),
        contextoPorTorneoCat: new Map(),
        contextoPorRonda: new Map(),
        contextoPorTorneoYCategoria: new Map(),
    };

    const clasesPorTorneo = new Map<number, Set<ClaseRitmo | null>>();
    for (const c of categorias) {
        const tipo = tipoPorTorneo.get(c.idTorneo) ?? 'estatal';
        const clase = catalogo && umbrales ? claseDeRitmoPorNombre(c.ritmo_juego, catalogo, umbrales) : null;
        const contexto: Contexto = { tipo, clase };
        mapas.contextoPorTorneoCat.set(c.idTorneoCat, contexto);
        mapas.contextoPorTorneoYCategoria.set(`${c.idTorneo}:${c.idCategoria}`, contexto);
        if (c.activo) {
            if (!clasesPorTorneo.has(c.idTorneo)) clasesPorTorneo.set(c.idTorneo, new Set());
            clasesPorTorneo.get(c.idTorneo)!.add(clase);
        }
    }
    for (const [idTorneo, clases] of clasesPorTorneo) {
        mapas.claseHomogeneaPorTorneo.set(idTorneo, clases.size === 1 ? [...clases][0] : null);
    }
    for (const [idRonda, r] of rondaInfo) {
        const c = mapas.contextoPorTorneoCat.get(r.idTorneoCat);
        if (c) mapas.contextoPorRonda.set(idRonda, c);
    }

    aplicar(datos, 0, CONTEXTO_POR_DEFECTO, mapas);
    return datos;
};

// ── Ritmo del torneo en las respuestas ───────────────────────────────────────────────────────────────────────
// Cada torneo que viaja con sus categorías (`torneo_categorias`, con `ritmo_juego`) recibe `ritmo_rating`: la clase de
// ritmo FIDE si todas sus categorías coinciden, 'mixto' si hay varias, o null si ninguna tiene ritmo. No se guarda en
// la BD: se calcula con el catálogo de ritmos y los lineamientos vigentes.

const esTorneoConCategorias = (o: Record<string, unknown>): boolean =>
    typeof o.idTorneo === 'number' && Array.isArray(o.torneo_categorias) && !('ritmo_rating' in o);

const recolectarTorneos = (v: unknown, prof: number, salida: Record<string, unknown>[]): void => {
    if (prof > PROFUNDIDAD_MAXIMA) return;
    if (Array.isArray(v)) {
        for (const x of v) recolectarTorneos(x, prof + 1, salida);
    } else if (esObjetoPlano(v)) {
        if (esTorneoConCategorias(v)) salida.push(v);
        for (const k of Object.keys(v)) recolectarTorneos(v[k], prof + 1, salida);
    }
};

/** Agrega `ritmo_rating` a cada torneo de `datos` que traiga sus categorías. Modifica y devuelve `datos`. */
export const anexarRitmoATorneos = async <T>(datos: T): Promise<T> => {
    const torneos: Record<string, unknown>[] = [];
    recolectarTorneos(datos, 0, torneos);
    if (torneos.length === 0) return datos;

    const [catalogo, umbrales] = await Promise.all([cargarCatalogoRitmos(), obtenerUmbrales()]);
    for (const t of torneos) {
        const categorias = t.torneo_categorias as Array<{ ritmo_juego?: string | null; activo?: boolean }>;
        const clases = new Set<ClaseRitmo>();
        for (const c of categorias) {
            if (c.activo === false) continue;
            const clase = claseDeRitmoPorNombre(c.ritmo_juego, catalogo, umbrales);
            if (clase) clases.add(clase);
        }
        t.ritmo_rating = clases.size === 0 ? null : clases.size === 1 ? [...clases][0] : 'mixto';
    }
    return datos;
};
