// Aplicación Express: configuración, middlewares y rutas. NO escucha en ningún puerto ni abre la BD:
// eso lo hace `server.ts`. Separarlas permite importar `app` desde pruebas (supertest) sin levantar el servidor.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler, CorsError } from './middleware/error.middleware';
import { registerRoutes } from './routes/index.routes';
import { limitadorGeneral } from './middleware/rate-limit.middleware';

export const app = express();

// ── Proxy de Render ───────────────────────────────────────────
// En Render el servidor está detrás de su balanceador: sin esto `req.ip` sería siempre la IP del proxy (compartida
// por todos los visitantes) y los límites por IP castigarían a todos a la vez. Es el número de proxies de confianza
// entre el visitante y el servidor; si hiciera falta ajustarlo, se cambia con TRUST_PROXY_HOPS sin tocar código.
const TRUST_PROXY_HOPS = Number(process.env.TRUST_PROXY_HOPS ?? 1);
app.set('trust proxy', Number.isInteger(TRUST_PROXY_HOPS) && TRUST_PROXY_HOPS >= 0 ? TRUST_PROXY_HOPS : 1);

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins: (string | RegExp)[] = [
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/,
            /^https:\/\/.*\.vercel\.app$/,
        ];
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some(p =>
            p instanceof RegExp ? p.test(origin) : p === origin
        );
        if (isAllowed) callback(null, true);
        else {
            console.warn(`CORS bloqueado: ${origin}`);
            callback(new CorsError(origin));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With'],
    maxAge: 86400,
}));

// ── Límite general de peticiones por IP ───────────────────────
// Va después de CORS (para que la respuesta 429 sea legible desde el navegador) y antes de leer cuerpos grandes.
app.use(limitadorGeneral);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logger ────────────────────────────────────────────────────
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        // Tu propia IP tal como la ve el servidor: sirve para comprobar que los límites por IP distinguen a cada visitante
        ip: req.ip,
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
    });
});

// ── Rutas ─────────────────────────────────────────────────────
registerRoutes(app);

// ── Manejo global de errores (siempre al final) ───────────────
app.use(errorHandler);
