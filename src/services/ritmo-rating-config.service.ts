import { Prisma } from '@prisma/client';
import prisma from '../config/database';

// ════════════════════════════════════════════════════════════
// Lineamientos de clasificación de ritmos de juego (Configuración > Opciones Avanzadas).
//
// FENAMAC lleva un rating nacional por ritmo (estándar / rápido / blitz) siguiendo las reglas de FIDE. El tiempo
// de un ritmo cuenta el incremento: tiempo equivalente = minutos + incremento (en segundos, ×60 movimientos = minutos).
//
//   0 a `blitzMaximo` minutos            → blitz     (por defecto 0 a 10)
//   `blitzMaximo`+1 a `rapidoMaximo`     → rápido    (por defecto 11 a 59)
//   más de `rapidoMaximo`                → estándar  (por defecto 60 en adelante)
//
// Se guardan en `configuracion.extras.ritmosRating` (sin cambiar la estructura de la BD), igual que los límites de
// peticiones. Si falta o es inválido se usan los lineamientos por defecto.
// ════════════════════════════════════════════════════════════

export type ClaseRitmo = 'blitz' | 'rapido' | 'estandar';

export const CLASES_RITMO: readonly ClaseRitmo[] = ['estandar', 'rapido', 'blitz'] as const;

export const ETIQUETA_CLASE_RITMO: Record<ClaseRitmo, string> = {
    estandar: 'Estándar',
    rapido: 'Rápido',
    blitz: 'Blitz',
};

export interface UmbralesRitmo {
    /** Último minuto (incluido) que sigue siendo blitz. */
    blitzMaximo: number;
    /** Último minuto (incluido) que sigue siendo rápido; a partir del siguiente es estándar. */
    rapidoMaximo: number;
}

export const UMBRALES_POR_DEFECTO: UmbralesRitmo = { blitzMaximo: 10, rapidoMaximo: 59 };

/** Rangos permitidos: impiden dejar lineamientos sin sentido (por ejemplo un blitz de 3 horas). */
export const LIMITES_UMBRALES = {
    blitzMaximo: { minimo: 1, maximo: 30 },
    rapidoMaximo: { minimo: 2, maximo: 180 },
} as const;

/** ¿Los umbrales son enteros, están en rango y el rápido termina después del blitz? */
export const umbralesValidos = (u: unknown): u is UmbralesRitmo => {
    if (typeof u !== 'object' || u === null) return false;
    const { blitzMaximo, rapidoMaximo } = u as Record<string, unknown>;
    return (
        typeof blitzMaximo === 'number' && Number.isInteger(blitzMaximo) &&
        typeof rapidoMaximo === 'number' && Number.isInteger(rapidoMaximo) &&
        blitzMaximo >= LIMITES_UMBRALES.blitzMaximo.minimo && blitzMaximo <= LIMITES_UMBRALES.blitzMaximo.maximo &&
        rapidoMaximo >= LIMITES_UMBRALES.rapidoMaximo.minimo && rapidoMaximo <= LIMITES_UMBRALES.rapidoMaximo.maximo &&
        rapidoMaximo > blitzMaximo
    );
};

/** Tiempo equivalente de un ritmo, contando el incremento (minutos + incremento en segundos × 60 / 60). */
export const tiempoEquivalente = (minutos: number, incremento: number): number => minutos + incremento;

/** Clasifica un ritmo de juego (función pura, probable sin base de datos). */
export const clasificarRitmo = (
    minutos: number,
    incremento: number,
    umbrales: UmbralesRitmo = UMBRALES_POR_DEFECTO
): ClaseRitmo => {
    const tiempo = tiempoEquivalente(minutos, incremento);
    if (tiempo <= umbrales.blitzMaximo) return 'blitz';
    if (tiempo <= umbrales.rapidoMaximo) return 'rapido';
    return 'estandar';
};

// ── Lectura / escritura de los umbrales ──────────────────────

const VIGENCIA_CACHE_MS = 60_000;
let cache: { umbrales: UmbralesRitmo; guardados: boolean; leidoEn: number } | null = null;

const leerDeBD = async (): Promise<{ umbrales: UmbralesRitmo; guardados: boolean }> => {
    const ahora = Date.now();
    if (cache && ahora - cache.leidoEn < VIGENCIA_CACHE_MS) return cache;
    try {
        const config = await prisma.configGral.findFirst({ where: { idConfig: 1 }, select: { extras: true } });
        const crudo = ((config?.extras ?? {}) as Record<string, any>).ritmosRating;
        const guardados = umbralesValidos(crudo);
        cache = { umbrales: guardados ? { blitzMaximo: crudo.blitzMaximo, rapidoMaximo: crudo.rapidoMaximo } : UMBRALES_POR_DEFECTO, guardados, leidoEn: ahora };
        return cache;
    } catch {
        // Sin BD se conserva lo último leído (o los valores por defecto) y se reintenta pronto
        cache = { umbrales: cache?.umbrales ?? UMBRALES_POR_DEFECTO, guardados: cache?.guardados ?? false, leidoEn: ahora - VIGENCIA_CACHE_MS + 10_000 };
        return cache;
    }
};

