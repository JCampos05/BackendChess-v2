"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarElegibilidad = exports.confirmarPagoJugador = exports.cambiarEstadoJugador = exports.actualizarJugador = exports.crearJugador = exports.obtenerJugadorPorId = exports.buscarJugadoresPorNombre = exports.listarJugadores = void 0;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const nombre_utils_1 = require("../utils/nombre.utils");
const fecha_utils_1 = require("../utils/fecha.utils");
// ── Listado ──────────────────────────────────────────────────
const listarJugadores = async (filtros) => {
    const { nombre, estado, idCategoria, pagina, limite } = filtros;
    const skip = (pagina - 1) * limite;
    const where = {
        ...(estado && { estado }),
        ...(idCategoria && { idCategoria }),
        ...(nombre && {
            OR: [
                { nombre: { contains: nombre } },
                { apellido1: { contains: nombre } },
                { apellido2: { contains: nombre } },
            ],
        }),
    };
    const [total, items] = await Promise.all([
        database_1.default.jugador.count({ where }),
        database_1.default.jugador.findMany({
            where,
            skip,
            take: limite,
            orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
            include: {
                categoria: { select: { idCategoria: true, nombre: true } },
            },
        }),
    ]);
    return { items, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};
exports.listarJugadores = listarJugadores;
// ── Búsqueda rápida por nombre ───────────────────────────────
const buscarJugadoresPorNombre = async (termino) => {
    return database_1.default.jugador.findMany({
        where: {
            OR: [
                { nombre: { contains: termino } },
                { apellido1: { contains: termino } },
                { apellido2: { contains: termino } },
            ],
        },
        select: {
            idJugador: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            rating: true,
            estado: true,
            categoria: { select: { nombre: true } },
        },
        take: 15,
        orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
    });
};
exports.buscarJugadoresPorNombre = buscarJugadoresPorNombre;
// ── Detalle ──────────────────────────────────────────────────
const obtenerJugadorPorId = async (idJugador) => {
    const jugador = await database_1.default.jugador.findUnique({
        where: { idJugador },
        include: {
            categoria: { select: { idCategoria: true, nombre: true, costo: true } },
            inscripciones: {
                orderBy: { fecha_inscripcion: 'desc' },
                take: 10,
                include: {
                    torneo: { select: { idTorneo: true, nombre: true, fecha: true } },
                    categoria: { select: { idCategoria: true, nombre: true } },
                },
            },
        },
    });
    if (!jugador)
        throw new error_middleware_1.NotFoundError('Jugador no encontrado');
    return jugador;
};
exports.obtenerJugadorPorId = obtenerJugadorPorId;
// ── Crear ────────────────────────────────────────────────────
const crearJugador = async (datos) => {
    const nombresNormalizados = (0, nombre_utils_1.normalizarNombreJugador)({
        nombre: datos.nombre,
        apellido1: datos.apellido1,
        apellido2: datos.apellido2,
    });
    const fechaNac = datos.fecha_nacimiento
        ? new Date(datos.fecha_nacimiento)
        : undefined;
    // Verificar duplicado antes del constraint de BD
    const duplicado = await database_1.default.jugador.findFirst({
        where: {
            nombre: nombresNormalizados.nombre,
            apellido1: nombresNormalizados.apellido1,
            apellido2: nombresNormalizados.apellido2 ?? null,
            fecha_nacimiento: fechaNac ?? null,
        },
        select: { idJugador: true },
    });
    if (duplicado) {
        throw new error_middleware_1.ConflictError(`Ya existe un jugador con ese nombre${fechaNac ? ' y fecha de nacimiento' : ''} (id: ${duplicado.idJugador})`);
    }
    return database_1.default.jugador.create({
        data: {
            ...nombresNormalizados,
            telefono: datos.telefono,
            fecha_nacimiento: fechaNac,
            idCategoria: datos.idCategoria,
            notas: datos.notas,
            rating: datos.rating ?? 0,
            estado: 'pendiente_pago',
            pago_confirmado: false,
            fecha_registro: new Date(),
            actualizacion: new Date(),
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });
};
exports.crearJugador = crearJugador;
// ── Actualizar ───────────────────────────────────────────────
const actualizarJugador = async (idJugador, datos) => {
    await _verificarExiste(idJugador);
    const nombresNormalizados = datos.nombre || datos.apellido1
        ? (0, nombre_utils_1.normalizarNombreJugador)({
            nombre: datos.nombre ?? '',
            apellido1: datos.apellido1 ?? '',
            apellido2: datos.apellido2,
        })
        : {};
    return database_1.default.jugador.update({
        where: { idJugador },
        data: {
            ...nombresNormalizados,
            ...(datos.telefono !== undefined && { telefono: datos.telefono }),
            ...(datos.fecha_nacimiento !== undefined && {
                fecha_nacimiento: new Date(datos.fecha_nacimiento),
            }),
            ...(datos.idCategoria !== undefined && { idCategoria: datos.idCategoria }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
            ...(datos.rating !== undefined && { rating: datos.rating }),
            ...(datos.estado !== undefined && {
                estado: datos.estado,
            }),
            actualizacion: new Date(),
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });
};
exports.actualizarJugador = actualizarJugador;
// ── Cambiar estado ───────────────────────────────────────────
const cambiarEstadoJugador = async (idJugador, estado) => {
    await _verificarExiste(idJugador);
    return database_1.default.jugador.update({
        where: { idJugador },
        data: { estado, actualizacion: new Date() },
        select: { idJugador: true, nombre: true, apellido1: true, estado: true },
    });
};
exports.cambiarEstadoJugador = cambiarEstadoJugador;
// ── Confirmar pago (activa al jugador) ───────────────────────
const confirmarPagoJugador = async (idJugador) => {
    await _verificarExiste(idJugador);
    return database_1.default.jugador.update({
        where: { idJugador },
        data: { pago_confirmado: true, estado: 'activo', actualizacion: new Date() },
        select: { idJugador: true, nombre: true, apellido1: true, estado: true, pago_confirmado: true },
    });
};
exports.confirmarPagoJugador = confirmarPagoJugador;
// ── Verificar elegibilidad ───────────────────────────────────
const verificarElegibilidad = async (idJugador, idTorneo, idCategoria) => {
    const [jugador, torneo] = await Promise.all([
        database_1.default.jugador.findUnique({
            where: { idJugador },
            select: { idJugador: true, nombre: true, apellido1: true, estado: true, fecha_nacimiento: true },
        }),
        database_1.default.torneo.findUnique({
            where: { idTorneo },
            select: { idTorneo: true, fecha: true },
        }),
    ]);
    if (!jugador)
        throw new error_middleware_1.NotFoundError('Jugador no encontrado');
    if (!torneo)
        throw new error_middleware_1.NotFoundError('Torneo no encontrado');
    if (jugador.estado === 'inactivo') {
        return { elegible: false, motivo: 'El jugador está inactivo' };
    }
    if (idCategoria && jugador.fecha_nacimiento) {
        const categoria = await database_1.default.categoria.findUnique({
            where: { idCategoria },
            select: { edadMinima: true, edadMaxima: true, tipo_validacion_edad: true },
        });
        if (categoria) {
            const resultado = (0, fecha_utils_1.jugadorPuedeInscribirse)(jugador.fecha_nacimiento, torneo.fecha, categoria.edadMinima, categoria.edadMaxima, categoria.tipo_validacion_edad);
            if (!resultado.puede) {
                return { elegible: false, motivo: resultado.motivo, edad: resultado.edad };
            }
            return { elegible: true, edad: resultado.edad };
        }
    }
    return { elegible: true };
};
exports.verificarElegibilidad = verificarElegibilidad;
// ── Helper privado ───────────────────────────────────────────
const _verificarExiste = async (idJugador) => {
    const jugador = await database_1.default.jugador.findUnique({
        where: { idJugador },
        select: { idJugador: true, estado: true },
    });
    if (!jugador)
        throw new error_middleware_1.NotFoundError('Jugador no encontrado');
    return jugador;
};
//# sourceMappingURL=jugador.service.js.map