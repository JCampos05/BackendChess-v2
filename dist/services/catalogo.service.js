"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategorias = getAllCategorias;
exports.getCategoriaById = getCategoriaById;
exports.createCategoria = createCategoria;
exports.updateCategoria = updateCategoria;
exports.deleteCategoria = deleteCategoria;
exports.getAllRitmos = getAllRitmos;
exports.getRitmoById = getRitmoById;
exports.createRitmo = createRitmo;
exports.updateRitmo = updateRitmo;
exports.deleteRitmo = deleteRitmo;
exports.getAllSistemasCompetencia = getAllSistemasCompetencia;
exports.getSistemaCompetenciaById = getSistemaCompetenciaById;
exports.createSistemaCompetencia = createSistemaCompetencia;
exports.updateSistemaCompetencia = updateSistemaCompetencia;
exports.deleteSistemaCompetencia = deleteSistemaCompetencia;
exports.getAllSistemasDesempate = getAllSistemasDesempate;
exports.getSistemaDesempateById = getSistemaDesempateById;
exports.createSistemaDesempate = createSistemaDesempate;
exports.updateSistemaDesempate = updateSistemaDesempate;
exports.deleteSistemaDesempate = deleteSistemaDesempate;
exports.getAllSistemasPago = getAllSistemasPago;
exports.getSistemasPagoActivos = getSistemasPagoActivos;
exports.getSistemaPagoById = getSistemaPagoById;
exports.createSistemaPago = createSistemaPago;
exports.updateSistemaPago = updateSistemaPago;
exports.deleteSistemaPago = deleteSistemaPago;
exports.toggleActiveSistemaPago = toggleActiveSistemaPago;
// ============================================================
// Categoria · RitmoJuego · SistemaCompetencia · SistemaDesempate · SistemaPago
// ============================================================
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
// ─── HELPERS ──────────────────────────────────────────────────────────────────
const CLABE_REGEX = /^\d{18}$/;
function validarEdades(edadMinima, edadMaxima) {
    if (edadMinima != null && (edadMinima < 0 || edadMinima > 120))
        throw new error_middleware_1.ValidationError('La edad mínima debe ser un número entre 0 y 120');
    if (edadMaxima != null && (edadMaxima < 0 || edadMaxima > 120))
        throw new error_middleware_1.ValidationError('La edad máxima debe ser un número entre 0 y 120');
    if (edadMinima != null && edadMaxima != null && edadMinima > edadMaxima)
        throw new error_middleware_1.ValidationError('La edad mínima no puede ser mayor que la edad máxima');
}
function safePrismaDelete(e, entidad) {
    if (e.code === 'P2003')
        throw new error_middleware_1.ConflictError(`No se puede eliminar ${entidad} porque está siendo utilizado/a`);
    throw e;
}
// ──────────────────────────────────────────────────────────────────────────────
// CATEGORÍA
// ──────────────────────────────────────────────────────────────────────────────
async function getAllCategorias(orden = 'nombre', direccion = 'asc') {
    const camposValidos = ['idCategoria', 'nombre', 'costo', 'edadMinima', 'edadMaxima'];
    const orderBy = camposValidos.includes(orden)
        ? { [orden]: direccion }
        : { nombre: direccion };
    return database_1.default.categoria.findMany({ orderBy });
}
async function getCategoriaById(id) {
    const cat = await database_1.default.categoria.findUnique({ where: { idCategoria: id } });
    if (!cat)
        throw new error_middleware_1.NotFoundError('Categoría no encontrada');
    return cat;
}
async function createCategoria(dto) {
    if (!dto.nombre?.trim())
        throw new error_middleware_1.ValidationError('El nombre es obligatorio');
    if (dto.costo < 0)
        throw new error_middleware_1.ValidationError('El costo debe ser mayor o igual a 0');
    validarEdades(dto.edadMinima, dto.edadMaxima);
    const dup = await database_1.default.categoria.findFirst({
        where: { nombre: { equals: dto.nombre.trim() } },
    });
    if (dup)
        throw new error_middleware_1.ConflictError('Ya existe una categoría con ese nombre');
    return database_1.default.categoria.create({
        data: {
            nombre: dto.nombre.trim(),
            costo: dto.costo,
            nota: dto.nota?.trim() ?? null,
            edadMinima: dto.edadMinima ?? null,
            edadMaxima: dto.edadMaxima ?? null,
        },
    });
}
async function updateCategoria(id, dto) {
    const cat = await database_1.default.categoria.findUnique({ where: { idCategoria: id } });
    if (!cat)
        throw new error_middleware_1.NotFoundError('Categoría no encontrada');
    if (dto.nombre !== undefined) {
        if (!dto.nombre.trim())
            throw new error_middleware_1.ValidationError('El nombre no puede estar vacío');
        if (dto.nombre.trim().toLowerCase() !== cat.nombre.toLowerCase()) {
            const dup = await database_1.default.categoria.findFirst({
                where: { nombre: { equals: dto.nombre.trim() }, NOT: { idCategoria: id } },
            });
            if (dup)
                throw new error_middleware_1.ConflictError('Ya existe una categoría con ese nombre');
        }
    }
    if (dto.costo !== undefined && dto.costo < 0)
        throw new error_middleware_1.ValidationError('El costo debe ser mayor o igual a 0');
    const edadMin = dto.edadMinima !== undefined ? dto.edadMinima : cat.edadMinima;
    const edadMax = dto.edadMaxima !== undefined ? dto.edadMaxima : cat.edadMaxima;
    validarEdades(edadMin, edadMax);
    return database_1.default.categoria.update({
        where: { idCategoria: id },
        data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre.trim() }),
            ...(dto.costo !== undefined && { costo: dto.costo }),
            ...(dto.nota !== undefined && { nota: dto.nota?.trim() ?? null }),
            ...(dto.edadMinima !== undefined && { edadMinima: dto.edadMinima }),
            ...(dto.edadMaxima !== undefined && { edadMaxima: dto.edadMaxima }),
        },
    });
}
async function deleteCategoria(id) {
    const cat = await database_1.default.categoria.findUnique({ where: { idCategoria: id } });
    if (!cat)
        throw new error_middleware_1.NotFoundError('Categoría no encontrada');
    try {
        await database_1.default.categoria.delete({ where: { idCategoria: id } });
    }
    catch (e) {
        safePrismaDelete(e, 'la categoría');
    }
}
// ──────────────────────────────────────────────────────────────────────────────
// RITMO DE JUEGO
// ──────────────────────────────────────────────────────────────────────────────
async function getAllRitmos(activo, orden = 'minutos', direccion = 'asc') {
    const camposValidos = ['idRitmoJuego', 'nombre', 'minutos', 'incremento', 'fecha_creacion'];
    const orderBy = camposValidos.includes(orden)
        ? [{ [orden]: direccion }, { incremento: 'asc' }]
        : [{ minutos: direccion }, { incremento: 'asc' }];
    return database_1.default.ritmoJuego.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy,
    });
}
async function getRitmoById(id) {
    const r = await database_1.default.ritmoJuego.findUnique({ where: { idRitmoJuego: id } });
    if (!r)
        throw new error_middleware_1.NotFoundError('Ritmo de juego no encontrado');
    return r;
}
async function createRitmo(dto) {
    if (!dto.nombre?.trim())
        throw new error_middleware_1.ValidationError('El nombre es obligatorio');
    if (dto.minutos === undefined || dto.minutos < 0)
        throw new error_middleware_1.ValidationError('Los minutos deben ser un número mayor o igual a 0');
    if (dto.incremento !== undefined && dto.incremento < 0)
        throw new error_middleware_1.ValidationError('El incremento debe ser mayor o igual a 0');
    const dup = await database_1.default.ritmoJuego.findFirst({
        where: { nombre: { equals: dto.nombre.trim() } },
    });
    if (dup)
        throw new error_middleware_1.ConflictError('Ya existe un ritmo de juego con ese nombre');
    return database_1.default.ritmoJuego.create({
        data: {
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion?.trim() ?? null,
            minutos: dto.minutos,
            incremento: dto.incremento ?? 0,
            activo: dto.activo ?? true,
            fecha_creacion: new Date(),
        },
    });
}
async function updateRitmo(id, dto) {
    const ritmo = await database_1.default.ritmoJuego.findUnique({ where: { idRitmoJuego: id } });
    if (!ritmo)
        throw new error_middleware_1.NotFoundError('Ritmo de juego no encontrado');
    if (dto.nombre !== undefined) {
        if (!dto.nombre.trim())
            throw new error_middleware_1.ValidationError('El nombre no puede estar vacío');
        if (dto.nombre.trim().toLowerCase() !== ritmo.nombre.toLowerCase()) {
            const dup = await database_1.default.ritmoJuego.findFirst({
                where: { nombre: { equals: dto.nombre.trim() }, NOT: { idRitmoJuego: id } },
            });
            if (dup)
                throw new error_middleware_1.ConflictError('Ya existe un ritmo de juego con ese nombre');
        }
    }
    if (dto.minutos !== undefined && dto.minutos < 0)
        throw new error_middleware_1.ValidationError('Los minutos deben ser mayor o igual a 0');
    if (dto.incremento !== undefined && dto.incremento < 0)
        throw new error_middleware_1.ValidationError('El incremento debe ser mayor o igual a 0');
    return database_1.default.ritmoJuego.update({
        where: { idRitmoJuego: id },
        data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre.trim() }),
            ...(dto.descripcion !== undefined && { descripcion: dto.descripcion?.trim() ?? null }),
            ...(dto.minutos !== undefined && { minutos: dto.minutos }),
            ...(dto.incremento !== undefined && { incremento: dto.incremento }),
            ...(dto.activo !== undefined && { activo: dto.activo }),
        },
    });
}
async function deleteRitmo(id) {
    const r = await database_1.default.ritmoJuego.findUnique({ where: { idRitmoJuego: id } });
    if (!r)
        throw new error_middleware_1.NotFoundError('Ritmo de juego no encontrado');
    try {
        await database_1.default.ritmoJuego.delete({ where: { idRitmoJuego: id } });
    }
    catch (e) {
        safePrismaDelete(e, 'el ritmo de juego');
    }
}
// ──────────────────────────────────────────────────────────────────────────────
// SISTEMA DE COMPETENCIA
// ──────────────────────────────────────────────────────────────────────────────
async function getAllSistemasCompetencia(activo, orden = 'nombre', direccion = 'asc') {
    const camposValidos = ['idSisCompetencia', 'nombre', 'fecha_creacion'];
    const orderBy = camposValidos.includes(orden) ? { [orden]: direccion } : { nombre: direccion };
    return database_1.default.sistemaCompetencia.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy,
    });
}
async function getSistemaCompetenciaById(id) {
    const s = await database_1.default.sistemaCompetencia.findUnique({ where: { idSisCompetencia: id } });
    if (!s)
        throw new error_middleware_1.NotFoundError('Sistema de competencia no encontrado');
    return s;
}
async function createSistemaCompetencia(dto) {
    if (!dto.nombre?.trim())
        throw new error_middleware_1.ValidationError('El nombre es obligatorio');
    const dup = await database_1.default.sistemaCompetencia.findFirst({
        where: { nombre: { equals: dto.nombre.trim() } },
    });
    if (dup)
        throw new error_middleware_1.ConflictError('Ya existe un sistema de competencia con ese nombre');
    return database_1.default.sistemaCompetencia.create({
        data: {
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion?.trim() ?? null,
            activo: dto.activo ?? true,
            fecha_creacion: new Date(),
        },
    });
}
async function updateSistemaCompetencia(id, dto) {
    const sc = await database_1.default.sistemaCompetencia.findUnique({ where: { idSisCompetencia: id } });
    if (!sc)
        throw new error_middleware_1.NotFoundError('Sistema de competencia no encontrado');
    if (dto.nombre !== undefined) {
        if (!dto.nombre.trim())
            throw new error_middleware_1.ValidationError('El nombre no puede estar vacío');
        if (dto.nombre.trim().toLowerCase() !== sc.nombre.toLowerCase()) {
            const dup = await database_1.default.sistemaCompetencia.findFirst({
                where: { nombre: { equals: dto.nombre.trim() }, NOT: { idSisCompetencia: id } },
            });
            if (dup)
                throw new error_middleware_1.ConflictError('Ya existe un sistema de competencia con ese nombre');
        }
    }
    return database_1.default.sistemaCompetencia.update({
        where: { idSisCompetencia: id },
        data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre.trim() }),
            ...(dto.descripcion !== undefined && { descripcion: dto.descripcion?.trim() ?? null }),
            ...(dto.activo !== undefined && { activo: dto.activo }),
        },
    });
}
async function deleteSistemaCompetencia(id) {
    const s = await database_1.default.sistemaCompetencia.findUnique({ where: { idSisCompetencia: id } });
    if (!s)
        throw new error_middleware_1.NotFoundError('Sistema de competencia no encontrado');
    try {
        await database_1.default.sistemaCompetencia.delete({ where: { idSisCompetencia: id } });
    }
    catch (e) {
        safePrismaDelete(e, 'el sistema de competencia');
    }
}
// ──────────────────────────────────────────────────────────────────────────────
// SISTEMA DE DESEMPATE
// ──────────────────────────────────────────────────────────────────────────────
async function getAllSistemasDesempate(activo, orden = 'nombre', direccion = 'asc') {
    const camposValidos = ['idDesempate', 'nombre', 'fecha_creacion'];
    const orderBy = camposValidos.includes(orden) ? { [orden]: direccion } : { nombre: direccion };
    return database_1.default.sistemaDesempate.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy,
    });
}
async function getSistemaDesempateById(id) {
    const s = await database_1.default.sistemaDesempate.findUnique({ where: { idDesempate: id } });
    if (!s)
        throw new error_middleware_1.NotFoundError('Sistema de desempate no encontrado');
    return s;
}
async function createSistemaDesempate(dto) {
    if (!dto.nombre?.trim())
        throw new error_middleware_1.ValidationError('El nombre es obligatorio');
    const dup = await database_1.default.sistemaDesempate.findFirst({
        where: { nombre: { equals: dto.nombre.trim() } },
    });
    if (dup)
        throw new error_middleware_1.ConflictError('Ya existe un sistema de desempate con ese nombre');
    return database_1.default.sistemaDesempate.create({
        data: {
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion?.trim() ?? null,
            activo: dto.activo ?? true,
            fecha_creacion: new Date(),
        },
    });
}
async function updateSistemaDesempate(id, dto) {
    const sd = await database_1.default.sistemaDesempate.findUnique({ where: { idDesempate: id } });
    if (!sd)
        throw new error_middleware_1.NotFoundError('Sistema de desempate no encontrado');
    if (dto.nombre !== undefined) {
        if (!dto.nombre.trim())
            throw new error_middleware_1.ValidationError('El nombre no puede estar vacío');
        if (dto.nombre.trim().toLowerCase() !== sd.nombre.toLowerCase()) {
            const dup = await database_1.default.sistemaDesempate.findFirst({
                where: { nombre: { equals: dto.nombre.trim() }, NOT: { idDesempate: id } },
            });
            if (dup)
                throw new error_middleware_1.ConflictError('Ya existe un sistema de desempate con ese nombre');
        }
    }
    return database_1.default.sistemaDesempate.update({
        where: { idDesempate: id },
        data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre.trim() }),
            ...(dto.descripcion !== undefined && { descripcion: dto.descripcion?.trim() ?? null }),
            ...(dto.activo !== undefined && { activo: dto.activo }),
        },
    });
}
async function deleteSistemaDesempate(id) {
    const s = await database_1.default.sistemaDesempate.findUnique({ where: { idDesempate: id } });
    if (!s)
        throw new error_middleware_1.NotFoundError('Sistema de desempate no encontrado');
    try {
        await database_1.default.sistemaDesempate.delete({ where: { idDesempate: id } });
    }
    catch (e) {
        safePrismaDelete(e, 'el sistema de desempate');
    }
}
// ──────────────────────────────────────────────────────────────────────────────
// SISTEMA DE PAGO
// ──────────────────────────────────────────────────────────────────────────────
async function getAllSistemasPago(activo) {
    return database_1.default.sistemaPago.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy: { fecha_registro: 'desc' },
    });
}
async function getSistemasPagoActivos() {
    return database_1.default.sistemaPago.findMany({ where: { activo: true }, orderBy: { banco: 'asc' } });
}
async function getSistemaPagoById(id) {
    const sp = await database_1.default.sistemaPago.findUnique({ where: { idSistemaPago: id } });
    if (!sp)
        throw new error_middleware_1.NotFoundError('Sistema de pago no encontrado');
    return sp;
}
async function createSistemaPago(dto) {
    const { nombreCuenta, banco, numeroCuenta, clabe, telefono } = dto;
    if (!nombreCuenta || !banco || !numeroCuenta || !clabe || !telefono)
        throw new error_middleware_1.ValidationError('Todos los campos son obligatorios');
    if (!CLABE_REGEX.test(clabe))
        throw new error_middleware_1.ValidationError('La CLABE debe contener exactamente 18 dígitos numéricos');
    return database_1.default.sistemaPago.create({
        data: {
            nombreCuenta: nombreCuenta.trim(),
            banco: banco.trim(),
            numeroCuenta: numeroCuenta.trim(),
            clabe: clabe.trim(),
            telefono: telefono.trim(),
            activo: true,
            fecha_registro: new Date(),
            actualizacion: new Date(),
        },
    });
}
async function updateSistemaPago(id, dto) {
    const sp = await database_1.default.sistemaPago.findUnique({ where: { idSistemaPago: id } });
    if (!sp)
        throw new error_middleware_1.NotFoundError('Sistema de pago no encontrado');
    if (dto.clabe !== undefined && !CLABE_REGEX.test(dto.clabe))
        throw new error_middleware_1.ValidationError('La CLABE debe contener exactamente 18 dígitos numéricos');
    return database_1.default.sistemaPago.update({
        where: { idSistemaPago: id },
        data: {
            ...(dto.nombreCuenta !== undefined && { nombreCuenta: dto.nombreCuenta.trim() }),
            ...(dto.banco !== undefined && { banco: dto.banco.trim() }),
            ...(dto.numeroCuenta !== undefined && { numeroCuenta: dto.numeroCuenta.trim() }),
            ...(dto.clabe !== undefined && { clabe: dto.clabe.trim() }),
            ...(dto.telefono !== undefined && { telefono: dto.telefono.trim() }),
            ...(dto.activo !== undefined && { activo: dto.activo }),
            actualizacion: new Date(),
        },
    });
}
async function deleteSistemaPago(id) {
    const sp = await database_1.default.sistemaPago.findUnique({ where: { idSistemaPago: id } });
    if (!sp)
        throw new error_middleware_1.NotFoundError('Sistema de pago no encontrado');
    try {
        await database_1.default.sistemaPago.delete({ where: { idSistemaPago: id } });
    }
    catch (e) {
        safePrismaDelete(e, 'el sistema de pago');
    }
}
async function toggleActiveSistemaPago(id, activo) {
    const sp = await database_1.default.sistemaPago.findUnique({ where: { idSistemaPago: id } });
    if (!sp)
        throw new error_middleware_1.NotFoundError('Sistema de pago no encontrado');
    const nuevoEstado = activo !== undefined ? activo : !sp.activo;
    return database_1.default.sistemaPago.update({
        where: { idSistemaPago: id },
        data: { activo: nuevoEstado, actualizacion: new Date() },
    });
}
//# sourceMappingURL=catalogo.service.js.map