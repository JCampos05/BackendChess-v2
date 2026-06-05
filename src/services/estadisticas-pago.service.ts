import { Prisma } from '@prisma/client';
import prisma from '../config/database';

// ── Helpers ──────────────────────────────────────────────────

/** Construye el filtro where para inscripciones según los parámetros */
const buildWhere = (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
}): Prisma.InscripcionWhereInput => {
    const { idTorneo, fechaInicio, fechaFin } = params;

    const fechaFilter: Prisma.InscripcionWhereInput =
        fechaInicio && fechaFin
            ? {
                fecha_inscripcion: {
                    gte: new Date(fechaInicio),
                    lte: new Date(`${fechaFin}T23:59:59`),
                },
            }
            : {};

    if (idTorneo) {
        return { idTorneo, ...fechaFilter };
    }
    return fechaFilter;
};

// ── Estadísticas generales de pagos ─────────────────────────

export const getEstadisticasGenerales = async (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
}) => {
    const where = buildWhere(params);

    // Todas las inscripciones con su categoría para comparar monto vs costo
    const inscripciones = await prisma.inscripcion.findMany({
        where,
        select: {
            monto_pagado: true,
            categoria: { select: { costo: true } },
        },
    });

    let pagosCompletos = 0;
    let pagosParciales = 0;
    let sinPago = 0;
    let totalRecaudado = 0;
    let totalEsperado = 0;
    let sumaPagosConMonto = 0;
    let contadorConMonto = 0;

    for (const i of inscripciones) {
        const pagado = Number(i.monto_pagado) || 0;
        const costo = Number(i.categoria?.costo) || 0;

        totalRecaudado += pagado;
        totalEsperado += costo;

        if (pagado >= costo && costo > 0) pagosCompletos++;
        else if (pagado > 0 && pagado < costo) pagosParciales++;
        else sinPago++;

        if (pagado > 0) { sumaPagosConMonto += pagado; contadorConMonto++; }
    }

    const promedioPago = contadorConMonto > 0 ? sumaPagosConMonto / contadorConMonto : 0;

    return {
        total_inscripciones: inscripciones.length,
        pagos_completos: pagosCompletos,
        pagos_parciales: pagosParciales,
        sin_pago: sinPago,
        total_recaudado: totalRecaudado,
        total_esperado: totalEsperado,
        promedio_pago: parseFloat(promedioPago.toFixed(2)),
        porcentaje_recaudacion:
            totalEsperado > 0
                ? parseFloat(((totalRecaudado / totalEsperado) * 100).toFixed(2))
                : 0,
    };
};

// ── Estadísticas por categoría ───────────────────────────────

export const getEstadisticasPorCategoria = async (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
}) => {
    const where = buildWhere(params);

    // Categorías únicas con inscripciones
    const categorias = await prisma.categoria.findMany({
        where: { inscripciones: { some: where } },
        select: {
            idCategoria: true,
            nombre: true,
            costo: true,
            inscripciones: {
                where,
                select: { monto_pagado: true },
            },
        },
    });

    return categorias
        .map((cat) => {
            const costo = Number(cat.costo);
            let pagosCompletos = 0;
            let pagosParciales = 0;
            let sinPago = 0;
            let totalRecaudado = 0;

            for (const i of cat.inscripciones) {
                const pagado = Number(i.monto_pagado) || 0;
                totalRecaudado += pagado;
                if (pagado >= costo && costo > 0) pagosCompletos++;
                else if (pagado > 0 && pagado < costo) pagosParciales++;
                else sinPago++;
            }

            const totalEsperado = costo * cat.inscripciones.length;

            return {
                idCategoria: cat.idCategoria,
                categoria: cat.nombre,
                costo_categoria: costo,
                total_inscripciones: cat.inscripciones.length,
                pagos_completos: pagosCompletos,
                pagos_parciales: pagosParciales,
                sin_pago: sinPago,
                total_recaudado: totalRecaudado,
                total_esperado: totalEsperado,
                porcentaje_recaudacion:
                    totalEsperado > 0
                        ? parseFloat(((totalRecaudado / totalEsperado) * 100).toFixed(2))
                        : 0,
            };
        })
        .sort((a, b) => b.total_recaudado - a.total_recaudado);
};

// ── Estadísticas por torneo ──────────────────────────────────

export const getEstadisticasPorTorneo = async (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
}) => {
    const torneoWhere: Prisma.TorneoWhereInput = params.idTorneo
        ? { idTorneo: params.idTorneo }
        : params.fechaInicio && params.fechaFin
            ? {
                fecha: {
                    gte: new Date(params.fechaInicio),
                    lte: new Date(params.fechaFin),
                },
            }
            : {};

    const torneos = await prisma.torneo.findMany({
        where: { ...torneoWhere, inscripciones: { some: {} } },
        select: {
            idTorneo: true,
            nombre: true,
            fecha: true,
            lugar: true,
            inscripciones: {
                select: {
                    monto_pagado: true,
                    categoria: { select: { costo: true } },
                },
            },
        },
        orderBy: { fecha: 'desc' },
    });

    return torneos.map((t) => {
        let pagosCompletos = 0;
        let pagosParciales = 0;
        let totalRecaudado = 0;
        let totalEsperado = 0;

        for (const i of t.inscripciones) {
            const pagado = Number(i.monto_pagado) || 0;
            const costo = Number(i.categoria?.costo) || 0;
            totalRecaudado += pagado;
            totalEsperado += costo;
            if (pagado >= costo && costo > 0) pagosCompletos++;
            else if (pagado > 0 && pagado < costo) pagosParciales++;
        }

        return {
            idTorneo: t.idTorneo,
            torneo: t.nombre,
            fecha: t.fecha,
            lugar: t.lugar,
            total_inscripciones: t.inscripciones.length,
            pagos_completos: pagosCompletos,
            pagos_parciales: pagosParciales,
            total_recaudado: totalRecaudado,
            total_esperado: totalEsperado,
            porcentaje_recaudacion:
                totalEsperado > 0
                    ? parseFloat(((totalRecaudado / totalEsperado) * 100).toFixed(2))
                    : 0,
        };
    });
};

