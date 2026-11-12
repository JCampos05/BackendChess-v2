// Punto de entrada: conecta la BD, pone a escuchar la aplicación (definida en `app.ts`) y arranca los jobs.
import 'dotenv/config';
import { app } from './app';
import { prisma } from './config/database';
import { iniciarJobDesactivacion } from './jobs/desactivar-torneos.job';

const PORT = process.env.PORT ?? 3000;

// ── Inicio ────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await prisma.$connect();
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
        iniciarJobDesactivacion();

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });

startServer();
