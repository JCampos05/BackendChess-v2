import prisma from '../config/database';
import { NotFoundError } from '../middleware/error.middleware';
import { inscripcionesCerradas } from '../utils/fecha.utils';
import { inscribirEnTorneo, buscarJugadorSimilar, InscribirEnTorneoDto } from './inscripcion-admin.service';

// ── Categorías de un torneo, con cupo/cierre visibles para el público ──
// Ni el endpoint público de torneos ni el de admin exponían cupo_maximo
// a nivel categoría — es lo que permite a la UI mostrar "quedan N lugares"
// o deshabilitar una categoría llena/cerrada antes de intentar inscribirse.

export const listarCategoriasPublicas = async (idTorneo: number) => {
    const torneo = await prisma.torneo.findUnique({
        where: { idTorneo },
        select: { idTorneo: true, cierre_inscripciones: true, cupo_maximo: true },
    });
    if (!torneo) throw new NotFoundError('Torneo no encontrado');

    // Cupo del TORNEO completo (todas las categorías juntas) — antes solo se
    // consideraba el cupo por categoría, así que un torneo con cupo_maximo a
    // nivel torneo (sin límite por categoría) nunca mostraba "lleno" en el
    // formulario público, aunque el backend sí lo rechazara al inscribir.
    const inscritosTorneo = torneo.cupo_maximo
        ? await prisma.inscripcion.count({
            where: { idTorneo, estado: { not: 'cancelado' } },
        })
        : 0;
    const torneoLleno = torneo.cupo_maximo ? inscritosTorneo >= torneo.cupo_maximo : false;

    const categorias = await prisma.torneoCategoria.findMany({
        where: { idTorneo, activo: true },
        select: {
            idCategoria: true,
            rondas: true,
            cierre_inscripciones: true,
            cupo_maximo: true,
            categoria: {
                select: { idCategoria: true, nombre: true, costo: true, edadMinima: true, edadMaxima: true },
            },
        },
        orderBy: { idCategoria: 'asc' },
    });

    return Promise.all(categorias.map(async (tc) => {
        const cierreEfectivo = tc.cierre_inscripciones ?? torneo.cierre_inscripciones;
        const inscritos = tc.cupo_maximo
            ? await prisma.inscripcion.count({
                where: { idTorneo, idCategoria: tc.idCategoria, estado: { not: 'cancelado' } },
            })
            : 0;
        const categoriaLlena = tc.cupo_maximo ? inscritos >= tc.cupo_maximo : false;

        return {
            idCategoria:         tc.categoria.idCategoria,
            nombre:              tc.categoria.nombre,
            costo:               tc.categoria.costo,
            edadMinima:          tc.categoria.edadMinima,
            edadMaxima:          tc.categoria.edadMaxima,
            rondas:              tc.rondas,
            cierreInscripciones: cierreEfectivo,
            cupoMaximo:          tc.cupo_maximo,
            inscritos,
            cupoDisponible:      tc.cupo_maximo ? Math.max(tc.cupo_maximo - inscritos, 0) : null,
            cerrada:             await inscripcionesCerradas(cierreEfectivo),
            llena:               categoriaLlena || torneoLleno,
        };
    }));
};

// ── Búsqueda de jugador, sanitizada para uso público ──────────
// Reusa buscarJugadorSimilar (misma comparación por nombre/apellido que ya
// usa el registro manual de admin) pero nunca expone el teléfono del
// jugador a un llamante sin autenticar.

export const buscarJugadorPublico = async (q: string) => {
    const resultados = await buscarJugadorSimilar(q);
    return resultados.map(({ telefono, ...resto }) => resto);
};

// ── Crear inscripción pública ─────────────────────────────────
// Reusa inscribirEnTorneo (cierre por categoría/torneo, cupo, duplicado
// exacto y por nombre, validación de edad) forzando que el pago NUNCA
// llegue confirmado desde un endpoint sin autenticación.

export type InscribirPublicoDto = Omit<InscribirEnTorneoDto, 'pago_confirmado' | 'monto_pagado' | 'rating_inicial'>;

export const inscribirPublico = async (datos: InscribirPublicoDto) => {
    return inscribirEnTorneo({
        ...datos,
        pago_confirmado: false,
        monto_pagado: 0,
    });
};
