import prisma from '../config/database';
import { NotFoundError } from '../middleware/error.middleware';

type Periodo = 'dia' | 'semana' | 'mes' | 'anio';

const DIAS_POR_PERIODO: Record<Periodo, number> = {
    dia: 1,
    semana: 7,
    mes: 30,
    anio: 365,
};

const ETIQUETA_ESTADO: Record<string, string> = {
    pendiente_pago: 'pendiente',
    confirmado: 'confirmado',
    cancelado: 'cancelado',
};

const inicioDePeriodo = (periodo: Periodo): Date => {
    const dias = DIAS_POR_PERIODO[periodo];
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
};

// ============================================================
// RESUMEN GENERAL
// ============================================================

export const obtenerResumenGeneral = async (periodo?: Periodo) => {
    // Sin periodo (default): no se filtra por fecha, se muestra el histórico real completo.
    const desde = periodo ? inicioDePeriodo(periodo) : undefined;

    const [inscripciones, torneosActivos] = await Promise.all([
        prisma.inscripcion.findMany({
            where: desde ? { fecha_inscripcion: { gte: desde } } : {},
            select: { estado: true, fecha_inscripcion: true },
        }),
        prisma.torneo.count({ where: { activo: true } }),
    ]);

    const conteoPorEstado = new Map<string, number>();
    for (const ins of inscripciones) {
        const etiqueta = ETIQUETA_ESTADO[ins.estado] ?? ins.estado;
        conteoPorEstado.set(etiqueta, (conteoPorEstado.get(etiqueta) ?? 0) + 1);
    }

    const totalInscripciones = inscripciones.length;

    let dias: number;
    if (periodo) {
        dias = DIAS_POR_PERIODO[periodo];
    } else {
        // Sin filtro: promediar sobre el rango real de datos (primera inscripción -> hoy).
        const fechas = inscripciones
            .map(i => i.fecha_inscripcion)
            .filter((f): f is Date => f !== null);
        if (fechas.length > 0) {
            const masAntigua = new Date(Math.min(...fechas.map(f => f.getTime())));
            const diffMs = Date.now() - masAntigua.getTime();
            dias = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        } else {
            dias = 1;
        }
    }

    return {
        totalInscripciones,
        porEstado: Array.from(conteoPorEstado, ([estado, total]) => ({ estado, total })),
        torneosActivos,
        promedioDiario: Math.round((totalInscripciones / dias) * 10) / 10,
    };
};

// ============================================================
// EVOLUCIÓN TEMPORAL
// ============================================================
//
// Esta gráfica es intencionalmente independiente del selector de período de
// la vista (día/semana/mes/año): siempre agrupa TODO el histórico por año,
// desde la primera inscripción registrada hasta el año en curso, para que
// nunca "desaparezca" el año actual ni dependa de una ventana móvil.

export const obtenerEvolucionTemporal = async () => {
    const inscripciones = await prisma.inscripcion.findMany({
        select: { fecha_inscripcion: true },
    });

    const anioActual = new Date().getFullYear();
    const aniosConDatos = inscripciones
        .map(i => i.fecha_inscripcion?.getFullYear())
        .filter((a): a is number => a !== undefined);

    const anioInicio = aniosConDatos.length > 0 ? Math.min(...aniosConDatos, anioActual) : anioActual;

    const buckets = new Map<number, number>();
    for (let anio = anioInicio; anio <= anioActual; anio++) {
        buckets.set(anio, 0);
    }

    for (const ins of inscripciones) {
        if (!ins.fecha_inscripcion) continue;
        const anio = ins.fecha_inscripcion.getFullYear();
        buckets.set(anio, (buckets.get(anio) ?? 0) + 1);
    }

    return Array.from(buckets.entries())
        .sort(([a], [b]) => a - b)
        .map(([anio, total]) => ({ periodo: `${anio}`, total }));
};

// ============================================================
// RESUMEN DE TORNEOS
// ============================================================

export const obtenerResumenTorneos = async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const tresDiasDespues = new Date(hoy);
    tresDiasDespues.setDate(hoy.getDate() + 3);

    const torneos = await prisma.torneo.findMany({
        include: { _count: { select: { inscripciones: true } } },
        orderBy: { fecha: 'asc' },
    });

    const torneosPasados = torneos.filter(t => t.fecha < hoy).length;

    const torneosFuturos = torneos
        .filter(t => t.fecha >= hoy)
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    const torneoActualEntidad = torneosFuturos.find(t => t.fecha <= tresDiasDespues) ?? null;

    const torneosProximos = torneosFuturos
        .filter(t => t.idTorneo !== torneoActualEntidad?.idTorneo)
        .slice(0, 5)
        .map(t => ({
            idTorneo: t.idTorneo,
            nombre: t.nombre,
            lugar: t.lugar,
            fecha: t.fecha,
            totalInscripciones: t._count.inscripciones,
        }));

    const torneoActual = torneoActualEntidad
        ? {
            idTorneo: torneoActualEntidad.idTorneo,
            nombre: torneoActualEntidad.nombre,
            lugar: torneoActualEntidad.lugar,
            fecha: torneoActualEntidad.fecha,
            totalInscripciones: torneoActualEntidad._count.inscripciones,
        }
        : null;

    return { torneosPasados, torneoActual, torneosProximos };
};

// ============================================================
// INSCRIPCIONES POR TORNEO (top N)
// ============================================================

export const obtenerInscripcionesPorTorneo = async (limite: number) => {
    const torneos = await prisma.torneo.findMany({
        include: { _count: { select: { inscripciones: true } } },
    });

    return torneos
        .map(t => ({ torneo: t.nombre || t.lugar, total: t._count.inscripciones }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limite);
};

// ============================================================
// DISTRIBUCIÓN POR CATEGORÍA
// ============================================================

export const obtenerDistribucionCategoria = async (idTorneo: number) => {
    const torneo = await prisma.torneo.findUnique({ where: { idTorneo } });
    if (!torneo) throw new NotFoundError('Torneo no encontrado');

    const inscripciones = await prisma.inscripcion.findMany({
        where: { idTorneo, idCategoria: { not: null } },
        include: { categoria: { select: { idCategoria: true, nombre: true, costo: true } } },
    });

    const conteo = new Map<number, { categoria: string; total: number; costo: number }>();
    for (const ins of inscripciones) {
        if (!ins.categoria) continue;
        const actual = conteo.get(ins.categoria.idCategoria);
        if (actual) {
            actual.total += 1;
        } else {
            conteo.set(ins.categoria.idCategoria, {
                categoria: ins.categoria.nombre,
                total: 1,
                costo: Number(ins.categoria.costo),
            });
        }
    }

    return Array.from(conteo.values());
};

// ============================================================
// SELECTOR DE TORNEOS
// ============================================================

export const obtenerTorneosParaSelector = async () => {
    const torneos = await prisma.torneo.findMany({
        select: { idTorneo: true, nombre: true, lugar: true, fecha: true },
        orderBy: { fecha: 'desc' },
    });
    return torneos.map(t => ({ idTorneo: t.idTorneo, nombre: t.nombre || t.lugar, fecha: t.fecha }));
};
