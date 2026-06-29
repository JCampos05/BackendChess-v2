"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarPatrocinadores = exports.listarSistemasPago = exports.listarSistemasDesempate = exports.listarSistemasCompetencia = exports.listarRitmosJuego = exports.listarCategorias = exports.listarZonasHorarias = exports.actualizarConfig = exports.obtenerConfigCompleta = exports.obtenerConfig = void 0;
const config_validations_1 = require("../validations/config.validations");
const configService = __importStar(require("../services/config.service"));
// GET /api/config
// Público — el frontend necesita datos del comité (nombre, redes, etc.)
const obtenerConfig = async (_req, res, next) => {
    try {
        const config = await configService.obtenerConfig();
        // Para respuesta pública omitir campos sensibles
        const { zona_horaria, nombreComite, descripcion, facebook, instagram, twitter, youtube, whatsapp, telefono, email, ciudad, estado, pais } = config;
        res.json({
            ok: true,
            data: {
                nombreComite, descripcion, telefono, email,
                ciudad, estado, pais,
                redes: { facebook, instagram, twitter, youtube, whatsapp },
                zona_horaria: {
                    nombreZona: zona_horaria?.nombreZona,
                    nombreMostrar: zona_horaria?.nombreMostrar,
                    offsetUTC: zona_horaria?.offsetUTC,
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerConfig = obtenerConfig;
// GET /api/config/completa — solo adminGral (incluye diasAutoDesactivar, extras, etc.)
const obtenerConfigCompleta = async (_req, res, next) => {
    try {
        const config = await configService.obtenerConfig();
        res.json({ ok: true, data: config });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerConfigCompleta = obtenerConfigCompleta;
// PATCH /api/config — solo adminGral
const actualizarConfig = async (req, res, next) => {
    try {
        const datos = config_validations_1.actualizarConfigSchema.parse(req.body);
        const config = await configService.actualizarConfig(datos);
        res.json({ ok: true, mensaje: 'Configuración actualizada', data: config });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarConfig = actualizarConfig;
// ── Catálogos ─────────────────────────────────────────────────
// Todos públicos — el frontend los usa para los formularios de inscripción
const listarZonasHorarias = async (_req, res, next) => {
    try {
        const data = await configService.listarZonasHorarias();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.listarZonasHorarias = listarZonasHorarias;
const listarCategorias = async (_req, res, next) => {
    try {
        const data = await configService.listarCategorias();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.listarCategorias = listarCategorias;
const listarRitmosJuego = async (_req, res, next) => {
    try {
        const data = await configService.listarRitmosJuego();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.listarRitmosJuego = listarRitmosJuego;
const listarSistemasCompetencia = async (_req, res, next) => {
    try {
        const data = await configService.listarSistemasCompetencia();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.listarSistemasCompetencia = listarSistemasCompetencia;
const listarSistemasDesempate = async (_req, res, next) => {
    try {
        const data = await configService.listarSistemasDesempate();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.listarSistemasDesempate = listarSistemasDesempate;
const listarSistemasPago = async (_req, res, next) => {
    try {
        const data = await configService.listarSistemasPago();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.listarSistemasPago = listarSistemasPago;
const listarPatrocinadores = async (_req, res, next) => {
    try {
        const data = await configService.listarPatrocinadores();
        res.json({ ok: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.listarPatrocinadores = listarPatrocinadores;
//# sourceMappingURL=config.controller.js.map