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
exports.cancelar = exports.confirmarPago = exports.actualizar = exports.crear = exports.obtenerUna = exports.listarPorJugador = exports.listarPorTorneo = void 0;
const inscripcion_validations_1 = require("../validations/inscripcion.validations");
const inscripcionService = __importStar(require("../services/inscripcion.service"));
// GET /api/inscripciones/torneo/:idTorneo
const listarPorTorneo = async (req, res, next) => {
    try {
        const idTorneo = Number(req.params.idTorneo);
        if (isNaN(idTorneo)) {
            res.status(400).json({ ok: false, mensaje: 'ID de torneo inválido' });
            return;
        }
        const soloConfirmados = req.query.estado === 'confirmado';
        // Nombre correcto del servicio: listarInscripcionesTorneo
        const inscripciones = await inscripcionService.listarInscripcionesTorneo(idTorneo, soloConfirmados);
        res.json({ ok: true, data: inscripciones, total: inscripciones.length });
    }
    catch (err) {
        next(err);
    }
};
exports.listarPorTorneo = listarPorTorneo;
// GET /api/inscripciones/jugador/:idJugador
const listarPorJugador = async (req, res, next) => {
    try {
        const idJugador = Number(req.params.idJugador);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID de jugador inválido' });
            return;
        }
        // Nombre correcto: listarInscripcionesJugador
        const inscripciones = await inscripcionService.listarInscripcionesJugador(idJugador);
        res.json({ ok: true, data: inscripciones });
    }
    catch (err) {
        next(err);
    }
};
exports.listarPorJugador = listarPorJugador;
// GET /api/inscripciones/:id
const obtenerUna = async (req, res, next) => {
    try {
        const idInscripcion = Number(req.params.id);
        if (isNaN(idInscripcion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const inscripcion = await inscripcionService.obtenerInscripcionPorId(idInscripcion);
        res.json({ ok: true, data: inscripcion });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerUna = obtenerUna;
// POST /api/inscripciones
const crear = async (req, res, next) => {
    try {
        const datos = inscripcion_validations_1.crearInscripcionSchema.parse(req.body);
        const inscripcion = await inscripcionService.crearInscripcion(datos);
        res.status(201).json({ ok: true, mensaje: 'Jugador inscrito', data: inscripcion });
    }
    catch (err) {
        next(err);
    }
};
exports.crear = crear;
// PATCH /api/inscripciones/:id
const actualizar = async (req, res, next) => {
    try {
        const idInscripcion = Number(req.params.id);
        if (isNaN(idInscripcion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const datos = inscripcion_validations_1.actualizarInscripcionSchema.parse(req.body);
        const inscripcion = await inscripcionService.actualizarInscripcion(idInscripcion, datos);
        res.json({ ok: true, mensaje: 'Inscripción actualizada', data: inscripcion });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizar = actualizar;
// PATCH /api/inscripciones/:id/confirmar-pago
const confirmarPago = async (req, res, next) => {
    try {
        const idInscripcion = Number(req.params.id);
        if (isNaN(idInscripcion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const datos = inscripcion_validations_1.confirmarPagoSchema.parse(req.body);
        // confirmarPago recibe (idInscripcion, datos, idAdminConfirmo)
        const inscripcion = await inscripcionService.confirmarPago(idInscripcion, datos, req.usuario.idUsuario);
        res.json({ ok: true, mensaje: 'Pago confirmado', data: inscripcion });
    }
    catch (err) {
        next(err);
    }
};
exports.confirmarPago = confirmarPago;
// DELETE /api/inscripciones/:id — cancelación lógica
const cancelar = async (req, res, next) => {
    try {
        const idInscripcion = Number(req.params.id);
        if (isNaN(idInscripcion)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const inscripcion = await inscripcionService.cancelarInscripcion(idInscripcion);
        res.json({ ok: true, mensaje: 'Inscripción cancelada', data: inscripcion });
    }
    catch (err) {
        next(err);
    }
};
exports.cancelar = cancelar;
//# sourceMappingURL=inscripcion.controller.js.map