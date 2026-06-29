"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarJugadorSimilar = exports.getGruposByLiga = exports.getCategoriasByTorneo = exports.getEventosActivos = exports.inscribirEnLiga = exports.inscribirEnTorneo = void 0;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const nombre_utils_1 = require("../utils/nombre.utils");
const fecha_utils_1 = require("../utils/fecha.utils");
// ── Helper: resolver jugador ─────────────────────────────────
// Busca jugador existente o crea uno nuevo, normalizando el nombre
const resolverJugador = async (datos) => {
    if (datos.idJugador) {
        const jugador = await database_1.default.jugador.findUnique({
            where: { idJugador: datos.idJugador },
        });
        if (!jugador)
            throw new error_middleware_1.NotFoundError('Jugador no encontrado');
        return jugador;
    }
    // Validar campos requeridos para jugador nuevo
    if (!datos.nombre?.trim())
        throw new error_middleware_1.ForbiddenError('El nombre es obligatorio');
    if (!datos.apellido1?.trim())
        throw new error_middleware_1.ForbiddenError('El primer apellido es obligatorio');
    if (!datos.telefono || !/^\d{10}$/.test(datos.telefono.replace(/\s/g, ''))) {
        throw new error_middleware_1.ForbiddenError('El teléfono debe tener exactamente 10 dígitos');
    }
    if (!datos.fecha_nacimiento)
        throw new error_middleware_1.ForbiddenError('La fecha de nacimiento es obligatoria');
    const nombres = (0, nombre_utils_1.normalizarNombreJugador)({
        nombre: datos.nombre,
        apellido1: datos.apellido1,
        apellido2: datos.apellido2,
    });
    // Buscar por nombre normalizado — si existe, actualizar teléfono/fecha
    const existente = await database_1.default.jugador.findFirst({
        where: {
            nombre: nombres.nombre,
            apellido1: nombres.apellido1,
            apellido2: nombres.apellido2 ?? null,
        },
    });
    if (existente) {
        return database_1.default.jugador.update({
            where: { idJugador: existente.idJugador },
            data: {
                telefono: datos.telefono.replace(/\s/g, ''),
                fecha_nacimiento: new Date(datos.fecha_nacimiento),
                actualizacion: new Date(),
            },
        });
    }
    return database_1.default.jugador.create({
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
const inscribirEnTorneo = async (datos) => {
    const jugador = await resolverJugador(datos);
    const [torneo, categoria] = await Promise.all([
        database_1.default.torneo.findUnique({ where: { idTorneo: datos.idTorneo } }),
        database_1.default.categoria.findUnique({ where: { idCategoria: datos.idCategoria } }),
    ]);
    if (!torneo)
        throw new error_middleware_1.NotFoundError('Torneo no encontrado');
    if (!categoria)
        throw new error_middleware_1.NotFoundError('Categoría no encontrada');
    // Verificar que la categoría esté asignada y activa en el torneo
    const torneoCategoria = await database_1.default.torneoCategoria.findFirst({
        where: { idTorneo: datos.idTorneo, idCategoria: datos.idCategoria, activo: true },
    });
    if (!torneoCategoria) {
        throw new error_middleware_1.ForbiddenError('La categoría no está disponible para este torneo');
    }
    // Punto 1: Verificar cierre de inscripciones (categoría tiene prioridad sobre torneo)
    const fechaCierre = torneoCategoria.cierre_inscripciones ?? torneo.cierre_inscripciones;
    if (await (0, fecha_utils_1.inscripcionesCerradas)(fechaCierre)) {
        throw new error_middleware_1.ForbiddenError('Las inscripciones para este evento están cerradas');
    }
    // Punto 2: Verificar cupo del torneo
    if (torneo.cupo_maximo) {
        const inscritos = await database_1.default.inscripcion.count({
            where: { idTorneo: datos.idTorneo, estado: { not: 'cancelado' } },
        });
        if (inscritos >= torneo.cupo_maximo) {
            throw new error_middleware_1.ForbiddenError(`El torneo ha alcanzado su cupo máximo de ${torneo.cupo_maximo} jugadores`);
        }
    }
    // Punto 2: Verificar cupo de la categoría
    if (torneoCategoria.cupo_maximo) {
        const inscritosCategoria = await database_1.default.inscripcion.count({
            where: { idTorneo: datos.idTorneo, idCategoria: datos.idCategoria, estado: { not: 'cancelado' } },
        });
        if (inscritosCategoria >= torneoCategoria.cupo_maximo) {
            throw new error_middleware_1.ForbiddenError(`La categoría ha alcanzado su cupo máximo de ${torneoCategoria.cupo_maximo} jugadores`);
        }
    }
    // fecha_nacimiento es obligatoria — también para jugadores ya existentes
    if (!jugador.fecha_nacimiento) {
        throw new error_middleware_1.ForbiddenError('La fecha de nacimiento del jugador es obligatoria para inscribirse');
    }
    const check = (0, fecha_utils_1.jugadorPuedeInscribirse)(jugador.fecha_nacimiento, torneo.fecha, categoria.edadMinima, categoria.edadMaxima, categoria.tipo_validacion_edad);
    if (!check.puede)
        throw new error_middleware_1.ForbiddenError(check.motivo ?? 'El jugador no cumple los requisitos de edad');
    const edadInscripcion = check.edad;
    // Verificar inscripción duplicada (mismo jugador, mismo torneo)
    const yaInscrito = await database_1.default.inscripcion.findUnique({
        where: { unique_jugador_torneo: { idJugador: jugador.idJugador, idTorneo: datos.idTorneo } },
    });
    if (yaInscrito)
        throw new error_middleware_1.ConflictError('El jugador ya está inscrito en este torneo');
    // Punto 4: Detectar otro jugador con el mismo nombre completo ya inscrito en el mismo torneo
    const duplicadoNombre = await database_1.default.jugador.findFirst({
        where: {
            idJugador: { not: jugador.idJugador },
            nombre: jugador.nombre,
            apellido1: jugador.apellido1,
            apellido2: jugador.apellido2 ?? null,
            inscripciones: { some: { idTorneo: datos.idTorneo } },
        },
    });
    if (duplicadoNombre) {
        throw new error_middleware_1.ConflictError(`Ya existe un jugador con el nombre "${jugador.nombre} ${jugador.apellido1}${jugador.apellido2 ? ' ' + jugador.apellido2 : ''}" inscrito en este torneo`);
    }
    // Crear inscripción y actualizar jugador en transacción
    return database_1.default.$transaction(async (tx) => {
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
exports.inscribirEnTorneo = inscribirEnTorneo;
// ── Inscripción a liga ───────────────────────────────────────
const inscribirEnLiga = async (datos) => {
    const jugador = await resolverJugador(datos);
    const [liga, grupo] = await Promise.all([
        database_1.default.infoLiga.findUnique({ where: { idLiga: datos.idLiga } }),
        database_1.default.grupoLiga.findUnique({ where: { idGrupoLiga: datos.idGrupoLiga } }),
    ]);
    if (!liga)
        throw new error_middleware_1.NotFoundError('Liga no encontrada');
    if (!grupo)
        throw new error_middleware_1.NotFoundError('Grupo no encontrado');
    if (grupo.idLiga !== datos.idLiga)
        throw new error_middleware_1.ForbiddenError('El grupo no pertenece a esta liga');
    // Verificar límite de jugadores en el grupo
    if (grupo.max_jugadores) {
        const enGrupo = await database_1.default.jugadorLiga.count({ where: { idGrupoLiga: datos.idGrupoLiga } });
        if (enGrupo >= grupo.max_jugadores) {
            throw new error_middleware_1.ForbiddenError('El grupo ha alcanzado el máximo de jugadores');
        }
    }
    // Verificar inscripción duplicada
    const yaInscrito = await database_1.default.jugadorLiga.findFirst({
        where: { idLiga: datos.idLiga, idJugador: jugador.idJugador },
    });
    if (yaInscrito)
        throw new error_middleware_1.ConflictError('El jugador ya está inscrito en esta liga');
    return database_1.default.jugadorLiga.create({
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
exports.inscribirEnLiga = inscribirEnLiga;
// ── Selectores para el formulario ────────────────────────────
const getEventosActivos = async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [torneos, ligas] = await Promise.all([
        database_1.default.torneo.findMany({
            where: { activo: true, fecha: { gte: hoy } },
            select: {
                idTorneo: true,
                nombre: true,
                lugar: true,
                fecha: true,
                hora_inicio: true,
                hora_fin: true,
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
        database_1.default.infoLiga.findMany({
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
exports.getEventosActivos = getEventosActivos;
const getCategoriasByTorneo = async (idTorneo) => {
    return database_1.default.torneoCategoria.findMany({
        where: { idTorneo, activo: true },
        select: {
            idTorneoCat: true,
            rondas: true,
            ritmo_juego: true,
            categoria: { select: { idCategoria: true, nombre: true, costo: true, edadMinima: true, edadMaxima: true } },
        },
    });
};
exports.getCategoriasByTorneo = getCategoriasByTorneo;
const getGruposByLiga = async (idLiga) => {
    return database_1.default.grupoLiga.findMany({
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
exports.getGruposByLiga = getGruposByLiga;
// ── Punto 5: Buscar jugador por similitud de nombre ──────────
// Permite al formulario de inscripción detectar posibles duplicados
// y consultar el historial de torneos anteriores del jugador.
const buscarJugadorSimilar = async (q) => {
    const termino = q.trim();
    if (termino.length < 2)
        return [];
    const partes = termino.split(/\s+/);
    const primero = partes[0];
    const resto = partes.slice(1).join(' ');
    return database_1.default.jugador.findMany({
        where: {
            OR: [
                { nombre: { contains: primero } },
                { apellido1: { contains: primero } },
                ...(resto ? [
                    { apellido1: { contains: resto } },
                    { nombre: { contains: resto } },
                ] : []),
            ],
        },
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            fecha_nacimiento: true,
            telefono: true,
            rating: true,
            estado: true,
            inscripciones: {
                select: {
                    idInscripcion: true,
                    estado: true,
                    pago_confirmado: true,
                    fecha_inscripcion: true,
                    torneo: { select: { idTorneo: true, nombre: true, fecha: true, lugar: true } },
                    categoria: { select: { idCategoria: true, nombre: true } },
                },
                orderBy: { fecha_inscripcion: 'desc' },
                take: 10,
            },
        },
        orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
        take: 20,
    });
};
exports.buscarJugadorSimilar = buscarJugadorSimilar;
//# sourceMappingURL=inscripcion-admin.service.js.map