export const obtenerUmbrales = async (): Promise<UmbralesRitmo> => (await leerDeBD()).umbrales;

export const invalidarCacheUmbrales = (): void => {
    cache = null;
};

/** Vista para la pantalla de Configuración. */
export const obtenerUmbralesParaPanel = async () => {
    const { umbrales, guardados } = await leerDeBD();
    return { ...umbrales, personalizado: guardados, porDefecto: UMBRALES_POR_DEFECTO, limites: LIMITES_UMBRALES };
};

/** Guarda los umbrales (o los quita con `null`, volviendo a los lineamientos por defecto). */
export const guardarUmbrales = async (nuevos: UmbralesRitmo | null) => {
    const config = await prisma.configGral.findFirst({ where: { idConfig: 1 }, select: { extras: true } });
    const extras = { ...((config?.extras ?? {}) as Record<string, any>) };
    const antes = extras.ritmosRating ?? null;

    if (nuevos === null) delete extras.ritmosRating;
    else extras.ritmosRating = { blitzMaximo: nuevos.blitzMaximo, rapidoMaximo: nuevos.rapidoMaximo };

    await prisma.configGral.update({
        where: { idConfig: 1 },
        data: { extras: extras as Prisma.InputJsonValue },
    });
    invalidarCacheUmbrales();
    return { antes, despues: extras.ritmosRating ?? null };
};

// ── Clasificación de las categorías de un torneo ─────────────

const normalizar = (t: string | null | undefined): string => (t ?? '').trim().toLowerCase();

/** Catálogo de ritmos indexado por nombre (la categoría de un torneo guarda el NOMBRE del ritmo). */
export const cargarCatalogoRitmos = async (): Promise<Map<string, { minutos: number; incremento: number }>> => {
    const ritmos = await prisma.ritmoJuego.findMany({ select: { nombre: true, minutos: true, incremento: true } });
    return new Map(ritmos.map(r => [normalizar(r.nombre), { minutos: r.minutos, incremento: r.incremento }]));
};

/** Clase de un ritmo por su nombre; `null` si la categoría no tiene ritmo o no está en el catálogo. */
export const claseDeRitmoPorNombre = (
    nombreRitmo: string | null | undefined,
    catalogo: Map<string, { minutos: number; incremento: number }>,
    umbrales: UmbralesRitmo
): ClaseRitmo | null => {
    const r = catalogo.get(normalizar(nombreRitmo));
    return r ? clasificarRitmo(r.minutos, r.incremento, umbrales) : null;
};

/** Clase de ritmo de una categoría de torneo (`idTorneoCat`). */
export const claseDeTorneoCategoria = async (idTorneoCat: number): Promise<ClaseRitmo | null> => {
    const tc = await prisma.torneoCategoria.findUnique({ where: { idTorneoCat }, select: { ritmo_juego: true } });
    if (!tc) return null;
    return claseDeRitmoPorNombre(tc.ritmo_juego, await cargarCatalogoRitmos(), await obtenerUmbrales());
};

/** Clase de ritmo de la categoría `idCategoria` dentro del torneo `idTorneo`. */
export const claseDeCategoriaEnTorneo = async (idTorneo: number, idCategoria: number): Promise<ClaseRitmo | null> => {
    const tc = await prisma.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
        select: { ritmo_juego: true },
    });
    if (!tc) return null;
    return claseDeRitmoPorNombre(tc.ritmo_juego, await cargarCatalogoRitmos(), await obtenerUmbrales());
};

/**
 * Clasificación de TODAS las categorías activas de un torneo y resumen:
 *  - `ritmo`: la clase común si todas coinciden, 'mixto' si hay clases distintas, `null` si ninguna tiene ritmo.
 *  - `sinRitmo`: categorías sin ritmo asignado (o con un ritmo que no está en el catálogo).
 */
export const clasificarCategoriasDeTorneo = async (idTorneo: number) => {
    const [categorias, catalogo, umbrales] = await Promise.all([
        prisma.torneoCategoria.findMany({
            where: { idTorneo, activo: true },
            select: { idTorneoCat: true, idCategoria: true, ritmo_juego: true, categoria: { select: { nombre: true } } },
            orderBy: { idCategoria: 'asc' },
        }),
        cargarCatalogoRitmos(),
        obtenerUmbrales(),
    ]);

    const detalle = categorias.map(c => ({
        idTorneoCat: c.idTorneoCat,
        idCategoria: c.idCategoria,
        categoria: c.categoria.nombre,
        ritmo_juego: c.ritmo_juego,
        clase: claseDeRitmoPorNombre(c.ritmo_juego, catalogo, umbrales),
    }));

    const clases = [...new Set(detalle.map(d => d.clase).filter((c): c is ClaseRitmo => c !== null))];
    const ritmo: ClaseRitmo | 'mixto' | null = clases.length === 0 ? null : clases.length === 1 ? clases[0] : 'mixto';

    return {
        ritmo,
        clases,
        sinRitmo: detalle.filter(d => d.clase === null).map(d => d.categoria),
        categorias: detalle,
    };
};
