"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removerAdmin = exports.asignarAdmin = exports.removerPatrocinador = exports.asignarPatrocinador = exports.listarPatrocinadoresTorneo = exports.desasignarCategoria = exports.actualizarCategoriaTorneo = exports.asignarCategoria = exports.toggleEsActual = exports.toggleActivo = exports.cambiarEstado = exports.eliminarTorneo = exports.actualizarTorneo = exports.crearTorneo = exports.obtenerTorneoPorId = exports.listarTorneos = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
// ── Includes reutilizables ───────────────────────────────────
const INCLUDE_BASE = {
    zona_horaria: { select: { nombreZona: true, nombreMostrar: true } },
    sistema_pago: { select: { idSistemaPago: true, nombreCuenta: true, banco: true } },
    torneo_categorias: {
        where: { activo: true },
        select: {
            idTorneoCat: true,
            rondas: true,
            ritmo_juego: true,
            sistema_competencia: true,
            premios: true,
            cupo_maximo: true,
            cierre_inscripciones: true,
            categoria: { select: { idCategoria: true, nombre: true, costo: true } },
        },
    },
};
const INCLUDE_DETALLE = {
    ...INCLUDE_BASE,
    // 'patrocinadores' en el modelo Torneo se llama 'patrocinadores'
    // (campo definido en schema como: patrocinadores TorneoPatrocinador[])
    patrocinadores: {
        orderBy: { orden: 'asc' },
        select: {
            nivel: true,
            orden: true,
            patrocinador: {
                select: {
                    idPatrocinador: true,
                    nombre: true,
                    logo_url: true,
                    sitio_web: true,
                    descripcion: true,
                    contacto: true,
                },
            },
        },
    },
    admins_asignados: {
        where: { activo: true },
        select: {
            idUsuarioTorneo: true,
            notas: true,
            usuario: { select: { idUsuario: true, telefono: true, rol: true } },
        },
    },
};
// ── CRUD ─────────────────────────────────────────────────────
const listarTorneos = async (filtros) => {
    const { pagina, limite, activo, estado, es_actual, soloConCategorias } = filtros;
    const skip = (pagina - 1) * limite;
    const where = {
        ...(activo !== undefined && { activo }),
        ...(estado && { estado }),
        ...(es_actual !== undefined && { es_actual }),
        ...(soloConCategorias && { torneo_categorias: { some: { activo: true } } }),
    };
    const [total, items] = await Promise.all([
        database_1.default.torneo.count({ where }),
        database_1.default.torneo.findMany({
            where,
            skip,
            take: limite,
            orderBy: [{ es_actual: 'desc' }, { fecha: 'desc' }],
            include: INCLUDE_BASE,
        }),
    ]);
    return { items, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};
exports.listarTorneos = listarTorneos;
const obtenerTorneoPorId = async (idTorneo) => {
    const torneo = await database_1.default.torneo.findUnique({
        where: { idTorneo },
        include: INCLUDE_DETALLE,
    });
    if (!torneo)
        throw new error_middleware_1.NotFoundError('Torneo no encontrado');
    return torneo;
};
exports.obtenerTorneoPorId = obtenerTorneoPorId;
// crearTorneo recibe solo datos — el controller ya no pasa idUsuario
const crearTorneo = async (datos) => {
    return database_1.default.torneo.create({
        data: {
            nombre: datos.nombre,
            lugar: datos.lugar,
            direccion: datos.direccion,
            url_maps: datos.url_maps,
            fecha: new Date(`${datos.fecha}T00:00:00`),
            hora: new Date(`1970-01-01T${datos.hora}:00`),
            rondas: datos.rondas,
            cupo_maximo: datos.cupo_maximo ?? null,
            notas: datos.notas,
            cierre_inscripciones: datos.cierre_inscripciones
                ? new Date(datos.cierre_inscripciones)
                : undefined,
            idZonaHoraria: datos.idZonaHoraria,
            idSistemaPago: datos.idSistemaPago,
            es_actual: datos.es_actual ?? true,
            estado: 'borrador',
            activo: true,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
        },
        include: INCLUDE_DETALLE,
    });
};
exports.crearTorneo = crearTorneo;
const actualizarTorneo = async (idTorneo, datos) => {
    await _verificarExiste(idTorneo);
    return database_1.default.torneo.update({
        where: { idTorneo },
        data: {
            ...(datos.nombre !== undefined && { nombre: datos.nombre }),
            ...(datos.lugar !== undefined && { lugar: datos.lugar }),
            ...(datos.direccion !== undefined && { direccion: datos.direccion }),
            ...(datos.url_maps !== undefined && { url_maps: datos.url_maps }),
            ...(datos.fecha !== undefined && { fecha: new Date(`${datos.fecha}T00:00:00`) }),
            ...(datos.hora !== undefined && { hora: new Date(`1970-01-01T${datos.hora}:00`) }),
            ...(datos.rondas !== undefined && { rondas: datos.rondas }),
            ...(datos.cupo_maximo !== undefined && { cupo_maximo: datos.cupo_maximo }),
            ...(datos.notas !== undefined && { notas: datos.notas }),
            ...(datos.cierre_inscripciones !== undefined && {
                cierre_inscripciones: new Date(datos.cierre_inscripciones),
            }),
            ...(datos.idZonaHoraria !== undefined && {
                zona_horaria: { connect: { idZonaHoraria: datos.idZonaHoraria } },
            }),
            ...(datos.idSistemaPago !== undefined && {
                sistema_pago: { connect: { idSistemaPago: datos.idSistemaPago } },
            }),
            ...(datos.es_actual !== undefined && { es_actual: datos.es_actual }),
            fecha_actualizacion: new Date(),
        },
        include: INCLUDE_DETALLE,
    });
};
exports.actualizarTorneo = actualizarTorneo;
const eliminarTorneo = async (idTorneo) => {
    const torneo = await _verificarExiste(idTorneo);
    if (torneo.estado !== 'borrador')
        throw new error_middleware_1.ForbiddenError('Solo se pueden eliminar torneos en estado borrador');
    await database_1.default.torneo.delete({ where: { idTorneo } });
    return { eliminado: true };
};
exports.eliminarTorneo = eliminarTorneo;
// ── Estado ───────────────────────────────────────────────────
const TRANSICIONES = {
    borrador: ['publicado', 'cancelado'],
    publicado: ['en_curso', 'cancelado'],
    en_curso: ['finalizado', 'cancelado'],
    finalizado: [],
    cancelado: [],
};
const cambiarEstado = async (idTorneo, datos) => {
    const torneo = await _verificarExiste(idTorneo);
    const permitidos = TRANSICIONES[torneo.estado] ?? [];
    if (!permitidos.includes(datos.estado)) {
        throw new error_middleware_1.ForbiddenError(`No se puede pasar de '${torneo.estado}' a '${datos.estado}'. ` +
            `Transiciones válidas: [${permitidos.join(', ') || 'ninguna'}]`);
    }
    return database_1.default.torneo.update({
        where: { idTorneo },
        data: {
            estado: datos.estado,
            ...(datos.notas && { notas: datos.notas }),
            fecha_actualizacion: new Date(),
        },
        include: INCLUDE_BASE,
    });
};
exports.cambiarEstado = cambiarEstado;
const toggleActivo = async (idTorneo, activo) => {
    await _verificarExiste(idTorneo);
    return database_1.default.torneo.update({
        where: { idTorneo },
        data: { activo, fecha_actualizacion: new Date() },
        select: { idTorneo: true, activo: true, es_actual: true },
    });
};
exports.toggleActivo = toggleActivo;
const toggleEsActual = async (idTorneo, es_actual) => {
    const torneo = await _verificarExiste(idTorneo);
    if (es_actual && !torneo.activo)
        throw new error_middleware_1.ForbiddenError('Un torneo debe estar activo para ser marcado como actual');
    return database_1.default.torneo.update({
        where: { idTorneo },
        data: { es_actual, fecha_actualizacion: new Date() },
        select: { idTorneo: true, activo: true, es_actual: true },
    });
};
exports.toggleEsActual = toggleEsActual;
// ── Categorías ───────────────────────────────────────────────
const asignarCategoria = async (idTorneo, datos) => {
    const [torneo, categoria] = await Promise.all([
        database_1.default.torneo.findUnique({
            where: { idTorneo },
            select: { idTorneo: true },
        }),
        database_1.default.categoria.findUnique({
            where: { idCategoria: datos.idCategoria },
            select: { idCategoria: true, nombre: true },
        }),
    ]);
    if (!torneo)
        throw new error_middleware_1.NotFoundError('Torneo no encontrado');
    if (!categoria)
        throw new error_middleware_1.NotFoundError('Categoría no encontrada');
    // El modelo se llama 'torneoCategoria' en el cliente Prisma
    return database_1.default.torneoCategoria.upsert({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria: datos.idCategoria } },
        create: {
            idTorneo,
            idCategoria: datos.idCategoria,
            rondas: datos.rondas ?? 5,
            ritmo_juego: datos.ritmo_juego,
            sistema_competencia: datos.sistema_competencia,
            premios: (datos.premios ?? client_1.Prisma.JsonNull),
            desempates: (datos.desempates ?? client_1.Prisma.JsonNull),
            calendario: (datos.calendario ?? client_1.Prisma.JsonNull),
            activo: true,
        },
        update: {
            rondas: datos.rondas,
            ritmo_juego: datos.ritmo_juego,
            sistema_competencia: datos.sistema_competencia,
            premios: (datos.premios ?? client_1.Prisma.JsonNull),
            desempates: (datos.desempates ?? client_1.Prisma.JsonNull),
            calendario: (datos.calendario ?? client_1.Prisma.JsonNull),
            activo: true,
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true, costo: true } },
        },
    });
};
exports.asignarCategoria = asignarCategoria;
const actualizarCategoriaTorneo = async (idTorneo, idCategoria, datos) => {
    const tc = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (!tc)
        throw new error_middleware_1.NotFoundError('La categoría no está asignada a este torneo');
    return database_1.default.torneoCategoria.update({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
        data: {
            ...(datos.rondas !== undefined && { rondas: datos.rondas }),
            ...(datos.ritmo_juego !== undefined && { ritmo_juego: datos.ritmo_juego }),
            ...(datos.sistema_competencia !== undefined && { sistema_competencia: datos.sistema_competencia }),
            ...(datos.premios !== undefined && { premios: datos.premios }),
            ...(datos.desempates !== undefined && { desempates: datos.desempates }),
            ...(datos.calendario !== undefined && { calendario: datos.calendario }),
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });
};
exports.actualizarCategoriaTorneo = actualizarCategoriaTorneo;
const desasignarCategoria = async (idTorneo, idCategoria) => {
    const tc = await database_1.default.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (!tc)
        throw new error_middleware_1.NotFoundError('La categoría no está asignada a este torneo');
    return database_1.default.torneoCategoria.update({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
        data: { activo: false },
        select: { idTorneoCat: true, activo: true },
    });
};
exports.desasignarCategoria = desasignarCategoria;
// ── Patrocinadores ───────────────────────────────────────────
const listarPatrocinadoresTorneo = async (idTorneo) => {
    await _verificarExiste(idTorneo);
    // Modelo: torneoPatrocinador
    return database_1.default.torneoPatrocinador.findMany({
        where: { idTorneo },
        orderBy: { orden: 'asc' },
        select: {
            nivel: true,
            orden: true,
            patrocinador: {
                select: {
                    idPatrocinador: true,
                    nombre: true,
                    logo_url: true,
                    sitio_web: true,
                    descripcion: true,
                    contacto: true,
                },
            },
        },
    });
};
exports.listarPatrocinadoresTorneo = listarPatrocinadoresTorneo;
const asignarPatrocinador = async (idTorneo, datos) => {
    const [torneo, patrocinador] = await Promise.all([
        database_1.default.torneo.findUnique({
            where: { idTorneo },
            select: { idTorneo: true },
        }),
        // Modelo: patrocinador
        database_1.default.patrocinador.findUnique({
            where: { idPatrocinador: datos.idPatrocinador },
            select: { idPatrocinador: true, nombre: true },
        }),
    ]);
    if (!torneo)
        throw new error_middleware_1.NotFoundError('Torneo no encontrado');
    if (!patrocinador)
        throw new error_middleware_1.NotFoundError('Patrocinador no encontrado');
    return database_1.default.torneoPatrocinador.upsert({
        where: {
            idTorneo_idPatrocinador: { idTorneo, idPatrocinador: datos.idPatrocinador },
        },
        create: {
            idTorneo,
            idPatrocinador: datos.idPatrocinador,
            nivel: datos.nivel,
            orden: datos.orden,
        },
        update: {
            nivel: datos.nivel,
            orden: datos.orden,
        },
        select: {
            nivel: true,
            orden: true,
            patrocinador: { select: { idPatrocinador: true, nombre: true } },
        },
    });
};
exports.asignarPatrocinador = asignarPatrocinador;
const removerPatrocinador = async (idTorneo, idPatrocinador) => {
    const tp = await database_1.default.torneoPatrocinador.findUnique({
        where: { idTorneo_idPatrocinador: { idTorneo, idPatrocinador } },
    });
    if (!tp)
        throw new error_middleware_1.NotFoundError('El patrocinador no está asignado a este torneo');
    await database_1.default.torneoPatrocinador.delete({
        where: { idTorneo_idPatrocinador: { idTorneo, idPatrocinador } },
    });
    return { eliminado: true };
};
exports.removerPatrocinador = removerPatrocinador;
// ── Admins ───────────────────────────────────────────────────
const asignarAdmin = async (idTorneo, datos) => {
    const [torneo, usuario] = await Promise.all([
        database_1.default.torneo.findUnique({
            where: { idTorneo },
            select: { idTorneo: true },
        }),
        database_1.default.usuario.findUnique({
            where: { idUsuario: datos.idUsuario },
            select: { idUsuario: true, rol: true, activo: true },
        }),
    ]);
    if (!torneo)
        throw new error_middleware_1.NotFoundError('Torneo no encontrado');
    if (!usuario)
        throw new error_middleware_1.NotFoundError('Usuario no encontrado');
    if (!usuario.activo)
        throw new error_middleware_1.ForbiddenError('El usuario está inactivo');
    if (usuario.rol !== 'adminTorneo')
        throw new error_middleware_1.ForbiddenError('Solo se pueden asignar usuarios con rol adminTorneo');
    // Modelo: usuarioTorneo
    return database_1.default.usuarioTorneo.upsert({
        where: { idUsuario_idTorneo: { idUsuario: datos.idUsuario, idTorneo } },
        create: { idUsuario: datos.idUsuario, idTorneo, notas: datos.notas, activo: true },
        update: { notas: datos.notas, activo: true },
        include: {
            usuario: { select: { idUsuario: true, telefono: true, rol: true } },
        },
    });
};
exports.asignarAdmin = asignarAdmin;
const removerAdmin = async (idTorneo, idUsuario) => {
    const ut = await database_1.default.usuarioTorneo.findUnique({
        where: { idUsuario_idTorneo: { idUsuario, idTorneo } },
    });
    if (!ut)
        throw new error_middleware_1.NotFoundError('El usuario no está asignado a este torneo');
    return database_1.default.usuarioTorneo.update({
        where: { idUsuario_idTorneo: { idUsuario, idTorneo } },
        data: { activo: false },
        select: { idUsuarioTorneo: true, activo: true },
    });
};
exports.removerAdmin = removerAdmin;
// ── Helper privado ───────────────────────────────────────────
const _verificarExiste = async (idTorneo) => {
    const t = await database_1.default.torneo.findUnique({
        where: { idTorneo },
        select: { idTorneo: true, estado: true, activo: true, es_actual: true },
    });
    if (!t)
        throw new error_middleware_1.NotFoundError('Torneo no encontrado');
    return t;
};
//# sourceMappingURL=torneo.service.js.map