import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import {
    NotFoundError,
    ConflictError,
    ForbiddenError,
} from '../middleware/error.middleware';
import { normalizarNombreJugador } from '../utils/nombre.utils';
import { jugadorPuedeInscribirse, inscripcionesCerradas } from '../utils/fecha.utils';

// ── Tipos de entrada ─────────────────────────────────────────

export interface InscribirEnTorneoDto {
    // Jugador existente o nuevo
    idJugador?: number;
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    rating_inicial?: number;
    // Torneo
    idTorneo: number;
    idCategoria: number;
    // Pago
    notas?: string;
    pago_confirmado?: boolean;
    monto_pagado?: number;
}

export interface InscribirEnLigaDto {
    // Jugador existente o nuevo
    idJugador?: number;
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    rating_inicial?: number;
    // Liga
    idLiga: number;
    idGrupoLiga: number;
    // Pago y posición
    notas?: string;
    pago_confirmado?: boolean;
    monto_pagado?: number;
    numero_jugador?: number;
    posicion?: number;
}

// ── Helper: resolver jugador ─────────────────────────────────
// Busca jugador existente o crea uno nuevo, normalizando el nombre

const resolverJugador = async (datos: {
    idJugador?: number;
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    rating_inicial?: number;
}) => {
    if (datos.idJugador) {
        const jugador = await prisma.jugador.findUnique({
            where: { idJugador: datos.idJugador },
        });
        if (!jugador) throw new NotFoundError('Jugador no encontrado');
        return jugador;
    }

    // Validar campos requeridos para jugador nuevo
    if (!datos.nombre?.trim()) throw new ForbiddenError('El nombre es obligatorio');
    if (!datos.apellido1?.trim()) throw new ForbiddenError('El primer apellido es obligatorio');
    if (!datos.telefono || !/^\d{10}$/.test(datos.telefono.replace(/\s/g, ''))) {
        throw new ForbiddenError('El teléfono debe tener exactamente 10 dígitos');
    }
    if (!datos.fecha_nacimiento) throw new ForbiddenError('La fecha de nacimiento es obligatoria');

    const nombres = normalizarNombreJugador({
        nombre: datos.nombre,
        apellido1: datos.apellido1,
        apellido2: datos.apellido2,
    });

    // Buscar por nombre normalizado — si existe, actualizar teléfono/fecha
    const existente = await prisma.jugador.findFirst({
        where: {
            nombre: nombres.nombre,
            apellido1: nombres.apellido1,
            apellido2: nombres.apellido2 ?? null,
        },
    });

    if (existente) {
        return prisma.jugador.update({
            where: { idJugador: existente.idJugador },
            data: {
                telefono: datos.telefono.replace(/\s/g, ''),
                fecha_nacimiento: new Date(datos.fecha_nacimiento),
                actualizacion: new Date(),
            },
        });
    }

    return prisma.jugador.create({
        data: {
            ...nombres,
            telefono: datos.telefono.replace(/\s/g, ''),
            fecha_nacimiento: new Date(datos.fecha_nacimiento),
            rating: datos.rating_inicial ?? 0,
            estado: 'pendiente_pago',
            fecha_registro: new Date(),
            actualizacion: new Date(),
        },
    });
};

// ── Inscripción a torneo ─────────────────────────────────────

