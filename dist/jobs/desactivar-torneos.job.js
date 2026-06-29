"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarJobDesactivacion = exports.ejecutarDesactivacionTorneos = void 0;
const database_1 = __importDefault(require("../config/database"));
const fecha_utils_1 = require("../utils/fecha.utils");
// ── Job: auto-desactivar torneos pasados ─────────────────────
// Se ejecuta una vez al día al iniciar el servidor y cada 24h.
// Desactiva torneos activos cuya fecha + diasAutoDesactivar ya pasó.
// El umbral de días se lee de config_gral (default: 3 días).
const ejecutarDesactivacionTorneos = async () => {
    try {
        // Leer umbral de días desde config_gral
        const config = await database_1.default.configGral.findFirst({
            where: { idConfig: 1 },
            select: { diasAutoDesactivar: true },
        });
        const diasGracia = config?.diasAutoDesactivar ?? 3;
        // Buscar torneos activos que podrían necesitar desactivarse
        const torneosActivos = await database_1.default.torneo.findMany({
            where: {
                activo: true,
                estado: { in: ['publicado', 'en_curso', 'finalizado'] },
            },
            select: { idTorneo: true, nombre: true, fecha: true, estado: true },
        });
        const aDesactivar = [];
        for (const torneo of torneosActivos) {
            const pasado = await (0, fecha_utils_1.torneoYaPaso)(torneo.fecha, diasGracia);
            if (pasado)
                aDesactivar.push(torneo.idTorneo);
        }
        if (aDesactivar.length === 0) {
            console.log(`[Job] Torneos: ninguno para desactivar`);
            return;
        }
        // Desactivar en batch y marcar como finalizado si aún no lo está
        const resultado = await database_1.default.torneo.updateMany({
            where: { idTorneo: { in: aDesactivar } },
            data: {
                activo: false,
                es_actual: false,
                estado: 'finalizado',
                fecha_actualizacion: new Date(),
            },
        });
        console.log(`[Job] Torneos desactivados: ${resultado.count} (ids: ${aDesactivar.join(', ')})`);
    }
    catch (error) {
        console.error('[Job] Error en desactivación de torneos:', error);
    }
};
exports.ejecutarDesactivacionTorneos = ejecutarDesactivacionTorneos;
// ── Inicializar job ──────────────────────────────────────────
// Llama esta función desde server.ts al arrancar
const iniciarJobDesactivacion = () => {
    const INTERVALO_MS = 24 * 60 * 60 * 1000; // 24 horas
    // Ejecutar inmediatamente al arrancar
    (0, exports.ejecutarDesactivacionTorneos)();
    // Luego cada 24 horas
    setInterval(exports.ejecutarDesactivacionTorneos, INTERVALO_MS);
    console.log('Job de desactivación de torneos iniciado (cada 24h)');
};
exports.iniciarJobDesactivacion = iniciarJobDesactivacion;
//# sourceMappingURL=desactivar-torneos.job.js.map