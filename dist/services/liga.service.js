"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerTablaPosiciones = exports.registrarPartidaLiga = exports.generarMesasLiga = exports.listarMesasLiga = exports.cambiarEstadoRondaLiga = exports.crearRondaLiga = exports.listarRondasLiga = exports.cancelarInscripcionLiga = exports.confirmarPagoLiga = exports.inscribirJugadorLiga = exports.listarJugadoresLiga = exports.actualizarGrupo = exports.crearGrupo = exports.listarGrupos = exports.toggleActivoLiga = exports.actualizarLiga = exports.crearLiga = exports.obtenerLigaPorId = exports.listarLigas = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
// ── Includes reutilizables ───────────────────────────────────
const INCLUDE_LIGA_BASE = {
    ritmo_juego: { select: { idRitmoJuego: true, nombre: true, minutos: true, incremento: true } },
    grupos: {
        where: { activo: true },
        select: {
            idGrupoLiga: true,
            nombre: true,
            max_jugadores: true,
            rondas: true,
            activo: true,
        },
    },
};
// ============================================================
// LIGA
// ============================================================
const listarLigas = async (filtros) => {
    const { pagina, limite, activo } = filtros;
    const skip = (pagina - 1) * limite;
    const where = {
        ...(activo !== undefined && { activo }),
    };
    const [total, items] = await Promise.all([
        database_1.default.infoLiga.count({ where }),
        database_1.default.infoLiga.findMany({
            where,
            skip,
            take: limite,
            orderBy: { fecha_inicio: 'desc' },
            include: INCLUDE_LIGA_BASE,
        }),
    ]);
    return { items, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};
exports.listarLigas = listarLigas;
const obtenerLigaPorId = async (idLiga) => {
    const liga = await database_1.default.infoLiga.findUnique({
        where: { idLiga },
        include: {
            ...INCLUDE_LIGA_BASE,
            grupos: {
                where: { activo: true },
                include: {
                    jugadores_liga: {
                        where: { estado: { not: 'cancelado' } },
                        select: {
                            idJugadorLiga: true,
                            puntos: true,
                            posicion_grupo: true,
                            estado: true,
                            jugador: {
                                select: { idJugador: true, nombre: true, apellido1: true, rating: true },
                            },
                        },
                        orderBy: [{ puntos: 'desc' }, { posicion_grupo: 'asc' }],
                    },
                },
            },
        },
    });
    if (!liga)
        throw new error_middleware_1.NotFoundError('Liga no encontrada');
    return liga;
};
exports.obtenerLigaPorId = obtenerLigaPorId;
const crearLiga = async (datos) => {
    return database_1.default.infoLiga.create({
        data: {
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            fecha_inicio: new Date(`${datos.fecha_inicio}T00:00:00`),
            fecha_fin: datos.fecha_fin ? new Date(`${datos.fecha_fin}T00:00:00`) : undefined,
            lugar: datos.lugar,
            direccion: datos.direccion,
            tipo_sistema: datos.tipo_sistema,
            num_grupos: datos.num_grupos,
            clasifican_por_grupo: datos.clasifican_por_grupo,
            idRitmoJuego: datos.idRitmoJuego,
            costo_inscripcion: datos.costo_inscripcion,
            cierre_inscripciones: datos.cierre_inscripciones
                ? new Date(datos.cierre_inscripciones)
                : undefined,
            max_jugadores: datos.max_jugadores,
            notas: datos.notas,
            activo: true,
        },
        include: INCLUDE_LIGA_BASE,
    });
};
exports.crearLiga = crearLiga;
const actualizarLiga = async (idLiga, datos) => {
    await _verificarLiga(idLiga);
    return database_1.default.infoLiga.update({
        where: { idLiga },
        data: {
            ...(datos.nombre !== undefined && { nombre: datos.nombre }),
            ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
            ...(datos.fecha_inicio !== undefined && { fecha_inicio: new Date(`${datos.fecha_inicio}T00:00:00`) }),
            ...(datos.fecha_fin !== undefined && { fecha_fin: new Date(`${datos.fecha_fin}T00:00:00`) }),
            ...(datos.lugar !== undefined && { lugar: datos.lugar }),
            ...(datos.direccion !== undefined && { direccion: datos.direccion }),
            ...(datos.tipo_sistema !== undefined && { tipo_sistema: datos.tipo_sistema }),
            ...(datos.num_grupos !== undefined && { num_grupos: datos.num_grupos }),
            ...(datos.clasifican_por_grupo !== undefined && { clasifican_por_grupo: datos.clasifican_por_grupo }),
            ...(datos.idRitmoJuego !== undefined && { idRitmoJuego: datos.idRitmoJuego }),
            ...(datos.costo_inscripcion !== undefined && { costo_inscripcion: datos.costo_inscripcion }),
            ...(datos.cierre_inscripciones !== undefined && { cierre_inscripciones: new Date(datos.cierre_inscripciones) }),
            ...(datos.max_jugadores !== undefined && { max_jugadores: datos.max_jugadores }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
        },
        include: INCLUDE_LIGA_BASE,
    });
};
exports.actualizarLiga = actualizarLiga;
const toggleActivoLiga = async (idLiga, activo) => {
    await _verificarLiga(idLiga);
    return database_1.default.infoLiga.update({
        where: { idLiga },
        data: { activo },
        select: { idLiga: true, nombre: true, activo: true },
    });
};
exports.toggleActivoLiga = toggleActivoLiga;
// ============================================================
// GRUPOS
// ============================================================
const listarGrupos = async (idLiga) => {
    await _verificarLiga(idLiga);
    return database_1.default.grupoLiga.findMany({
        where: { idLiga, activo: true },
        orderBy: { nombre: 'asc' },
        include: {
            _count: {
                select: { jugadores_liga: { where: { estado: { not: 'cancelado' } } } },
            },
        },
    });
};
exports.listarGrupos = listarGrupos;
const crearGrupo = async (idLiga, datos) => {
    await _verificarLiga(idLiga);
    const existe = await database_1.default.grupoLiga.findFirst({
        where: { idLiga, nombre: datos.nombre, activo: true },
    });
    if (existe)
        throw new error_middleware_1.ConflictError(`Ya existe un grupo llamado "${datos.nombre}" en esta liga`);
    return database_1.default.grupoLiga.create({
        data: {
            idLiga,
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            max_jugadores: datos.max_jugadores,
            rondas: datos.rondas,
            premios: (datos.premios ?? client_1.Prisma.JsonNull),
            desempates: (datos.desempates ?? client_1.Prisma.JsonNull),
            activo: true,
        },
    });
};
exports.crearGrupo = crearGrupo;
const actualizarGrupo = async (idLiga, idGrupoLiga, datos) => {
    await _verificarGrupo(idLiga, idGrupoLiga);
    return database_1.default.grupoLiga.update({
        where: { idGrupoLiga },
        data: {
            ...(datos.nombre !== undefined && { nombre: datos.nombre }),
            ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
            ...(datos.max_jugadores !== undefined && { max_jugadores: datos.max_jugadores }),
            ...(datos.rondas !== undefined && { rondas: datos.rondas }),
            ...(datos.premios !== undefined && { premios: datos.premios }),
            ...(datos.desempates !== undefined && { desempates: datos.desempates }),
        },
    });
};
exports.actualizarGrupo = actualizarGrupo;
// ============================================================
// JUGADORES DE LIGA
// ============================================================
const listarJugadoresLiga = async (idLiga, idGrupoLiga) => {
    return database_1.default.jugadorLiga.findMany({
        where: {
            idLiga,
            ...(idGrupoLiga && { idGrupoLiga }),
            estado: { not: 'cancelado' },
        },
        orderBy: [{ puntos: 'desc' }, { posicion_grupo: 'asc' }],
        include: {
            jugador: {
                select: {
                    idJugador: true,
                    nombre: true,
                    apellido1: true,
                    apellido2: true,
                    rating: true,
                    telefono: true,
                },
            },
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};
exports.listarJugadoresLiga = listarJugadoresLiga;
const inscribirJugadorLiga = async (idLiga, datos) => {
    return database_1.default.$transaction(async (tx) => {
        // 1. Verificar liga activa
        const liga = await tx.infoLiga.findUnique({ where: { idLiga } });
        if (!liga)
            throw new error_middleware_1.NotFoundError('Liga no encontrada');
        if (!liga.activo)
            throw new error_middleware_1.ForbiddenError('La liga no está activa');
        // 2. Verificar cierre de inscripciones
        if (liga.cierre_inscripciones && new Date() > liga.cierre_inscripciones)
            throw new error_middleware_1.ForbiddenError('Las inscripciones para esta liga están cerradas');
        // 3. Verificar que el grupo pertenece a la liga
        const grupo = await tx.grupoLiga.findFirst({
            where: { idGrupoLiga: datos.idGrupoLiga, idLiga, activo: true },
        });
        if (!grupo)
            throw new error_middleware_1.NotFoundError('Grupo no encontrado en esta liga');
        // 4. Verificar cupo del grupo
        if (grupo.max_jugadores) {
            const inscritosGrupo = await tx.jugadorLiga.count({
                where: { idGrupoLiga: datos.idGrupoLiga, estado: { not: 'cancelado' } },
            });
            if (inscritosGrupo >= grupo.max_jugadores)
                throw new error_middleware_1.ForbiddenError(`El grupo "${grupo.nombre}" está lleno`);
        }
        // 5. Verificar que el jugador existe
        const jugador = await tx.jugador.findUnique({
            where: { idJugador: datos.idJugador },
        });
        if (!jugador)
            throw new error_middleware_1.NotFoundError('Jugador no encontrado');
        // 6. Verificar que no esté ya inscrito en esta liga
        const yaInscrito = await tx.jugadorLiga.findUnique({
            where: { idLiga_idJugador: { idLiga, idJugador: datos.idJugador } },
        });
        if (yaInscrito && yaInscrito.estado !== 'cancelado')
            throw new error_middleware_1.ConflictError('El jugador ya está inscrito en esta liga');
        // 7. Crear inscripción
        return tx.jugadorLiga.create({
            data: {
                idLiga,
                idGrupoLiga: datos.idGrupoLiga,
                idJugador: datos.idJugador,
                rating_inicial: jugador.rating,
                monto_pagado: datos.monto_pagado,
                pago_confirmado: datos.pago_confirmado,
                estado: datos.pago_confirmado ? 'confirmado' : 'inscrito',
                notas: datos.notas,
            },
            include: {
                jugador: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
                grupo: { select: { idGrupoLiga: true, nombre: true } },
            },
        });
    });
};
exports.inscribirJugadorLiga = inscribirJugadorLiga;
const confirmarPagoLiga = async (idJugadorLiga, datos) => {
    const inscripcion = await database_1.default.jugadorLiga.findUnique({
        where: { idJugadorLiga },
    });
    if (!inscripcion)
        throw new error_middleware_1.NotFoundError('Inscripción no encontrada');
    if (inscripcion.estado === 'cancelado')
        throw new error_middleware_1.ForbiddenError('No se puede confirmar una inscripción cancelada');
    return database_1.default.jugadorLiga.update({
        where: { idJugadorLiga },
        data: {
            pago_confirmado: true,
            monto_pagado: datos.monto_pagado,
            estado: 'confirmado',
            ...(datos.notas && { notas: datos.notas }),
        },
        include: {
            jugador: { select: { idJugador: true, nombre: true, apellido1: true } },
        },
    });
};
exports.confirmarPagoLiga = confirmarPagoLiga;
const cancelarInscripcionLiga = async (idJugadorLiga) => {
    const inscripcion = await database_1.default.jugadorLiga.findUnique({
        where: { idJugadorLiga },
    });
    if (!inscripcion)
        throw new error_middleware_1.NotFoundError('Inscripción no encontrada');
    if (inscripcion.estado === 'cancelado')
        throw new error_middleware_1.ConflictError('La inscripción ya está cancelada');
    return database_1.default.jugadorLiga.update({
        where: { idJugadorLiga },
        data: { estado: 'cancelado' },
        select: { idJugadorLiga: true, estado: true, idJugador: true, idLiga: true },
    });
};
exports.cancelarInscripcionLiga = cancelarInscripcionLiga;
// ============================================================
// RONDAS DE LIGA
// ============================================================
const listarRondasLiga = async (idLiga, idGrupoLiga) => {
    return database_1.default.rondaLiga.findMany({
        where: { idLiga, ...(idGrupoLiga && { idGrupoLiga }) },
        orderBy: [{ idGrupoLiga: 'asc' }, { numeroRonda: 'asc' }],
        include: {
            grupo: { select: { idGrupoLiga: true, nombre: true } },
            _count: { select: { mesas_liga: true } },
        },
    });
};
exports.listarRondasLiga = listarRondasLiga;
const crearRondaLiga = async (idLiga, datos) => {
    await _verificarGrupo(idLiga, datos.idGrupoLiga);
    // Verificar que no exista ya esa ronda en ese grupo
    const existe = await database_1.default.rondaLiga.findUnique({
        where: {
            idLiga_idGrupoLiga_numeroRonda: {
                idLiga,
                idGrupoLiga: datos.idGrupoLiga,
                numeroRonda: datos.numeroRonda,
            },
        },
    });
    if (existe)
        throw new error_middleware_1.ConflictError(`La ronda ${datos.numeroRonda} ya existe en este grupo`);
    return database_1.default.rondaLiga.create({
        data: {
            idLiga,
            idGrupoLiga: datos.idGrupoLiga,
            numeroRonda: datos.numeroRonda,
            fecha_programada: datos.fecha_programada
                ? new Date(`${datos.fecha_programada}T00:00:00`)
                : undefined,
            hora_inicio: datos.hora_inicio
                ? new Date(`1970-01-01T${datos.hora_inicio}:00`)
                : undefined,
            notas: datos.notas,
            estado: 'planificada',
        },
        include: {
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};
exports.crearRondaLiga = crearRondaLiga;
const cambiarEstadoRondaLiga = async (idRondaLiga, datos) => {
    const ronda = await database_1.default.rondaLiga.findUnique({ where: { idRondaLiga } });
    if (!ronda)
        throw new error_middleware_1.NotFoundError('Ronda no encontrada');
    return database_1.default.rondaLiga.update({
        where: { idRondaLiga },
        data: {
            estado: datos.estado,
            ...(datos.estado === 'en_curso' && { fecha_inicio: new Date() }),
            ...(datos.estado === 'finalizada' && { fecha_fin: new Date() }),
            ...(datos.notas && { notas: datos.notas }),
        },
        include: {
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};
exports.cambiarEstadoRondaLiga = cambiarEstadoRondaLiga;
// ============================================================
// MESAS DE LIGA
// ============================================================
const listarMesasLiga = async (idRondaLiga) => {
    return database_1.default.mesaLiga.findMany({
        where: { idRondaLiga },
        orderBy: { numeroMesa: 'asc' },
        include: {
            jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            partida_liga: true,
        },
    });
};
exports.listarMesasLiga = listarMesasLiga;
// Genera las mesas de una ronda usando emparejamiento secuencial
// Para Round Robin y sistema suizo básico
const generarMesasLiga = async (idLiga, idRondaLiga) => {
    return database_1.default.$transaction(async (tx) => {
        const ronda = await tx.rondaLiga.findUnique({
            where: { idRondaLiga },
            include: { grupo: true },
        });
        if (!ronda)
            throw new error_middleware_1.NotFoundError('Ronda no encontrada');
        if (ronda.estado !== 'planificada')
            throw new error_middleware_1.ForbiddenError('Solo se pueden generar mesas en rondas planificadas');
        // Verificar que no haya mesas ya generadas
        const mesasExistentes = await tx.mesaLiga.count({ where: { idRondaLiga } });
        if (mesasExistentes > 0)
            throw new error_middleware_1.ConflictError('Esta ronda ya tiene mesas generadas');
        // Obtener jugadores del grupo ordenados por posición/rating
        const jugadores = await tx.jugadorLiga.findMany({
            where: {
                idGrupoLiga: ronda.idGrupoLiga,
                idLiga,
                estado: 'confirmado',
            },
            orderBy: [
                { posicion: 'asc' },
                { jugador: { rating: 'desc' } },
            ],
            select: { idJugador: true },
        });
        if (jugadores.length < 2)
            throw new error_middleware_1.ForbiddenError('Se necesitan al menos 2 jugadores confirmados para generar mesas');
        // Emparejar: jugador 1 vs último, jugador 2 vs penúltimo, etc.
        const mesas = [];
        const n = jugadores.length;
        const mitad = Math.floor(n / 2);
        for (let i = 0; i < mitad; i++) {
            mesas.push({
                numeroMesa: i + 1,
                idJugadorBlanco: jugadores[i].idJugador,
                idJugadorNegro: jugadores[n - 1 - i].idJugador,
            });
        }
        // Registrar historial de emparejamientos
        await tx.historialEmparejamientoLiga.createMany({
            data: mesas.map(m => ({
                idJugador1: m.idJugadorBlanco,
                idJugador2: m.idJugadorNegro,
                idLiga,
                idGrupoLiga: ronda.idGrupoLiga,
                numeroRonda: ronda.numeroRonda,
            })),
            skipDuplicates: true,
        });
        // Crear mesas en batch
        await tx.mesaLiga.createMany({
            data: mesas.map(m => ({
                idRondaLiga,
                numeroMesa: m.numeroMesa,
                idJugadorBlanco: m.idJugadorBlanco,
                idJugadorNegro: m.idJugadorNegro,
                estado: 'pendiente',
                fecha_creacion: new Date(),
            })),
        });
        return tx.mesaLiga.findMany({
            where: { idRondaLiga },
            orderBy: { numeroMesa: 'asc' },
            include: {
                jugador_blanco: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
                jugador_negro: { select: { idJugador: true, nombre: true, apellido1: true, rating: true } },
            },
        });
    });
};
exports.generarMesasLiga = generarMesasLiga;
// ============================================================
// PARTIDAS DE LIGA
// ============================================================
const registrarPartidaLiga = async (idMesaLiga, datos) => {
    return database_1.default.$transaction(async (tx) => {
        const mesa = await tx.mesaLiga.findUnique({
            where: { idMesaLiga },
            include: { ronda_liga: { select: { idLiga: true, idGrupoLiga: true, estado: true } } },
        });
        if (!mesa)
            throw new error_middleware_1.NotFoundError('Mesa no encontrada');
        if (mesa.estado === 'finalizada')
            throw new error_middleware_1.ConflictError('Esta mesa ya tiene una partida registrada');
        const yaExiste = await tx.partidaLiga.findUnique({ where: { idMesaLiga } });
        if (yaExiste)
            throw new error_middleware_1.ConflictError('Esta mesa ya tiene una partida registrada');
        // Crear partida
        const partida = await tx.partidaLiga.create({
            data: {
                idMesaLiga,
                idJugadorGanador: datos.idJugadorGanador ?? undefined,
                resultado: datos.resultado,
                tipo_finalizacion: datos.tipo_finalizacion,
                descripcion_finalizacion: datos.descripcion_finalizacion,
                duracion_minutos: datos.duracion_minutos,
                fecha_finalizacion: new Date(),
            },
        });
        // Marcar mesa como finalizada
        await tx.mesaLiga.update({
            where: { idMesaLiga },
            data: { estado: 'finalizada' },
        });
        // Actualizar estadísticas de jugadores en el grupo
        await _actualizarEstadisticasGrupo(tx, mesa.idJugadorBlanco, mesa.idJugadorNegro, datos.resultado, mesa.ronda_liga.idLiga, mesa.ronda_liga.idGrupoLiga);
        return partida;
    });
};
exports.registrarPartidaLiga = registrarPartidaLiga;
// ============================================================
// TABLA DE POSICIONES
// ============================================================
const obtenerTablaPosiciones = async (idLiga, idGrupoLiga) => {
    const where = {
        idLiga,
        ...(idGrupoLiga && { idGrupoLiga }),
        estado: { not: 'cancelado' },
    };
    return database_1.default.jugadorLiga.findMany({
        where,
        orderBy: [
            { puntos: 'desc' },
            { victorias: 'desc' },
            { posicion_grupo: 'asc' },
        ],
        include: {
            jugador: {
                select: {
                    idJugador: true,
                    nombre: true,
                    apellido1: true,
                    apellido2: true,
                    rating: true,
                },
            },
            grupo: { select: { idGrupoLiga: true, nombre: true } },
        },
    });
};
exports.obtenerTablaPosiciones = obtenerTablaPosiciones;
// ============================================================
// HELPERS PRIVADOS
// ============================================================
const _verificarLiga = async (idLiga) => {
    const liga = await database_1.default.infoLiga.findUnique({
        where: { idLiga },
        select: { idLiga: true, activo: true },
    });
    if (!liga)
        throw new error_middleware_1.NotFoundError('Liga no encontrada');
    return liga;
};
const _verificarGrupo = async (idLiga, idGrupoLiga) => {
    const grupo = await database_1.default.grupoLiga.findFirst({
        where: { idGrupoLiga, idLiga, activo: true },
        select: { idGrupoLiga: true },
    });
    if (!grupo)
        throw new error_middleware_1.NotFoundError('Grupo no encontrado en esta liga');
    return grupo;
};
// Actualiza puntos, victorias, empates y derrotas de ambos jugadores
const _actualizarEstadisticasGrupo = async (tx, idJugadorBlanco, idJugadorNegro, resultado, idLiga, idGrupoLiga) => {
    let puntosBlanco = 0;
    let puntosNegro = 0;
    let vicBlanco = 0;
    let vicNegro = 0;
    let empBlanco = 0;
    let empNegro = 0;
    let derBlanco = 0;
    let derNegro = 0;
    if (resultado === '1-0') {
        puntosBlanco = 1;
        vicBlanco = 1;
        derNegro = 1;
    }
    else if (resultado === '0-1') {
        puntosNegro = 1;
        vicNegro = 1;
        derBlanco = 1;
    }
    else if (resultado === '0.5-0.5') {
        puntosBlanco = 0.5;
        puntosNegro = 0.5;
        empBlanco = 1;
        empNegro = 1;
    }
    // '0-0' = incomparecencia, no suma puntos
    const actualizar = async (idJugador, puntos, v, e, d) => {
        const jl = await tx.jugadorLiga.findFirst({
            where: { idLiga, idGrupoLiga, idJugador },
        });
        if (!jl)
            return;
        await tx.jugadorLiga.update({
            where: { idJugadorLiga: jl.idJugadorLiga },
            data: {
                puntos: { increment: puntos },
                partidas_jugadas: { increment: resultado !== '0-0' ? 1 : 0 },
                victorias: { increment: v },
                empates: { increment: e },
                derrotas: { increment: d },
            },
        });
    };
    await Promise.all([
        actualizar(idJugadorBlanco, puntosBlanco, vicBlanco, empBlanco, derBlanco),
        actualizar(idJugadorNegro, puntosNegro, vicNegro, empNegro, derNegro),
    ]);
};
//# sourceMappingURL=liga.service.js.map