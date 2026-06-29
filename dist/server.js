"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middleware/error.middleware");
const database_1 = require("./config/database");
const index_routes_1 = require("./routes/index.routes");
const desactivar_torneos_job_1 = require("./jobs/desactivar-torneos.job");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3000;
// ── CORS ──────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = [
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/,
            /^https:\/\/.*\.vercel\.app$/,
        ];
        if (!origin)
            return callback(null, true);
        const isAllowed = allowedOrigins.some(p => p instanceof RegExp ? p.test(origin) : p === origin);
        if (isAllowed)
            callback(null, true);
        else {
            console.warn(`CORS bloqueado: ${origin}`);
            callback(new error_middleware_1.CorsError(origin));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With'],
    maxAge: 86400,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ── Logger ────────────────────────────────────────────────────
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});
// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        ok: true,
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
    });
});
// ── Rutas ─────────────────────────────────────────────────────
(0, index_routes_1.registerRoutes)(app);
// ── Manejo global de errores (siempre al final) ───────────────
app.use(error_middleware_1.errorHandler);
// ── Inicio ────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await database_1.prisma.$connect();
        console.log('✅ Conexión a MySQL establecida');
        app.listen(PORT, () => {
            console.log(`
      ╔══════════════════════════════════════════╗
      ║    Backend Comité de Ajedrez v2.0.0    ║
      ║    http://localhost:${PORT}             ║
      ║    Entorno: ${process.env.NODE_ENV}     ║
      ╚══════════════════════════════════════════╝
            `);
        });
        // Iniciar job de desactivación automática de torneos
        (0, desactivar_torneos_job_1.iniciarJobDesactivacion)();
    }
    catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        await database_1.prisma.$disconnect();
        process.exit(1);
    }
};
process.on('SIGTERM', async () => { await database_1.prisma.$disconnect(); process.exit(0); });
process.on('SIGINT', async () => { await database_1.prisma.$disconnect(); process.exit(0); });
startServer();
//# sourceMappingURL=server.js.map