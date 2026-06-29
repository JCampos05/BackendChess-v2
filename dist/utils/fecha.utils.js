"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jugadorPuedeInscribirse = exports.calcularEdadParaTorneo = exports.torneoYaPaso = exports.inscripcionesCerradas = exports.ahoraEnZona = exports.ahoraLocal = exports.formatearFecha = exports.aLocal = exports.aUTC = exports.invalidarCacheZona = exports.obtenerZonaSistema = void 0;
const luxon_1 = require("luxon");
const database_1 = __importDefault(require("../config/database"));
// Zona horaria por defecto si no hay config en BD
const ZONA_DEFAULT = 'America/Chicago';
// ── Obtener zona horaria configurada en el sistema ──────────
// Se cachea en memoria para no consultar la BD en cada request
let zonaCache = null;
let zonaCacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const obtenerZonaSistema = async () => {
    const ahora = Date.now();
    if (zonaCache && ahora - zonaCacheTimestamp < CACHE_TTL_MS) {
        return zonaCache;
    }
    try {
        const config = await database_1.default.configGral.findFirst({
            where: { idConfig: 1 },
            include: { zona_horaria: true },
        });
        const zona = config?.zona_horaria?.nombreZona ?? ZONA_DEFAULT;
        zonaCache = zona;
        zonaCacheTimestamp = ahora;
        return zona;
    }
    catch {
        return zonaCache ?? ZONA_DEFAULT;
    }
};
exports.obtenerZonaSistema = obtenerZonaSistema;
// Invalidar cache manualmente (llamar cuando adminGral cambia la zona)
const invalidarCacheZona = () => {
    zonaCache = null;
    zonaCacheTimestamp = 0;
};
exports.invalidarCacheZona = invalidarCacheZona;
// ── Conversiones principales ────────────────────────────────
// Convierte fecha local del sistema → UTC para guardar en BD
const aUTC = async (fecha) => {
    const zona = await (0, exports.obtenerZonaSistema)();
    const dt = luxon_1.DateTime.fromJSDate(typeof fecha === 'string' ? new Date(fecha) : fecha, { zone: zona });
    return dt.toUTC().toJSDate();
};
exports.aUTC = aUTC;
// Convierte UTC de la BD → hora local del sistema para mostrar
const aLocal = async (fecha) => {
    const zona = await (0, exports.obtenerZonaSistema)();
    const dt = luxon_1.DateTime.fromJSDate(typeof fecha === 'string' ? new Date(fecha) : fecha, { zone: 'UTC' });
    return dt.setZone(zona);
};
exports.aLocal = aLocal;
// Convierte UTC → string formateado en hora local
const formatearFecha = async (fecha, formato = "dd/MM/yyyy HH:mm") => {
    const local = await (0, exports.aLocal)(fecha);
    return local.toFormat(formato);
};
exports.formatearFecha = formatearFecha;
// ── Obtener fecha/hora actual en zona del sistema ───────────
const ahoraLocal = async () => {
    const zona = await (0, exports.obtenerZonaSistema)();
    return luxon_1.DateTime.now().setZone(zona);
};
exports.ahoraLocal = ahoraLocal;
// Versión sincrónica con zona explícita (para usar en jobs/cron)
const ahoraEnZona = (zona) => {
    return luxon_1.DateTime.now().setZone(zona);
};
exports.ahoraEnZona = ahoraEnZona;
// ── Utilidades de comparación ───────────────────────────────
// Verifica si las inscripciones de un torneo están cerradas
const inscripcionesCerradas = async (cierre) => {
    if (!cierre)
        return false;
    const ahora = await (0, exports.ahoraLocal)();
    const fechaCierre = luxon_1.DateTime.fromJSDate(typeof cierre === 'string' ? new Date(cierre) : cierre, { zone: await (0, exports.obtenerZonaSistema)() });
    return ahora >= fechaCierre;
};
exports.inscripcionesCerradas = inscripcionesCerradas;
// Verifica si un torneo ya pasó (para auto-desactivación)
const torneoYaPaso = async (fechaTorneo, diasGracia = 3) => {
    const ahora = await (0, exports.ahoraLocal)();
    const zona = await (0, exports.obtenerZonaSistema)();
    const fechaBase = luxon_1.DateTime.fromJSDate(typeof fechaTorneo === 'string' ? new Date(fechaTorneo) : fechaTorneo, { zone: zona });
    const fechaLimite = fechaBase.plus({ days: diasGracia });
    return ahora > fechaLimite;
};
exports.torneoYaPaso = torneoYaPaso;
// ── Validación de edad para inscripciones ──────────────────
// Calcula la edad del jugador según el tipo de validación de la categoría:
// anio_torneo  → año_torneo - año_nacimiento (estándar FIDE)
// fecha_exacta → edad exacta a la fecha del torneo
const calcularEdadParaTorneo = (fechaNacimiento, fechaTorneo, tipo) => {
    const nacimiento = luxon_1.DateTime.fromJSDate(fechaNacimiento);
    const torneo = luxon_1.DateTime.fromJSDate(fechaTorneo);
    if (tipo === 'anio_torneo') {
        // Estándar FIDE: solo importa el año
        return torneo.year - nacimiento.year;
    }
    // fecha_exacta: edad precisa al día del torneo
    return Math.floor(torneo.diff(nacimiento, 'years').years);
};
exports.calcularEdadParaTorneo = calcularEdadParaTorneo;
// Verifica si un jugador puede inscribirse en una categoría
const jugadorPuedeInscribirse = (fechaNacimiento, fechaTorneo, edadMinima, edadMaxima, tipoValidacion) => {
    const edad = (0, exports.calcularEdadParaTorneo)(fechaNacimiento, fechaTorneo, tipoValidacion);
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
exports.jugadorPuedeInscribirse = jugadorPuedeInscribirse;
//# sourceMappingURL=fecha.utils.js.map