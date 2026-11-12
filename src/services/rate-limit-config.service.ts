import { Prisma } from '@prisma/client';
import prisma from '../config/database';

// ════════════════════════════════════════════════════════════
// Límites de peticiones ajustables desde el panel (Configuración > General).
//
// Se guardan dentro del campo `extras` de la configuración del comité, en la clave `rateLimit`, sin cambiar la
// estructura de la base de datos. Solo son ajustables los dos que dependen de la situación real (tráfico general y
// inscripciones públicas); los de seguridad (inicio de sesión, folios, búsqueda) quedan fijos a propósito.
//
// Orden de resolución de cada límite:
//   1. valor guardado en la base de datos (si es válido y está dentro de su rango)
//   2. variable de entorno (si es válida y está dentro de su rango)
//   3. valor por defecto
// Los rangos impiden dejar el sistema sin protección (mínimo) o sin sentido (máximo).
// ════════════════════════════════════════════════════════════

export type ClaveLimite = 'generalPorMinuto' | 'inscripcionPor15Min';

interface DefinicionLimite {
    /** Texto para mostrar en bitácora y pantallas. */
    etiqueta: string;
    variableEntorno: string;
    porDefecto: number;
    minimo: number;
    maximo: number;
}

export const DEFINICIONES_LIMITES: Record<ClaveLimite, DefinicionLimite> = {
    generalPorMinuto: {
        etiqueta: 'Peticiones por minuto, por IP (todo el servidor)',
        variableEntorno: 'RATE_LIMIT_GENERAL_POR_MINUTO',
        porDefecto: 300,
        minimo: 60,
        maximo: 3000,
    },
    inscripcionPor15Min: {
        etiqueta: 'Inscripciones públicas cada 15 minutos, por IP',
        variableEntorno: 'RATE_LIMIT_INSCRIPCION_POR_15_MIN',
        porDefecto: 20,
        minimo: 5,
        maximo: 500,
    },
};

export const CLAVES_LIMITES = Object.keys(DEFINICIONES_LIMITES) as ClaveLimite[];

/** Cuánto tiempo se reutiliza lo leído de la base de datos antes de volver a consultarla. */
const VIGENCIA_CACHE_MS = 60_000;

type Guardados = Partial<Record<ClaveLimite, number>>;

let cache: { guardados: Guardados; leidoEn: number } | null = null;

const esEnteroEnRango = (valor: unknown, minimo: number, maximo: number): valor is number =>
    typeof valor === 'number' && Number.isInteger(valor) && valor >= minimo && valor <= maximo;

/**
 * Función pura (se puede probar sin base de datos): decide el valor final de un límite.
 * `guardado` viene de la base de datos y `entorno` de la variable de entorno (texto o ausente).
 */
export const resolverLimite = (
    guardado: unknown,
    entorno: string | undefined,
    def: Pick<DefinicionLimite, 'porDefecto' | 'minimo' | 'maximo'>
): { valor: number; origen: 'base_de_datos' | 'entorno' | 'por_defecto' } => {
    if (esEnteroEnRango(guardado, def.minimo, def.maximo)) return { valor: guardado, origen: 'base_de_datos' };

    const deEntorno = entorno !== undefined && entorno !== '' ? Number(entorno) : NaN;
    if (esEnteroEnRango(deEntorno, def.minimo, def.maximo)) return { valor: deEntorno, origen: 'entorno' };

    return { valor: def.porDefecto, origen: 'por_defecto' };
};

/** Lee de la base de datos los valores guardados. Nunca lanza: ante cualquier fallo conserva lo último leído. */
const leerGuardados = async (): Promise<Guardados> => {
    const ahora = Date.now();
    if (cache && ahora - cache.leidoEn < VIGENCIA_CACHE_MS) return cache.guardados;

    try {
        const config = await prisma.configGral.findFirst({ where: { idConfig: 1 }, select: { extras: true } });
        const extras = (config?.extras ?? {}) as Record<string, any>;
        const crudo = (extras.rateLimit ?? {}) as Record<string, unknown>;

        const guardados: Guardados = {};
        for (const clave of CLAVES_LIMITES) {
            const valor = crudo[clave];
            if (typeof valor === 'number') guardados[clave] = valor;
        }
        cache = { guardados, leidoEn: ahora };
        return guardados;
    } catch {
        // Si la base de datos no responde, el limitador no puede dejar de funcionar: se usa lo último conocido
        // (o, si no hay nada, la variable de entorno / el valor por defecto) y se reintenta más tarde.
        cache = { guardados: cache?.guardados ?? {}, leidoEn: ahora - VIGENCIA_CACHE_MS + 10_000 };
        return cache.guardados;
    }
};

/** Límite vigente de una clave, usado en cada petición por el limitador. */
export const obtenerLimite = async (clave: ClaveLimite): Promise<number> => {
    const def = DEFINICIONES_LIMITES[clave];
    const guardados = await leerGuardados();
    return resolverLimite(guardados[clave], process.env[def.variableEntorno], def).valor;
};

/** Vista completa para la pantalla de Configuración. */
export const obtenerLimitesParaPanel = async () => {
    const guardados = await leerGuardados();
    return CLAVES_LIMITES.map(clave => {
        const def = DEFINICIONES_LIMITES[clave];
        const { valor, origen } = resolverLimite(guardados[clave], process.env[def.variableEntorno], def);
        return {
            clave,
            etiqueta: def.etiqueta,
            valor,
            origen,
            guardado: guardados[clave] ?? null,
            porDefecto: def.porDefecto,
            minimo: def.minimo,
            maximo: def.maximo,
        };
    });
};

/** Invalida la memoria temporal para que el cambio se aplique de inmediato. */
export const invalidarCacheLimites = (): void => {
    cache = null;
};

/**
 * Guarda los límites indicados dentro de `extras.rateLimit`, conservando el resto de `extras`.
 * Un valor `null` quita el ajuste de esa clave (vuelve a la variable de entorno o al valor por defecto).
 * Devuelve los valores anteriores y nuevos para dejar constancia en la bitácora.
 */
export const guardarLimites = async (cambios: Partial<Record<ClaveLimite, number | null>>) => {
    const config = await prisma.configGral.findFirst({ where: { idConfig: 1 }, select: { extras: true } });
    const extras = { ...((config?.extras ?? {}) as Record<string, any>) };
    const rateLimit: Record<string, unknown> = { ...(extras.rateLimit ?? {}) };

    const antes = { ...rateLimit };
    for (const clave of CLAVES_LIMITES) {
        const valor = cambios[clave];
        if (valor === undefined) continue;
        if (valor === null) delete rateLimit[clave];
        else rateLimit[clave] = valor;
    }
    extras.rateLimit = rateLimit;

    await prisma.configGral.update({
        where: { idConfig: 1 },
        data: { extras: extras as Prisma.InputJsonValue },
    });

    invalidarCacheLimites();
    return { antes, despues: rateLimit };
};