export const inscribirEnTorneo = async (datos: InscribirEnTorneoDto) => {
    const jugador = await resolverJugador(datos);

    const [torneo, categoria] = await Promise.all([
        prisma.torneo.findUnique({ where: { idTorneo: datos.idTorneo } }),
        prisma.categoria.findUnique({ where: { idCategoria: datos.idCategoria } }),
    ]);
    if (!torneo) throw new NotFoundError('Torneo no encontrado');
    if (!categoria) throw new NotFoundError('Categoría no encontrada');

    // Verificar que la categoría esté asignada y activa en el torneo
    const torneoCategoria = await prisma.torneoCategoria.findFirst({
        where: { idTorneo: datos.idTorneo, idCategoria: datos.idCategoria, activo: true },
    });
    if (!torneoCategoria) {
        throw new ForbiddenError('La categoría no está disponible para este torneo');
    }

    // Punto 1: Verificar cierre de inscripciones (categoría tiene prioridad sobre torneo)
    const fechaCierre = torneoCategoria.cierre_inscripciones ?? torneo.cierre_inscripciones;
    if (await inscripcionesCerradas(fechaCierre)) {
        throw new ForbiddenError('Las inscripciones para este evento están cerradas');
    }

    // Punto 2: Verificar cupo del torneo
    if (torneo.cupo_maximo) {
        const inscritos = await prisma.inscripcion.count({
            where: { idTorneo: datos.idTorneo, estado: { not: 'cancelado' } },
        });
        if (inscritos >= torneo.cupo_maximo) {
            throw new ForbiddenError(`El torneo ha alcanzado su cupo máximo de ${torneo.cupo_maximo} jugadores`);
        }
    }

    // Punto 2: Verificar cupo de la categoría
    if (torneoCategoria.cupo_maximo) {
        const inscritosCategoria = await prisma.inscripcion.count({
            where: { idTorneo: datos.idTorneo, idCategoria: datos.idCategoria, estado: { not: 'cancelado' } },
        });
        if (inscritosCategoria >= torneoCategoria.cupo_maximo) {
            throw new ForbiddenError(`La categoría ha alcanzado su cupo máximo de ${torneoCategoria.cupo_maximo} jugadores`);
        }
    }

    // fecha_nacimiento es obligatoria — también para jugadores ya existentes
    if (!jugador.fecha_nacimiento) {
        throw new ForbiddenError('La fecha de nacimiento del jugador es obligatoria para inscribirse');
    }

    const check = jugadorPuedeInscribirse(
        jugador.fecha_nacimiento,
        torneo.fecha,
        categoria.edadMinima,
        categoria.edadMaxima,
        categoria.tipo_validacion_edad
    );
    if (!check.puede) throw new ForbiddenError(check.motivo ?? 'El jugador no cumple los requisitos de edad');
    const edadInscripcion = check.edad;

    // Verificar inscripción duplicada (mismo jugador, mismo torneo)
    const yaInscrito = await prisma.inscripcion.findUnique({
        where: { unique_jugador_torneo: { idJugador: jugador.idJugador, idTorneo: datos.idTorneo } },
    });
    if (yaInscrito) throw new ConflictError('El jugador ya está inscrito en este torneo');

    // Punto 4: Detectar otro jugador con el mismo nombre completo ya inscrito en el mismo torneo
    const duplicadoNombre = await prisma.jugador.findFirst({
        where: {
            idJugador: { not: jugador.idJugador },
            nombre: jugador.nombre,
            apellido1: jugador.apellido1,
            apellido2: jugador.apellido2 ?? null,
            inscripciones: { some: { idTorneo: datos.idTorneo } },
        },
    });
    if (duplicadoNombre) {
        throw new ConflictError(
            `Ya existe un jugador con el nombre "${jugador.nombre} ${jugador.apellido1}${jugador.apellido2 ? ' ' + jugador.apellido2 : ''}" inscrito en este torneo`
        );
    }

    // Crear inscripción y actualizar jugador en transacción
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const inscripcion = await tx.inscripcion.create({
            data: {
                idJugador: jugador.idJugador,
                idTorneo: datos.idTorneo,
                idCategoria: datos.idCategoria,
                notas: datos.notas?.trim() ?? null,
                edad: edadInscripcion,
                estado: datos.pago_confirmado ? 'confirmado' : 'pendiente_pago',
                pago_confirmado: datos.pago_confirmado ?? false,
                monto_pagado: datos.monto_pagado ?? 0,
                fecha_inscripcion: new Date(),
                fecha_actualizacion: new Date(),
            },
            include: {
                jugador: { select: { idJugador: true, nombre: true, apellido1: true, apellido2: true } },
                torneo: { select: { idTorneo: true, nombre: true, fecha: true } },
                categoria: { select: { idCategoria: true, nombre: true, costo: true } },
            },
        });

        // Activar jugador si el pago está confirmado
        if (datos.pago_confirmado) {
            await tx.jugador.update({
                where: { idJugador: jugador.idJugador },
                data: { estado: 'activo', pago_confirmado: true, actualizacion: new Date() },
            });
        }

        return inscripcion;
    });
};

// ── Inscripción a liga ───────────────────────────────────────

