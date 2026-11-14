import { TipoRating } from '@prisma/client';
import prisma from '../config/database';

/**
 * Qué rating aplica según el tipo de rating del torneo.
 *
 * - `sin_rating`: el torneo no cuenta para rating → siempre 0 (se muestra como "sin rating").
 * - `estatal`:    rating estatal del jugador (`rating_estatal`).
 * - `nacional`:   rating nacional (FENAMAC, `rating_nacional`).
 *
 * Para habilitar FIDE más adelante: agregar `fide` al enum `TipoRating` del schema, una columna `rating_fide` en
 * jugadores, el valor en `torneo.validation.ts` y un caso aquí. Un jugador sin rating del tipo aplicable vale 0.
 */
export const TIPOS_RATING: readonly TipoRating[] = ['sin_rating', 'estatal', 'nacional'] as const;

type ConRatings = { rating_estatal?: number | null; rating_nacional?: number | null };

export const ratingSegunTipo = (jugador: ConRatings, tipo: TipoRating | null | undefined): number => {
    switch (tipo) {
        case 'sin_rating': return 0;
        case 'nacional':   return jugador.rating_nacional ?? 0;
        case 'estatal':
        default:           return jugador.rating_estatal ?? 0;
    }
};

export const obtenerTipoRatingTorneo = async (idTorneo: number): Promise<TipoRating> => {
    const torneo = await prisma.torneo.findUnique({ where: { idTorneo }, select: { tipo_rating: true } });
    return torneo?.tipo_rating ?? 'estatal';
};

// ── Resolución del campo `rating` en las respuestas ──────────────────────────────────────────────────────────
// Los jugadores salen de la BD con `rating_estatal` y `rating_nacional`. Las pantallas de torneo (mesas, listas,
// resultados, inscripciones...) siguen leyendo `rating`: aquí se calcula según el tipo del torneo al que pertenece
// cada fila (por su `idTorneo`, o por su `idRonda` → ronda → torneo). Donde no hay torneo (ligas, ficha del jugador)
// `rating` es el estatal. Si una fila ya trae `rating` (calculado a propósito) no se toca.

const esObjetoPlano = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

const PROFUNDIDAD_MAXIMA = 12;

const esJugador = (o: Record<string, unknown>) => 'rating_estatal' in o && !('rating' in o);

const recolectar = (v: unknown, prof: number, torneos: Set<number>, rondas: Set<number>): boolean => {
    if (prof > PROFUNDIDAD_MAXIMA) return false;
    let hayJugador = false;
    if (Array.isArray(v)) {
        for (const x of v) if (recolectar(x, prof + 1, torneos, rondas)) hayJugador = true;
    } else if (esObjetoPlano(v)) {
        if (esJugador(v)) hayJugador = true;
        if (typeof v.idTorneo === 'number') torneos.add(v.idTorneo);
        if (typeof v.idRonda === 'number') rondas.add(v.idRonda);
        for (const k of Object.keys(v)) if (recolectar(v[k], prof + 1, torneos, rondas)) hayJugador = true;
    }
    return hayJugador;
};

const aplicar = (
    v: unknown,
    prof: number,
    ctx: TipoRating,
    tipoPorTorneo: Map<number, TipoRating>,
    tipoPorRonda: Map<number, TipoRating>
): void => {
    if (prof > PROFUNDIDAD_MAXIMA) return;
    if (Array.isArray(v)) {
        for (const x of v) aplicar(x, prof + 1, ctx, tipoPorTorneo, tipoPorRonda);
    } else if (esObjetoPlano(v)) {
        let tipo = ctx;
        if (typeof v.idTorneo === 'number' && tipoPorTorneo.has(v.idTorneo)) tipo = tipoPorTorneo.get(v.idTorneo)!;
        else if (typeof v.idRonda === 'number' && tipoPorRonda.has(v.idRonda)) tipo = tipoPorRonda.get(v.idRonda)!;
        if (esJugador(v)) v.rating = ratingSegunTipo(v as ConRatings, tipo);
        for (const k of Object.keys(v)) aplicar(v[k], prof + 1, tipo, tipoPorTorneo, tipoPorRonda);
    }
};

/** Agrega `rating` a cada jugador de `datos` según el tipo de rating de su torneo. Modifica y devuelve `datos`. */
export const resolverRatingsEnDatos = async <T>(datos: T): Promise<T> => {
    const torneos = new Set<number>();
    const rondas = new Set<number>();
    if (!recolectar(datos, 0, torneos, rondas)) return datos;

    const tipoPorTorneo = new Map<number, TipoRating>();
    const tipoPorRonda = new Map<number, TipoRating>();

    if (rondas.size > 0) {
        const filas = await prisma.ronda.findMany({
            where: { idRonda: { in: [...rondas] } },
            select: { idRonda: true, torneo: { select: { idTorneo: true, tipo_rating: true } } },
        });
        for (const f of filas) {
            tipoPorRonda.set(f.idRonda, f.torneo.tipo_rating);
            tipoPorTorneo.set(f.torneo.idTorneo, f.torneo.tipo_rating);
        }
    }
    const faltan = [...torneos].filter(id => !tipoPorTorneo.has(id));
    if (faltan.length > 0) {
        const filas = await prisma.torneo.findMany({
            where: { idTorneo: { in: faltan } },
            select: { idTorneo: true, tipo_rating: true },
        });
        for (const f of filas) tipoPorTorneo.set(f.idTorneo, f.tipo_rating);
    }

    aplicar(datos, 0, 'estatal', tipoPorTorneo, tipoPorRonda);
    return datos;
};
