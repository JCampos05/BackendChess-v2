import prisma from '../config/database';
import { NotFoundError } from '../middleware/error.middleware';

/** Inscripciones que cuentan para finanzas: se excluyen retirados/cancelados. */
const ESTADOS_ACTIVOS = ['inscrito', 'confirmado'] as const;

type Fila = { pagado: number; costo: number };

/** Totales de un conjunto de inscripciones (esperado = costo de la liga por jugador). */
const totalizar = (filas: Fila[]) => {
    let recaudado = 0;
    let esperado = 0;
    let completos = 0;
    let parciales = 0;
    let sinPago = 0;
    let conMonto = 0;

    for (const f of filas) {
        recaudado += f.pagado;
        esperado += f.costo;
        if (f.pagado > 0) conMonto++;
        if (f.costo > 0 && f.pagado >= f.costo) completos++;
        else if (f.pagado > 0) parciales++;
        else sinPago++;
    }

    return {
        total_inscritos: filas.length,
        pagos_completos: completos,
        pagos_parciales: parciales,
        sin_pago: sinPago,
        total_recaudado: recaudado,
        total_esperado: esperado,
        total_pendiente: Math.max(esperado - recaudado, 0),
        promedio_pago: conMonto > 0 ? parseFloat((recaudado / conMonto).toFixed(2)) : 0,
        porcentaje_recaudacion: esperado > 0 ? parseFloat(((recaudado / esperado) * 100).toFixed(2)) : 0,
    };
};

/** Resumen de finanzas de todas las ligas (una fila por liga) + total general. */
export const getResumenLigas = async () => {
    const ligas = await prisma.infoLiga.findMany({
        select: {
            idLiga: true,
            nombre: true,
            fecha_inicio: true,
            costo_inscripcion: true,
            jugadores_liga: {
                where: { estado: { in: [...ESTADOS_ACTIVOS] } },
                select: { monto_pagado: true },
            },
        },
        orderBy: { fecha_inicio: 'desc' },
    });

    const porLiga = ligas.map((l) => {
        const costo = Number(l.costo_inscripcion) || 0;
        const filas: Fila[] = l.jugadores_liga.map((j) => ({ pagado: Number(j.monto_pagado) || 0, costo }));
        return {
            idLiga: l.idLiga,
            nombre: l.nombre,
            fecha_inicio: l.fecha_inicio,
            costo_inscripcion: costo,
            ...totalizar(filas),
            filas,
        };
    });

    const general = totalizar(porLiga.flatMap((l) => l.filas));
    return {
        general,
        ligas: porLiga.map(({ filas, ...resto }) => resto),
    };
};

/** Detalle financiero de una liga: resumen, por grupo, evolución mensual y lista de jugadores. */
export const getDetalleLiga = async (idLiga: number) => {
    const liga = await prisma.infoLiga.findUnique({
        where: { idLiga },
        select: {
            idLiga: true,
            nombre: true,
            fecha_inicio: true,
            costo_inscripcion: true,
            jugadores_liga: {
                where: { estado: { in: [...ESTADOS_ACTIVOS] } },
                select: {
                    idJugadorLiga: true,
                    monto_pagado: true,
                    fecha_inscripcion: true,
                    folio: true,
                    grupo: { select: { idGrupoLiga: true, nombre: true } },
                    jugador: { select: { nombre: true, apellido1: true, apellido2: true } },
                },
            },
        },
    });
    if (!liga) throw new NotFoundError('Liga no encontrada');

    const costo = Number(liga.costo_inscripcion) || 0;

    const jugadores = liga.jugadores_liga.map((j) => {
        const pagado = Number(j.monto_pagado) || 0;
        const estadoPago: 'completo' | 'parcial' | 'sin_pago' =
            costo > 0 && pagado >= costo ? 'completo' : pagado > 0 ? 'parcial' : 'sin_pago';
        return {
            idJugadorLiga: j.idJugadorLiga,
            nombre: [j.jugador.nombre, j.jugador.apellido1, j.jugador.apellido2].filter(Boolean).join(' '),
            grupo: j.grupo.nombre,
            idGrupoLiga: j.grupo.idGrupoLiga,
            folio: j.folio,
            fecha_inscripcion: j.fecha_inscripcion,
            monto_pagado: pagado,
            costo,
            pendiente: Math.max(costo - pagado, 0),
            estado_pago: estadoPago,
        };
    });

    const filas = (lista: typeof jugadores): Fila[] =>
        lista.map((j) => ({ pagado: j.monto_pagado, costo: j.costo }));

    // Por grupo
    const grupos = new Map<number, { nombre: string; lista: typeof jugadores }>();
    for (const j of jugadores) {
        const g = grupos.get(j.idGrupoLiga) ?? { nombre: j.grupo, lista: [] };
        g.lista.push(j);
        grupos.set(j.idGrupoLiga, g);
    }
    const porGrupo = [...grupos.entries()]
        .map(([idGrupoLiga, g]) => ({ idGrupoLiga, grupo: g.nombre, ...totalizar(filas(g.lista)) }))
        .sort((a, b) => a.grupo.localeCompare(b.grupo, 'es', { numeric: true }));

    // Evolución mensual de lo recaudado (por fecha de inscripción)
    const meses = new Map<string, { recaudado: number; inscritos: number }>();
    for (const j of jugadores) {
        const d = new Date(j.fecha_inscripcion);
        const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const m = meses.get(clave) ?? { recaudado: 0, inscritos: 0 };
        m.recaudado += j.monto_pagado;
        m.inscritos += 1;
        meses.set(clave, m);
    }
    const evolucion = [...meses.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([periodo, v]) => ({ periodo, ...v }));

    return {
        liga: { idLiga: liga.idLiga, nombre: liga.nombre, fecha_inicio: liga.fecha_inicio, costo_inscripcion: costo },
        resumen: totalizar(filas(jugadores)),
        por_grupo: porGrupo,
        evolucion,
        jugadores: jugadores.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    };
};
