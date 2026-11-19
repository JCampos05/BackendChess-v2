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

// ── Cierre de inscripciones: hora de pared de la zona del sistema ──
// El admin captura el cierre como una hora "de reloj" ("20 nov, 18:00") sin zona. Se guarda tal cual, como hora de
// pared dentro de la columna DateTime (que Prisma maneja como UTC): 18:00 se guarda como 18:00Z. NO es un instante real:
// al decidir si ya cerró, esa hora de pared se interpreta en la zona horaria configurada en Configuración general.
// Los formularios y las pantallas leen/escriben esa misma hora de pared (sin convertir con la zona del navegador).

/** "YYYY-MM-DDTHH:mm[:ss]" capturado en el formulario → Date con esa hora de pared (sin depender de la zona del servidor). */
export const cierreAFecha = (valor: string): Date => {
    const conZona = /(Z|[+-]\d{2}:\d{2})$/.test(valor);
    return new Date(conZona ? valor : `${valor}Z`);
};

/** La hora de pared guardada (Date) → DateTime en la zona horaria configurada del sistema. */
export const cierreEnZonaSistema = async (cierre: Date | string): Promise<DateTime> => {
    const pared = DateTime.fromJSDate(typeof cierre === 'string' ? new Date(cierre) : cierre, { zone: 'utc' });
    return DateTime.fromObject(
        { year: pared.year, month: pared.month, day: pared.day, hour: pared.hour, minute: pared.minute, second: pared.second },
        { zone: await obtenerZonaSistema() }
    );
};

// Verifica si las inscripciones ya cerraron según la zona horaria configurada
export const inscripcionesCerradas = async (
    cierre: Date | string | null
): Promise<boolean> => {
    if (!cierre) return false;
    const ahora = await ahoraLocal();
    return ahora >= (await cierreEnZonaSistema(cierre));
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
    // Ambas son columnas de fecha (sin hora) que Prisma entrega como medianoche UTC: se leen con componentes UTC.
    // Con la zona del servidor, quien nace el 1 de enero salía un año mayor en servidores al oeste de UTC.
    const anioNac = fechaNacimiento.getUTCFullYear();
    const anioTorneo = fechaTorneo.getUTCFullYear();

    if (tipo === 'anio_torneo') {
        // Estándar FIDE: solo importa el año
        return anioTorneo - anioNac;
    }

    // fecha_exacta: edad cumplida al día del torneo
    let edad = anioTorneo - anioNac;
    const mesNac = fechaNacimiento.getUTCMonth();
    const mesTorneo = fechaTorneo.getUTCMonth();
    if (mesTorneo < mesNac || (mesTorneo === mesNac && fechaTorneo.getUTCDate() < fechaNacimiento.getUTCDate())) {
        edad--;
    }
    return edad;
};

// Verifica si un jugador puede inscribirse en una categoría
export const jugadorPuedeInscribirse = (
    fechaNacimiento: Date,
    fechaTorneo: Date,
    edadMinima: number | null,
    edadMaxima: number | null,
    tipoValidacion: 'anio_torneo' | 'fecha_exacta',
    anios?: { desde?: number | null; hasta?: number | null }
): { puede: boolean; edad: number; motivo?: string } => {
    const edad = calcularEdadParaTorneo(fechaNacimiento, fechaTorneo, tipoValidacion);

    // Regla por año de nacimiento (convocatorias: "nacidos de 2011 a 2014"): si está definida, manda sobre la edad.
    const desde = anios?.desde ?? null;
    const hasta = anios?.hasta ?? null;
    if (desde !== null || hasta !== null) {
        const anioNac = fechaNacimiento.getUTCFullYear();
        const rango = desde !== null && hasta !== null ? `de ${desde} a ${hasta}`
            : desde !== null ? `en ${desde} o después` : `en ${hasta} o antes`;
        if ((desde !== null && anioNac < desde) || (hasta !== null && anioNac > hasta)) {
            return {
                puede: false,
                edad,
                motivo: `El jugador nació en ${anioNac}. La categoría es para nacidos ${rango}.`,
            };
        }
        return { puede: true, edad };
    }

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