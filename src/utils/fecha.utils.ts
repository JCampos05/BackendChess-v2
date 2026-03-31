import { DateTime } from 'luxon';
import prisma from '../config/database';

// Zona horaria por defecto si no hay config en BD
const ZONA_DEFAULT = 'America/Chicago';

// ── Obtener zona horaria configurada en el sistema ──────────
// Se cachea en memoria para no consultar la BD en cada request
let zonaCache: string | null = null;
let zonaCacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export const obtenerZonaSistema = async (): Promise<string> => {
    const ahora = Date.now();

    if (zonaCache && ahora - zonaCacheTimestamp < CACHE_TTL_MS) {
        return zonaCache;
    }

    try {
        const config = await prisma.configGral.findFirst({
            where: { idConfig: 1 },
            include: { zona_horaria: true },
        });

        const zona = config?.zona_horaria?.nombreZona ?? ZONA_DEFAULT;
        zonaCache = zona;
        zonaCacheTimestamp = ahora;
        return zona;
    } catch {
        return zonaCache ?? ZONA_DEFAULT;
    }
};

// Invalidar cache manualmente (llamar cuando adminGral cambia la zona)
export const invalidarCacheZona = (): void => {
    zonaCache = null;
    zonaCacheTimestamp = 0;
};

// ── Conversiones principales ────────────────────────────────

// Convierte fecha local del sistema → UTC para guardar en BD
export const aUTC = async (fecha: Date | string): Promise<Date> => {
    const zona = await obtenerZonaSistema();
    const dt = DateTime.fromJSDate(
        typeof fecha === 'string' ? new Date(fecha) : fecha,
        { zone: zona }
    );
    return dt.toUTC().toJSDate();
};

// Convierte UTC de la BD → hora local del sistema para mostrar
export const aLocal = async (fecha: Date | string): Promise<DateTime> => {
    const zona = await obtenerZonaSistema();
    const dt = DateTime.fromJSDate(
        typeof fecha === 'string' ? new Date(fecha) : fecha,
        { zone: 'UTC' }
    );
    return dt.setZone(zona);
};

// Convierte UTC → string formateado en hora local
export const formatearFecha = async (
    fecha: Date | string,
    formato: string = "dd/MM/yyyy HH:mm"
): Promise<string> => {
    const local = await aLocal(fecha);
    return local.toFormat(formato);
};

// ── Obtener fecha/hora actual en zona del sistema ───────────
export const ahoraLocal = async (): Promise<DateTime> => {
    const zona = await obtenerZonaSistema();
    return DateTime.now().setZone(zona);
};

// Versión sincrónica con zona explícita (para usar en jobs/cron)
export const ahoraEnZona = (zona: string): DateTime => {
    return DateTime.now().setZone(zona);
};

// ── Utilidades de comparación ───────────────────────────────

// Verifica si las inscripciones de un torneo están cerradas
export const inscripcionesCerradas = async (
    cierre: Date | string | null
): Promise<boolean> => {
    if (!cierre) return false;
    const ahora = await ahoraLocal();
    const fechaCierre = DateTime.fromJSDate(
        typeof cierre === 'string' ? new Date(cierre) : cierre,
        { zone: await obtenerZonaSistema() }
    );
    return ahora >= fechaCierre;
};

// Verifica si un torneo ya pasó (para auto-desactivación)
export const torneoYaPaso = async (
    fechaTorneo: Date | string,
    diasGracia: number = 3
): Promise<boolean> => {
    const ahora = await ahoraLocal();
    const zona = await obtenerZonaSistema();
    const fechaBase = DateTime.fromJSDate(
        typeof fechaTorneo === 'string' ? new Date(fechaTorneo) : fechaTorneo,
        { zone: zona }
    );
    const fechaLimite = fechaBase.plus({ days: diasGracia });
    return ahora > fechaLimite;
};

// ── Validación de edad para inscripciones ──────────────────

// Calcula la edad del jugador según el tipo de validación de la categoría:
// anio_torneo  → año_torneo - año_nacimiento (estándar FIDE)
// fecha_exacta → edad exacta a la fecha del torneo
export const calcularEdadParaTorneo = (
    fechaNacimiento: Date,
    fechaTorneo: Date,
    tipo: 'anio_torneo' | 'fecha_exacta'
): number => {
    const nacimiento = DateTime.fromJSDate(fechaNacimiento);
    const torneo = DateTime.fromJSDate(fechaTorneo);

    if (tipo === 'anio_torneo') {
        // Estándar FIDE: solo importa el año
        return torneo.year - nacimiento.year;
    }

    // fecha_exacta: edad precisa al día del torneo
    return Math.floor(torneo.diff(nacimiento, 'years').years);
};

// Verifica si un jugador puede inscribirse en una categoría
export const jugadorPuedeInscribirse = (
    fechaNacimiento: Date,
    fechaTorneo: Date,
    edadMinima: number | null,
    edadMaxima: number | null,
    tipoValidacion: 'anio_torneo' | 'fecha_exacta'
): { puede: boolean; edad: number; motivo?: string } => {
    const edad = calcularEdadParaTorneo(fechaNacimiento, fechaTorneo, tipoValidacion);

    if (edadMinima !== null && edad < edadMinima) {
        return {
            puede: false,
            edad,
            motivo: `El jugador tiene ${edad} años. La categoría requiere mínimo ${edadMinima} años.`,
        };
    }

    if (edadMaxima !== null && edad > edadMaxima) {
        return {
            puede: false,
            edad,
            motivo: `El jugador tiene ${edad} años. La categoría permite máximo ${edadMaxima} años.`,
        };
    }

    return { puede: true, edad };
};