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
exports.verificarElegibilidad = exports.confirmarPago = exports.cambiarEstado = exports.actualizar = exports.crear = exports.obtenerUno = exports.buscar = exports.listar = void 0;
const jugador_validations_1 = require("../validations/jugador.validations");
const jugadorService = __importStar(require("../services/jugador.service"));
// GET /api/jugadores
const listar = async (req, res, next) => {
    try {
        const filtros = jugador_validations_1.filtrosJugadorSchema.parse(req.query);
        const resultado = await jugadorService.listarJugadores(filtros);
        res.json({ ok: true, ...resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.listar = listar;
// GET /api/jugadores/buscar?q=termino
const buscar = async (req, res, next) => {
    try {
        const termino = req.query.q ?? '';
        if (termino.length < 2) {
            res.status(400).json({ ok: false, mensaje: 'Mínimo 2 caracteres' });
            return;
        }
        const jugadores = await jugadorService.buscarJugadoresPorNombre(termino);
        res.json({ ok: true, data: jugadores });
    }
    catch (err) {
        next(err);
    }
};
exports.buscar = buscar;
// GET /api/jugadores/:id
const obtenerUno = async (req, res, next) => {
    try {
        const idJugador = Number(req.params.id);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const jugador = await jugadorService.obtenerJugadorPorId(idJugador);
        res.json({ ok: true, data: jugador });
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerUno = obtenerUno;
// POST /api/jugadores
const crear = async (req, res, next) => {
    try {
        const datos = jugador_validations_1.crearJugadorSchema.parse(req.body);
        const jugador = await jugadorService.crearJugador(datos);
        res.status(201).json({ ok: true, mensaje: 'Jugador registrado', data: jugador });
    }
    catch (err) {
        next(err);
    }
};
exports.crear = crear;
// PATCH /api/jugadores/:id
const actualizar = async (req, res, next) => {
    try {
        const idJugador = Number(req.params.id);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const datos = jugador_validations_1.actualizarJugadorSchema.parse(req.body);
        const jugador = await jugadorService.actualizarJugador(idJugador, datos);
        res.json({ ok: true, mensaje: 'Jugador actualizado', data: jugador });
    }
    catch (err) {
        next(err);
    }
};
exports.actualizar = actualizar;
// PATCH /api/jugadores/:id/estado
const cambiarEstado = async (req, res, next) => {
    try {
        const idJugador = Number(req.params.id);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const { estado } = req.body;
        const estadosValidos = ['pendiente_pago', 'activo', 'inactivo'];
        if (!estadosValidos.includes(estado)) {
            res.status(400).json({
                ok: false,
                mensaje: `Estado inválido. Opciones: ${estadosValidos.join(', ')}`,
            });
            return;
        }
        const jugador = await jugadorService.cambiarEstadoJugador(idJugador, estado);
        res.json({ ok: true, mensaje: `Estado cambiado a ${estado}`, data: jugador });
    }
    catch (err) {
        next(err);
    }
};
exports.cambiarEstado = cambiarEstado;
// PATCH /api/jugadores/:id/confirmar-pago
// Un adminGral o adminTorneo confirma el pago → jugador pasa a activo
const confirmarPago = async (req, res, next) => {
    try {
        const idJugador = Number(req.params.id);
        if (isNaN(idJugador)) {
            res.status(400).json({ ok: false, mensaje: 'ID inválido' });
            return;
        }
        const jugador = await jugadorService.confirmarPagoJugador(idJugador);
        res.json({ ok: true, mensaje: 'Pago confirmado. Jugador activado.', data: jugador });
    }
    catch (err) {
        next(err);
    }
};
exports.confirmarPago = confirmarPago;
// GET /api/jugadores/:id/elegibilidad?idTorneo=1&idCategoria=2
// Verifica si un jugador puede inscribirse en un torneo/categoría
const verificarElegibilidad = async (req, res, next) => {
    try {
        const idJugador = Number(req.params.id);
        const idTorneo = Number(req.query.idTorneo);
        const idCategoria = req.query.idCategoria ? Number(req.query.idCategoria) : undefined;
        if (isNaN(idJugador) || isNaN(idTorneo)) {
            res.status(400).json({
                ok: false,
                mensaje: 'Se requieren idJugador e idTorneo válidos',
            });
            return;
        }
        const resultado = await jugadorService.verificarElegibilidad(idJugador, idTorneo, idCategoria);
        res.json({ ok: true, data: resultado });
    }
    catch (err) {
        next(err);
    }
};
exports.verificarElegibilidad = verificarElegibilidad;
//# sourceMappingURL=jugador.controller.js.map