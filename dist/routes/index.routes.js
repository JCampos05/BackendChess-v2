"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const express_1 = require("express");
// ── Autenticación y seguridad ─────────────────────────────────
const auth_routes_1 = __importDefault(require("./auth.routes"));
// ── Jugadores e inscripciones ─────────────────────────────────
const jugador_routes_1 = __importDefault(require("./jugador.routes"));
const inscripcion_routes_1 = __importDefault(require("./inscripcion.routes"));
// ── Torneos ───────────────────────────────────────────────────
const torneo_routes_1 = __importDefault(require("./torneo.routes"));
// ── Config ────────────────────────────────────────────────────
const config_routes_1 = __importDefault(require("./config.routes"));
// ── Liga ──────────────────────────────────────────────────────
const liga_routes_1 = __importDefault(require("./liga.routes"));
// ── Catálogos (Bloque 3) ──────────────────────────────────────
const catalogo_routes_1 = require("./catalogo.routes");
const estadistica_torneo_routes_1 = __importDefault(require("./estadistica-torneo.routes"));
const estadisticas_pago_routes_1 = __importDefault(require("./estadisticas-pago.routes"));
const inscripcion_admin_routes_1 = __importDefault(require("./inscripcion-admin.routes"));
// ── Operaciones de torneo (Bloque 3) ──────────────────────────
const torneo_categoria_routes_1 = __importDefault(require("./torneo-categoria.routes"));
const ronda_routes_1 = __importDefault(require("./ronda.routes"));
const mesa_routes_1 = __importDefault(require("./mesa.routes"));
const partida_routes_1 = __importDefault(require("./partida.routes"));
const historial_emparejamiento_routes_1 = __importDefault(require("./historial-emparejamiento.routes"));
// ── Seguridad ─────────────────────────────────────────────────
const sesiones_activas_routes_1 = __importDefault(require("./security/sesiones-activas.routes"));
const historial_accesos_routes_1 = __importDefault(require("./security/historial-accesos.routes"));
const logs_sistema_routes_1 = __importDefault(require("./security/logs-sistema.routes"));
const API = '/api';
const registerRoutes = (app) => {
    // ── Config y catálogos (públicos) ──────────────────────────
    app.use(`${API}/config`, config_routes_1.default);
    // ── Autenticación ──────────────────────────────────────────
    app.use(`${API}/auth`, auth_routes_1.default);
    // ── Jugadores e inscripciones ──────────────────────────────
    app.use(`${API}/jugadores`, jugador_routes_1.default);
    app.use(`${API}/inscripciones`, inscripcion_routes_1.default);
    // ── Torneos ────────────────────────────────────────────────
    app.use(`${API}/torneos`, torneo_routes_1.default);
    // ── Liga ───────────────────────────────────────────────────
    app.use(`${API}/ligas`, liga_routes_1.default);
    // ── Catálogos (Bloque 3) ───────────────────────────────────
    app.use(`${API}/categorias`, catalogo_routes_1.categoriaRouter);
    app.use(`${API}/ritmos-juego`, catalogo_routes_1.ritmoJuegoRouter);
    app.use(`${API}/sistemas-competencia`, catalogo_routes_1.sistemaCompetenciaRouter);
    app.use(`${API}/sistemas-desempate`, catalogo_routes_1.sistemaDesempateRouter);
    app.use(`${API}/sistema-pago`, catalogo_routes_1.sistemaPagoRouter);
    // ── Operaciones de torneo (Bloque 3) ───────────────────────
    app.use(`${API}/torneo-categorias`, torneo_categoria_routes_1.default);
    app.use(`${API}/rondas`, ronda_routes_1.default);
    app.use(`${API}/mesas`, mesa_routes_1.default);
    app.use(`${API}/partidas`, partida_routes_1.default);
    app.use(`${API}/historial-emparejamiento`, historial_emparejamiento_routes_1.default);
    app.use(`${API}/estadisticas`, estadistica_torneo_routes_1.default);
    app.use(`${API}/estadisticas-pago`, estadisticas_pago_routes_1.default);
    app.use(`${API}/inscripciones-admin`, inscripcion_admin_routes_1.default);
    // ── Seguridad ─────────────────────────────────────────────────
    app.use(`${API}/seguridad/sesiones`, sesiones_activas_routes_1.default);
    app.use(`${API}/seguridad/historial`, historial_accesos_routes_1.default);
    app.use(`${API}/seguridad/logs`, logs_sistema_routes_1.default);
    // ── 404 ────────────────────────────────────────────────────
    const notFound = (0, express_1.Router)();
    notFound.all('*', (_req, res) => {
        res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada', code: 'NOT_FOUND' });
    });
    app.use(notFound);
};
exports.registerRoutes = registerRoutes;
//# sourceMappingURL=index.routes.js.map