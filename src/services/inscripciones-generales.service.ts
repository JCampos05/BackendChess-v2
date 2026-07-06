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

export const obtenerResumenGeneral = async (periodo: Periodo) => {
    const desde = inicioDePeriodo(periodo);

    const [inscripciones, torneosActivos] = await Promise.all([
        prisma.inscripcion.findMany({
            where: { fecha_inscripcion: { gte: desde } },
            select: { estado: true },
        }),
        prisma.torneo.count({ where: { activo: true } }),
    ]);

    const conteoPorEstado = new Map<string, number>();
    for (const ins of inscripciones) {
        const etiqueta = ETIQUETA_ESTADO[ins.estado] ?? ins.estado;
        conteoPorEstado.set(etiqueta, (conteoPorEstado.get(etiqueta) ?? 0) + 1);
    }

    const totalInscripciones = inscripciones.length;
    const dias = DIAS_POR_PERIODO[periodo];

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

const BUCKETS_POR_PERIODO: Record<Periodo, { cantidad: number; unidad: 'dia' | 'semana' | 'mes' | 'anio' }> = {
    dia: { cantidad: 14, unidad: 'dia' },
    semana: { cantidad: 8, unidad: 'semana' },
    mes: { cantidad: 12, unidad: 'mes' },
    anio: { cantidad: 5, unidad: 'anio' },
};

const etiquetaBucket = (fecha: Date, unidad: 'dia' | 'semana' | 'mes' | 'anio'): string => {
    if (unidad === 'anio') return `${fecha.getFullYear()}`;
    if (unidad === 'mes') {
        return fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
    }
    // 'dia' y 'semana' se etiquetan por día de inicio de bucket
    return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

export const obtenerEvolucionTemporal = async (
    periodo: Periodo,
    fechaInicio?: string,
    fechaFin?: string
) => {
    const { cantidad, unidad } = BUCKETS_POR_PERIODO[periodo];

    const fin = fechaFin ? new Date(`${fechaFin}T23:59:59`) : new Date();
    let inicio: Date;
    if (fechaInicio) {
        inicio = new Date(`${fechaInicio}T00:00:00`);
    } else {
        inicio = new Date(fin);
        if (unidad === 'dia')   inicio.setDate(inicio.getDate() - cantidad);
        if (unidad === 'semana') inicio.setDate(inicio.getDate() - cantidad * 7);
        if (unidad === 'mes')   inicio.setMonth(inicio.getMonth() - cantidad);
        if (unidad === 'anio')  inicio.setFullYear(inicio.getFullYear() - cantidad);
    }

    const inscripciones = await prisma.inscripcion.findMany({
        where: { fecha_inscripcion: { gte: inicio, lte: fin } },
        select: { fecha_inscripcion: true },
    });

    // Construir buckets vacíos en orden cronológico
    const buckets: { clave: string; etiqueta: string; total: number }[] = [];
    const cursor = new Date(inicio);

    for (let i = 0; i < cantidad; i++) {
        let clave: string;
        if (unidad === 'anio') {
            clave = `${cursor.getFullYear()}`;
        } else if (unidad === 'mes') {
            clave = `${cursor.getFullYear()}-${cursor.getMonth()}`;
        } else {
            clave = cursor.toISOString().split('T')[0];
        }
        buckets.push({ clave, etiqueta: etiquetaBucket(cursor, unidad), total: 0 });

        if (unidad === 'dia')    cursor.setDate(cursor.getDate() + 1);
        if (unidad === 'semana') cursor.setDate(cursor.getDate() + 7);
        if (unidad === 'mes')    cursor.setMonth(cursor.getMonth() + 1);
        if (unidad === 'anio')   cursor.setFullYear(cursor.getFullYear() + 1);
    }

    const indicePorClave = new Map(buckets.map((b, i) => [b.clave, i]));

    for (const ins of inscripciones) {
        if (!ins.fecha_inscripcion) continue;
        const fecha = new Date(ins.fecha_inscripcion);

        let clave: string;
        if (unidad === 'anio') {
            clave = `${fecha.getFullYear()}`;
        } else if (unidad === 'mes') {
            clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;
        } else if (unidad === 'semana') {
            // Asignar al bucket semanal cuyo rango contiene la fecha
            const diffMs = fecha.getTime() - inicio.getTime();
            const semanaIdx = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
            const bucket = buckets[semanaIdx];
            if (bucket) bucket.total += 1;
            continue;
        } else {
            clave = fecha.toISOString().split('T')[0];
        }

        const idx = indicePorClave.get(clave);
        if (idx !== undefined) buckets[idx].total += 1;
    }

    return buckets.map(b => ({ periodo: b.etiqueta, total: b.total }));
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