export const inscribirEnLiga = async (datos: InscribirEnLigaDto) => {
    const jugador = await resolverJugador(datos);

    const [liga, grupo] = await Promise.all([
        prisma.infoLiga.findUnique({ where: { idLiga: datos.idLiga } }),
        prisma.grupoLiga.findUnique({ where: { idGrupoLiga: datos.idGrupoLiga } }),
    ]);
    if (!liga) throw new NotFoundError('Liga no encontrada');
    if (!grupo) throw new NotFoundError('Grupo no encontrado');
    if (grupo.idLiga !== datos.idLiga) throw new ForbiddenError('El grupo no pertenece a esta liga');

    // Verificar límite de jugadores en el grupo
    if (grupo.max_jugadores) {
        const enGrupo = await prisma.jugadorLiga.count({ where: { idGrupoLiga: datos.idGrupoLiga } });
        if (enGrupo >= grupo.max_jugadores) {
            throw new ForbiddenError('El grupo ha alcanzado el máximo de jugadores');
        }
    }

    // Verificar inscripción duplicada
    const yaInscrito = await prisma.jugadorLiga.findFirst({
        where: { idLiga: datos.idLiga, idJugador: jugador.idJugador },
    });
    if (yaInscrito) throw new ConflictError('El jugador ya está inscrito en esta liga');

    return prisma.jugadorLiga.create({
        data: {
            idLiga: datos.idLiga,
            idGrupoLiga: datos.idGrupoLiga,
            idJugador: jugador.idJugador,
            rating_inicial: datos.rating_inicial ?? jugador.rating ?? 0,
            numero_jugador: datos.numero_jugador ?? null,
            posicion: datos.posicion ?? null,
            fecha_inscripcion: new Date(),
            pago_confirmado: datos.pago_confirmado ?? false,
            monto_pagado: datos.monto_pagado ?? 0,
            estado: datos.pago_confirmado ? 'confirmado' : 'inscrito',
            puntos: 0,
            partidas_jugadas: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            notas: datos.notas?.trim() ?? null,
        },
        include: {
            jugador: { select: { idJugador: true, nombre: true, apellido1: true } },
            liga: { select: { idLiga: true, nombre: true } },
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};

// ── Selectores para el formulario ────────────────────────────

export const getEventosActivos = async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [torneos, ligas] = await Promise.all([
        prisma.torneo.findMany({
            where: { activo: true, fecha: { gte: hoy } },
            select: {
                idTorneo: true,
                nombre: true,
                lugar: true,
                fecha: true,
                hora: true,
                torneo_categorias: {
                    where: { activo: true },
                    select: {
                        idTorneoCat: true,
                        categoria: { select: { idCategoria: true, nombre: true, costo: true } },
                    },
                },
            },
            orderBy: { fecha: 'asc' },
        }),
        prisma.infoLiga.findMany({
            where: { activo: true, fecha_inicio: { gte: hoy } },
            select: {
                idLiga: true,
                nombre: true,
                lugar: true,
                fecha_inicio: true,
                fecha_fin: true,
                grupos: {
                    where: { activo: true },
                    select: { idGrupoLiga: true, nombre: true, max_jugadores: true, rondas: true },
                },
            },
            orderBy: { fecha_inicio: 'asc' },
        }),
    ]);

    return {
        torneos: torneos.map((t) => ({
            tipo: 'torneo',
            id: t.idTorneo,
            nombre: t.nombre ?? `${t.lugar} - ${new Date(t.fecha).toLocaleDateString('es-MX')}`,
            lugar: t.lugar,
            fecha: t.fecha,
            categorias: t.torneo_categorias,
        })),
        ligas: ligas.map((l) => ({
            tipo: 'liga',
            id: l.idLiga,
            nombre: l.nombre,
            lugar: l.lugar,
            fecha_inicio: l.fecha_inicio,
            fecha_fin: l.fecha_fin,
            grupos: l.grupos,
        })),
    };
};

export const getCategoriasByTorneo = async (idTorneo: number) => {
    return prisma.torneoCategoria.findMany({
        where: { idTorneo, activo: true },
        select: {
            idTorneoCat: true,
            rondas: true,
            ritmo_juego: true,
            categoria: { select: { idCategoria: true, nombre: true, costo: true, edadMinima: true, edadMaxima: true } },
        },
    });
};

export const getGruposByLiga = async (idLiga: number) => {
    return prisma.grupoLiga.findMany({
        where: { idLiga, activo: true },
        select: {
            idGrupoLiga: true,
            nombre: true,
            descripcion: true,
            max_jugadores: true,
            rondas: true,
        },
    });
};

// ── Punto 5: Buscar jugador por similitud de nombre ──────────
// Permite al formulario de inscripción detectar posibles duplicados
// y consultar el historial de torneos anteriores del jugador.

export const buscarJugadorSimilar = async (q: string) => {
    const termino = q.trim();
    if (termino.length < 2) return [];

    const partes = termino.split(/\s+/);
    const primero = partes[0];
    const resto   = partes.slice(1).join(' ');

    return prisma.jugador.findMany({
        where: {
            OR: [
                { nombre:    { contains: primero } },
                { apellido1: { contains: primero } },
                ...(resto ? [
                    { apellido1: { contains: resto } },
                    { nombre:    { contains: resto } },
                ] : []),
            ],
        },
        select: {
            idJugador:        true,
            nombre:           true,
            apellido1:        true,
            apellido2:        true,
            fecha_nacimiento: true,
            telefono:         true,
            rating:           true,
            estado:           true,
            inscripciones: {
                select: {
                    idInscripcion:     true,
                    estado:            true,
                    pago_confirmado:   true,
                    fecha_inscripcion: true,
                    torneo:   { select: { idTorneo: true, nombre: true, fecha: true, lugar: true } },
                    categoria:{ select: { idCategoria: true, nombre: true } },
                },
                orderBy: { fecha_inscripcion: 'desc' },
                take: 10,
            },
        },
        orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
        take: 20,
    });
};