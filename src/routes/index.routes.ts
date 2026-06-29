import { Application, Router } from 'express';

// ── Autenticación y seguridad ─────────────────────────────────
import authRoutes from './auth.routes';

// ── Jugadores e inscripciones ─────────────────────────────────
import jugadorRoutes from './jugador.routes';
import inscripcionRoutes from './inscripcion.routes';

// ── Torneos ───────────────────────────────────────────────────
import torneoRoutes from './torneo.routes';

// ── Config ────────────────────────────────────────────────────
import configRoutes from './config.routes';

// ── Liga ──────────────────────────────────────────────────────
import ligaRoutes from './liga.routes';

// ── Catálogos (Bloque 3) ──────────────────────────────────────
import { categoriaRouter, ritmoJuegoRouter, sistemaCompetenciaRouter, sistemaDesempateRouter, sistemaPagoRouter } from './catalogo.routes';
import estadisticaRoutes from './estadistica-torneo.routes';
import estadisticasPagoRoutes from './estadisticas-pago.routes';
import inscripcionAdminRoutes from './inscripcion-admin.routes';

// ── Operaciones de torneo (Bloque 3) ──────────────────────────
import torneoCategoriaRouter from './torneo-categoria.routes';
import rondaRouter from './ronda.routes';
import mesaRouter from './mesa.routes';
import partidaRouter from './partida.routes';
import historialRouter from './historial-emparejamiento.routes';

// ── Seguridad ─────────────────────────────────────────────────
import sesionesRoutes from './security/sesiones-activas.routes';
import historialRoutes from './security/historial-accesos.routes';
import logsSistemaRoutes from './security/logs-sistema.routes';

const API = '/api';

export const registerRoutes = (app: Application): void => {
    // ── Config y catálogos (públicos) ──────────────────────────
    app.use(`${API}/config`, configRoutes);

    // ── Autenticación ──────────────────────────────────────────
    app.use(`${API}/auth`, authRoutes);

    // ── Jugadores e inscripciones ──────────────────────────────
    app.use(`${API}/jugadores`, jugadorRoutes);
    app.use(`${API}/inscripciones`, inscripcionRoutes);

    // ── Torneos ────────────────────────────────────────────────
    app.use(`${API}/torneos`, torneoRoutes);

    // ── Liga ───────────────────────────────────────────────────
    app.use(`${API}/ligas`, ligaRoutes);

    // ── Catálogos (Bloque 3) ───────────────────────────────────
    app.use(`${API}/categorias`, categoriaRouter);
    app.use(`${API}/ritmos-juego`, ritmoJuegoRouter);
    app.use(`${API}/sistemas-competencia`, sistemaCompetenciaRouter);
    app.use(`${API}/sistemas-desempate`, sistemaDesempateRouter);
    app.use(`${API}/sistema-pago`, sistemaPagoRouter);

    // ── Operaciones de torneo (Bloque 3) ───────────────────────
    app.use(`${API}/torneo-categorias`, torneoCategoriaRouter);
    app.use(`${API}/rondas`, rondaRouter);
    app.use(`${API}/mesas`, mesaRouter);
    app.use(`${API}/partidas`, partidaRouter);
    app.use(`${API}/historial-emparejamiento`, historialRouter);

    app.use(`${API}/estadisticas`, estadisticaRoutes);
    app.use(`${API}/estadisticas-pago`, estadisticasPagoRoutes);
    app.use(`${API}/inscripciones-admin`, inscripcionAdminRoutes);

    // ── Seguridad ─────────────────────────────────────────────────
    app.use(`${API}/seguridad/sesiones`, sesionesRoutes);
    app.use(`${API}/seguridad/historial`, historialRoutes);
    app.use(`${API}/seguridad/logs`, logsSistemaRoutes);

    // ── 404 ────────────────────────────────────────────────────
    const notFound = Router();
    notFound.all('*', (_req, res) => {
        res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada', code: 'NOT_FOUND' });
    });
    app.use(notFound);
};