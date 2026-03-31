import { Application, Router } from 'express';
import authRoutes from './auth.routes';
import jugadorRoutes from './jugador.routes';
import inscripcionRoutes from './inscripcion.routes';
import torneoRoutes from './torneo.routes';
import configRoutes from './config.routes';
import ligaRoutes from './liga.routes';

const API = '/api';

export const registerRoutes = (app: Application): void => {
    // ── Configuración y catálogos (públicos) ──────────────────
    app.use(`${API}/config`, configRoutes);

    // ── Autenticación ─────────────────────────────────────────
    app.use(`${API}/seguridad`, authRoutes);

    // ── Jugadores e inscripciones ─────────────────────────────
    app.use(`${API}/jugadores`, jugadorRoutes);
    app.use(`${API}/inscripciones`, inscripcionRoutes);

    // ── Torneos ───────────────────────────────────────────────
    app.use(`${API}/torneos`, torneoRoutes);

    // ── Liga ──────────────────────────────────────────────────
    app.use(`${API}/ligas`, ligaRoutes);

    // ── 404 ───────────────────────────────────────────────────
    const notFound = Router();
    notFound.all('*', (_req, res) => {
        res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada', code: 'NOT_FOUND' });
    });
    app.use(notFound);
};