// ── Evolución temporal ───────────────────────────────────────

export const getEvolucionTemporal = async (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
    agrupacion?: 'dia' | 'semana' | 'mes' | 'anio';
}) => {
    const { idTorneo, agrupacion = 'mes' } = params;
    let { fechaInicio, fechaFin } = params;

    // Si hay torneo, usar sus fechas como rango
    if (idTorneo && (!fechaInicio || !fechaFin)) {
        const torneo = await prisma.torneo.findUnique({
            where: { idTorneo },
            select: { fecha_creacion: true, cierre_inscripciones: true, fecha: true },
        });
        if (torneo) {
            fechaInicio = (torneo.fecha_creacion ?? torneo.fecha).toISOString().split('T')[0];
            fechaFin = (torneo.cierre_inscripciones ?? torneo.fecha).toISOString().split('T')[0];
        }
    }

    const where = buildWhere({ idTorneo, fechaInicio, fechaFin });

    const inscripciones = await prisma.inscripcion.findMany({
        where,
        select: {
            fecha_inscripcion: true,
            monto_pagado: true,
            categoria: { select: { costo: true } },
        },
        orderBy: { fecha_inscripcion: 'asc' },
    });

    // Agrupar en memoria según la agrupación solicitada
    const getKey = (fecha: Date | null): string => {
        if (!fecha) return 'sin-fecha';
        const d = new Date(fecha);
        if (agrupacion === 'dia') return d.toISOString().split('T')[0];
        if (agrupacion === 'semana') {
            // ISO week: año + número de semana
            const tmp = new Date(d);
            tmp.setHours(0, 0, 0, 0);
            tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
            const yearStart = new Date(tmp.getFullYear(), 0, 1);
            const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
            return `${tmp.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
        }
        if (agrupacion === 'anio') return String(d.getFullYear());
        // mes (default)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const mapa = new Map<string, {
        periodo: string;
        total_inscripciones: number;
        pagos_completos: number;
        pagos_parciales: number;
        total_recaudado: number;
        total_esperado: number;
    }>();

    for (const i of inscripciones) {
        const key = getKey(i.fecha_inscripcion);
        const entry = mapa.get(key) ?? {
            periodo: key,
            total_inscripciones: 0,
            pagos_completos: 0,
            pagos_parciales: 0,
            total_recaudado: 0,
            total_esperado: 0,
        };
        const pagado = Number(i.monto_pagado) || 0;
        const costo = Number(i.categoria?.costo) || 0;

        entry.total_inscripciones++;
        entry.total_recaudado += pagado;
        entry.total_esperado += costo;
        if (pagado >= costo && costo > 0) entry.pagos_completos++;
        else if (pagado > 0 && pagado < costo) entry.pagos_parciales++;

        mapa.set(key, entry);
    }

    return Array.from(mapa.values()).sort((a, b) => a.periodo.localeCompare(b.periodo));
};

// ── Comparativa anual ────────────────────────────────────────

export const getComparativaAnual = async (params: { idTorneo?: number }) => {
    const where: Prisma.InscripcionWhereInput = params.idTorneo
        ? { idTorneo: params.idTorneo }
        : {};

    const inscripciones = await prisma.inscripcion.findMany({
        where,
        select: { fecha_inscripcion: true, monto_pagado: true },
        orderBy: { fecha_inscripcion: 'asc' },
    });

    const porAnio = new Map<number, { total_inscripciones: number; total_recaudado: number; suma_pagos: number; count_con_pago: number }>();

    for (const i of inscripciones) {
        if (!i.fecha_inscripcion) continue;
        const anio = new Date(i.fecha_inscripcion).getFullYear();
        const pagado = Number(i.monto_pagado) || 0;
        const entry = porAnio.get(anio) ?? { total_inscripciones: 0, total_recaudado: 0, suma_pagos: 0, count_con_pago: 0 };
        entry.total_inscripciones++;
        entry.total_recaudado += pagado;
        if (pagado > 0) { entry.suma_pagos += pagado; entry.count_con_pago++; }
        porAnio.set(anio, entry);
    }

    return Array.from(porAnio.entries())
        .sort((a, b) => b[0] - a[0])
        .slice(0, 5)
        .map(([anio, e]) => ({
            anio,
            total_inscripciones: e.total_inscripciones,
            total_recaudado: e.total_recaudado,
            promedio_pago: e.count_con_pago > 0 ? parseFloat((e.suma_pagos / e.count_con_pago).toFixed(2)) : 0,
        }));
};