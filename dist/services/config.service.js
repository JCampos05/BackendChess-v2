"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarPatrocinadores = exports.listarSistemasPago = exports.listarSistemasDesempate = exports.listarSistemasCompetencia = exports.listarRitmosJuego = exports.listarCategorias = exports.listarZonasHorarias = exports.actualizarConfig = exports.obtenerConfig = void 0;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const fecha_utils_1 = require("../utils/fecha.utils");
// ── Obtener configuración ────────────────────────────────────
// Siempre existe un solo registro con idConfig = 1
const obtenerConfig = async () => {
    const config = await database_1.default.configGral.findFirst({
        where: { idConfig: 1 },
        include: { zona_horaria: true },
    });
    if (!config)
        throw new error_middleware_1.NotFoundError('Configuración del sistema no encontrada');
    return config;
};
exports.obtenerConfig = obtenerConfig;
// ── Actualizar configuración ─────────────────────────────────
const actualizarConfig = async (datos) => {
    const config = await database_1.default.configGral.findFirst({ where: { idConfig: 1 } });
    if (!config)
        throw new error_middleware_1.NotFoundError('Configuración del sistema no encontrada');
    const actualizada = await database_1.default.configGral.update({
        where: { idConfig: 1 },
        data: {
            ...(datos.idZonaHoraria !== undefined && { idZonaHoraria: datos.idZonaHoraria }),
            ...(datos.facebook !== undefined && { facebook: datos.facebook }),
            ...(datos.instagram !== undefined && { instagram: datos.instagram }),
            ...(datos.twitter !== undefined && { twitter: datos.twitter }),
            ...(datos.youtube !== undefined && { youtube: datos.youtube }),
            ...(datos.whatsapp !== undefined && { whatsapp: datos.whatsapp }),
            ...(datos.nombreComite !== undefined && { nombreComite: datos.nombreComite }),
            ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
            ...(datos.telefono !== undefined && { telefono: datos.telefono }),
            ...(datos.email !== undefined && { email: datos.email }),
            ...(datos.ciudad !== undefined && { ciudad: datos.ciudad }),
            ...(datos.estado !== undefined && { estado: datos.estado }),
            ...(datos.pais !== undefined && { pais: datos.pais }),
            ...(datos.diasAutoDesactivar !== undefined && { diasAutoDesactivar: datos.diasAutoDesactivar }),
            ...(datos.extras !== undefined && { extras: datos.extras }),
        },
        include: { zona_horaria: true },
    });
    // Si cambió la zona horaria, invalidar el cache del parser de fechas
    if (datos.idZonaHoraria !== undefined) {
        (0, fecha_utils_1.invalidarCacheZona)();
    }
    return actualizada;
};
exports.actualizarConfig = actualizarConfig;
// ── Catálogos del sistema ────────────────────────────────────
const listarZonasHorarias = async () => {
    return database_1.default.zonaHoraria.findMany({
        orderBy: { offsetUTC: 'asc' },
    });
};
exports.listarZonasHorarias = listarZonasHorarias;
const listarCategorias = async (soloActivas = true) => {
    return database_1.default.categoria.findMany({
        orderBy: { nombre: 'asc' },
        select: {
            idCategoria: true,
            nombre: true,
            costo: true,
            nota: true,
            edadMinima: true,
            edadMaxima: true,
            tipo_validacion_edad: true,
        },
    });
};
exports.listarCategorias = listarCategorias;
const listarRitmosJuego = async () => {
    return database_1.default.ritmoJuego.findMany({
        where: { activo: true },
        orderBy: { minutos: 'asc' },
    });
};
exports.listarRitmosJuego = listarRitmosJuego;
const listarSistemasCompetencia = async () => {
    return database_1.default.sistemaCompetencia.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
    });
};
exports.listarSistemasCompetencia = listarSistemasCompetencia;
const listarSistemasDesempate = async () => {
    return database_1.default.sistemaDesempate.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
    });
};
exports.listarSistemasDesempate = listarSistemasDesempate;
const listarSistemasPago = async () => {
    return database_1.default.sistemaPago.findMany({
        where: { activo: true },
        orderBy: { banco: 'asc' },
        select: {
            idSistemaPago: true,
            nombreCuenta: true,
            banco: true,
            clabe: true,
            telefono: true,
        },
    });
};
exports.listarSistemasPago = listarSistemasPago;
const listarPatrocinadores = async () => {
    return database_1.default.patrocinador.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
        select: {
            idPatrocinador: true,
            nombre: true,
            logo_url: true,
            sitio_web: true,
            descripcion: true,
            contacto: true,
        },
    });
};
exports.listarPatrocinadores = listarPatrocinadores;
//# sourceMappingURL=config.service.js.map