import prisma from '../config/database';
import { torneoYaPaso } from '../utils/fecha.utils';

// ── Job: auto-desactivar torneos pasados ─────────────────────
// Se ejecuta una vez al día al iniciar el servidor y cada 24h.
// Desactiva torneos activos cuya fecha + diasAutoDesactivar ya pasó.
// El umbral de días se lee de config_gral (default: 3 días).

export const ejecutarDesactivacionTorneos = async (): Promise<void> => {
    try {
        // Leer umbral de días desde config_gral
        const config = await prisma.configGral.findFirst({
            where: { idConfig: 1 },
            select: { diasAutoDesactivar: true },
        });
        const diasGracia = config?.diasAutoDesactivar ?? 3;

        // Buscar torneos activos que podrían necesitar desactivarse
        const torneosActivos = await prisma.torneo.findMany({
            where: {
                activo: true,
                estado: { in: ['publicado', 'en_curso', 'finalizado'] },
            },
            select: { idTorneo: true, nombre: true, fecha: true, estado: true },
        });

        const aDesactivar: number[] = [];

        for (const torneo of torneosActivos) {
            const pasado = await torneoYaPaso(torneo.fecha, diasGracia);
            if (pasado) aDesactivar.push(torneo.idTorneo);
        }

        if (aDesactivar.length === 0) {
            console.log(`[Job] Torneos: ninguno para desactivar`);
            return;
        }

        // Desactivar en batch y marcar como finalizado si aún no lo está
        const resultado = await prisma.torneo.updateMany({
            where: { idTorneo: { in: aDesactivar } },
            data: {
                activo: false,
                es_actual: false,
                estado: 'finalizado',
                fecha_actualizacion: new Date(),
            },
        });

        console.log(`[Job] Torneos desactivados: ${resultado.count} (ids: ${aDesactivar.join(', ')})`);
    } catch (error) {
        console.error('[Job] Error en desactivación de torneos:', error);
    }
};

// ── Inicializar job ──────────────────────────────────────────
// Llama esta función desde server.ts al arrancar

export const iniciarJobDesactivacion = (): void => {
    const INTERVALO_MS = 24 * 60 * 60 * 1000; // 24 horas

    // Ejecutar inmediatamente al arrancar
    ejecutarDesactivacionTorneos();

    // Luego cada 24 horas
    setInterval(ejecutarDesactivacionTorneos, INTERVALO_MS);

    console.log('Job de desactivación de torneos iniciado (cada 24h)');
};