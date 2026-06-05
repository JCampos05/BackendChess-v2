// ============================================================
// Categoria · RitmoJuego · SistemaCompetencia · SistemaDesempate · SistemaPago
// ============================================================
import prisma from '../config/database';
import {
    AppError,
    NotFoundError,
    ConflictError,
    ValidationError,
} from '../middleware/error.middleware';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface CreateCategoriaDto {
    nombre: string;
    costo: number;
    nota?: string | null;
    edadMinima?: number | null;
    edadMaxima?: number | null;
}
export interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> { }

export interface CreateRitmoJuegoDto {
    nombre: string;
    descripcion?: string | null;
    minutos: number;
    incremento?: number;
    activo?: boolean;
}
export interface UpdateRitmoJuegoDto extends Partial<CreateRitmoJuegoDto> { }

export interface CreateSistemaDto {
    nombre: string;
    descripcion?: string | null;
    activo?: boolean;
}
export interface UpdateSistemaDto extends Partial<CreateSistemaDto> { }

export interface CreateSistemaPagoDto {
    nombreCuenta: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
    telefono: string;
}
export interface UpdateSistemaPagoDto extends Partial<CreateSistemaPagoDto> {
    activo?: boolean;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CLABE_REGEX = /^\d{18}$/;

function validarEdades(edadMinima?: number | null, edadMaxima?: number | null) {
    if (edadMinima != null && (edadMinima < 0 || edadMinima > 120))
        throw new ValidationError('La edad mínima debe ser un número entre 0 y 120');
    if (edadMaxima != null && (edadMaxima < 0 || edadMaxima > 120))
        throw new ValidationError('La edad máxima debe ser un número entre 0 y 120');
    if (edadMinima != null && edadMaxima != null && edadMinima > edadMaxima)
        throw new ValidationError('La edad mínima no puede ser mayor que la edad máxima');
}

function safePrismaDelete(e: unknown, entidad: string): never {
    if ((e as { code?: string }).code === 'P2003')
        throw new ConflictError(`No se puede eliminar ${entidad} porque está siendo utilizado/a`);
    throw e;
}

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORÍA
// ──────────────────────────────────────────────────────────────────────────────

export async function getAllCategorias(
    orden = 'nombre',
    direccion: 'asc' | 'desc' = 'asc',
) {
    const camposValidos = ['idCategoria', 'nombre', 'costo', 'edadMinima', 'edadMaxima'];
    const orderBy = camposValidos.includes(orden)
        ? { [orden]: direccion }
        : { nombre: direccion };
    return prisma.categoria.findMany({ orderBy });
}

export async function getCategoriaById(id: number) {
    const cat = await prisma.categoria.findUnique({ where: { idCategoria: id } });
    if (!cat) throw new NotFoundError('Categoría no encontrada');
    return cat;
}

export async function createCategoria(dto: CreateCategoriaDto) {
    if (!dto.nombre?.trim()) throw new ValidationError('El nombre es obligatorio');
    if (dto.costo < 0) throw new ValidationError('El costo debe ser mayor o igual a 0');
    validarEdades(dto.edadMinima, dto.edadMaxima);

    const dup = await prisma.categoria.findFirst({
        where: { nombre: { equals: dto.nombre.trim() } },
    });
    if (dup) throw new ConflictError('Ya existe una categoría con ese nombre');

    return prisma.categoria.create({
        data: {
            nombre: dto.nombre.trim(),
            costo: dto.costo,
            nota: dto.nota?.trim() ?? null,
            edadMinima: dto.edadMinima ?? null,
            edadMaxima: dto.edadMaxima ?? null,
        },
    });
}

export async function updateCategoria(id: number, dto: UpdateCategoriaDto) {
    const cat = await prisma.categoria.findUnique({ where: { idCategoria: id } });
    if (!cat) throw new NotFoundError('Categoría no encontrada');

    if (dto.nombre !== undefined) {
        if (!dto.nombre.trim()) throw new ValidationError('El nombre no puede estar vacío');
        if (dto.nombre.trim().toLowerCase() !== cat.nombre.toLowerCase()) {
            const dup = await prisma.categoria.findFirst({
                where: { nombre: { equals: dto.nombre.trim() }, NOT: { idCategoria: id } },
            });
            if (dup) throw new ConflictError('Ya existe una categoría con ese nombre');
        }
    }
    if (dto.costo !== undefined && dto.costo < 0)
        throw new ValidationError('El costo debe ser mayor o igual a 0');

    const edadMin = dto.edadMinima !== undefined ? dto.edadMinima : cat.edadMinima;
    const edadMax = dto.edadMaxima !== undefined ? dto.edadMaxima : cat.edadMaxima;
    validarEdades(edadMin, edadMax);

    return prisma.categoria.update({
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

export async function deleteCategoria(id: number) {
    const cat = await prisma.categoria.findUnique({ where: { idCategoria: id } });
    if (!cat) throw new NotFoundError('Categoría no encontrada');
    try {
        await prisma.categoria.delete({ where: { idCategoria: id } });
    } catch (e) {
        safePrismaDelete(e, 'la categoría');
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// RITMO DE JUEGO
// ──────────────────────────────────────────────────────────────────────────────

export async function getAllRitmos(
    activo?: boolean,
    orden = 'minutos',
    direccion: 'asc' | 'desc' = 'asc',
) {
    const camposValidos = ['idRitmoJuego', 'nombre', 'minutos', 'incremento', 'fecha_creacion'];
    const orderBy: object[] = camposValidos.includes(orden)
        ? [{ [orden]: direccion }, { incremento: 'asc' }]
        : [{ minutos: direccion }, { incremento: 'asc' }];
    return prisma.ritmoJuego.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy,
    });
}

export async function getRitmoById(id: number) {
    const r = await prisma.ritmoJuego.findUnique({ where: { idRitmoJuego: id } });
    if (!r) throw new NotFoundError('Ritmo de juego no encontrado');
    return r;
}

export async function createRitmo(dto: CreateRitmoJuegoDto) {
    if (!dto.nombre?.trim()) throw new ValidationError('El nombre es obligatorio');
    if (dto.minutos === undefined || dto.minutos < 0)
        throw new ValidationError('Los minutos deben ser un número mayor o igual a 0');
    if (dto.incremento !== undefined && dto.incremento < 0)
        throw new ValidationError('El incremento debe ser mayor o igual a 0');

    const dup = await prisma.ritmoJuego.findFirst({
        where: { nombre: { equals: dto.nombre.trim() } },
    });
    if (dup) throw new ConflictError('Ya existe un ritmo de juego con ese nombre');

    return prisma.ritmoJuego.create({
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

export async function updateRitmo(id: number, dto: UpdateRitmoJuegoDto) {
    const ritmo = await prisma.ritmoJuego.findUnique({ where: { idRitmoJuego: id } });
    if (!ritmo) throw new NotFoundError('Ritmo de juego no encontrado');

    if (dto.nombre !== undefined) {
        if (!dto.nombre.trim()) throw new ValidationError('El nombre no puede estar vacío');
        if (dto.nombre.trim().toLowerCase() !== ritmo.nombre.toLowerCase()) {
            const dup = await prisma.ritmoJuego.findFirst({
                where: { nombre: { equals: dto.nombre.trim() }, NOT: { idRitmoJuego: id } },
            });
            if (dup) throw new ConflictError('Ya existe un ritmo de juego con ese nombre');
        }
    }
    if (dto.minutos !== undefined && dto.minutos < 0)
        throw new ValidationError('Los minutos deben ser mayor o igual a 0');
    if (dto.incremento !== undefined && dto.incremento < 0)
        throw new ValidationError('El incremento debe ser mayor o igual a 0');

    return prisma.ritmoJuego.update({
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

export async function deleteRitmo(id: number) {
    const r = await prisma.ritmoJuego.findUnique({ where: { idRitmoJuego: id } });
    if (!r) throw new NotFoundError('Ritmo de juego no encontrado');
    try {
        await prisma.ritmoJuego.delete({ where: { idRitmoJuego: id } });
    } catch (e) {
        safePrismaDelete(e, 'el ritmo de juego');
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// SISTEMA DE COMPETENCIA
// ──────────────────────────────────────────────────────────────────────────────

export async function getAllSistemasCompetencia(
    activo?: boolean,
    orden = 'nombre',
    direccion: 'asc' | 'desc' = 'asc',
) {
    const camposValidos = ['idSisCompetencia', 'nombre', 'fecha_creacion'];
    const orderBy = camposValidos.includes(orden) ? { [orden]: direccion } : { nombre: direccion };
    return prisma.sistemaCompetencia.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy,
    });
}

export async function getSistemaCompetenciaById(id: number) {
    const s = await prisma.sistemaCompetencia.findUnique({ where: { idSisCompetencia: id } });
    if (!s) throw new NotFoundError('Sistema de competencia no encontrado');
    return s;
}

export async function createSistemaCompetencia(dto: CreateSistemaDto) {
    if (!dto.nombre?.trim()) throw new ValidationError('El nombre es obligatorio');
    const dup = await prisma.sistemaCompetencia.findFirst({
        where: { nombre: { equals: dto.nombre.trim() } },
    });
    if (dup) throw new ConflictError('Ya existe un sistema de competencia con ese nombre');

    return prisma.sistemaCompetencia.create({
        data: {
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion?.trim() ?? null,
            activo: dto.activo ?? true,
            fecha_creacion: new Date(),
        },
    });
}

export async function updateSistemaCompetencia(id: number, dto: UpdateSistemaDto) {
    const sc = await prisma.sistemaCompetencia.findUnique({ where: { idSisCompetencia: id } });
    if (!sc) throw new NotFoundError('Sistema de competencia no encontrado');

    if (dto.nombre !== undefined) {
        if (!dto.nombre.trim()) throw new ValidationError('El nombre no puede estar vacío');
        if (dto.nombre.trim().toLowerCase() !== sc.nombre.toLowerCase()) {
            const dup = await prisma.sistemaCompetencia.findFirst({
                where: { nombre: { equals: dto.nombre.trim() }, NOT: { idSisCompetencia: id } },
            });
            if (dup) throw new ConflictError('Ya existe un sistema de competencia con ese nombre');
        }
    }
    return prisma.sistemaCompetencia.update({
        where: { idSisCompetencia: id },
        data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre.trim() }),
            ...(dto.descripcion !== undefined && { descripcion: dto.descripcion?.trim() ?? null }),
            ...(dto.activo !== undefined && { activo: dto.activo }),
        },
    });
}

export async function deleteSistemaCompetencia(id: number) {
    const s = await prisma.sistemaCompetencia.findUnique({ where: { idSisCompetencia: id } });
    if (!s) throw new NotFoundError('Sistema de competencia no encontrado');
    try {
        await prisma.sistemaCompetencia.delete({ where: { idSisCompetencia: id } });
    } catch (e) {
        safePrismaDelete(e, 'el sistema de competencia');
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// SISTEMA DE DESEMPATE
// ──────────────────────────────────────────────────────────────────────────────

export async function getAllSistemasDesempate(
    activo?: boolean,
    orden = 'nombre',
    direccion: 'asc' | 'desc' = 'asc',
) {
    const camposValidos = ['idDesempate', 'nombre', 'fecha_creacion'];
    const orderBy = camposValidos.includes(orden) ? { [orden]: direccion } : { nombre: direccion };
    return prisma.sistemaDesempate.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy,
    });
}

export async function getSistemaDesempateById(id: number) {
    const s = await prisma.sistemaDesempate.findUnique({ where: { idDesempate: id } });
    if (!s) throw new NotFoundError('Sistema de desempate no encontrado');
    return s;
}

export async function createSistemaDesempate(dto: CreateSistemaDto) {
    if (!dto.nombre?.trim()) throw new ValidationError('El nombre es obligatorio');
    const dup = await prisma.sistemaDesempate.findFirst({
        where: { nombre: { equals: dto.nombre.trim() } },
    });
    if (dup) throw new ConflictError('Ya existe un sistema de desempate con ese nombre');

    return prisma.sistemaDesempate.create({
        data: {
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion?.trim() ?? null,
            activo: dto.activo ?? true,
            fecha_creacion: new Date(),
        },
    });
}

export async function updateSistemaDesempate(id: number, dto: UpdateSistemaDto) {
    const sd = await prisma.sistemaDesempate.findUnique({ where: { idDesempate: id } });
    if (!sd) throw new NotFoundError('Sistema de desempate no encontrado');

    if (dto.nombre !== undefined) {
        if (!dto.nombre.trim()) throw new ValidationError('El nombre no puede estar vacío');
        if (dto.nombre.trim().toLowerCase() !== sd.nombre.toLowerCase()) {
            const dup = await prisma.sistemaDesempate.findFirst({
                where: { nombre: { equals: dto.nombre.trim() }, NOT: { idDesempate: id } },
            });
            if (dup) throw new ConflictError('Ya existe un sistema de desempate con ese nombre');
        }
    }
    return prisma.sistemaDesempate.update({
        where: { idDesempate: id },
        data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre.trim() }),
            ...(dto.descripcion !== undefined && { descripcion: dto.descripcion?.trim() ?? null }),
            ...(dto.activo !== undefined && { activo: dto.activo }),
        },
    });
}

export async function deleteSistemaDesempate(id: number) {
    const s = await prisma.sistemaDesempate.findUnique({ where: { idDesempate: id } });
    if (!s) throw new NotFoundError('Sistema de desempate no encontrado');
    try {
        await prisma.sistemaDesempate.delete({ where: { idDesempate: id } });
    } catch (e) {
        safePrismaDelete(e, 'el sistema de desempate');
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// SISTEMA DE PAGO
// ──────────────────────────────────────────────────────────────────────────────

export async function getAllSistemasPago(activo?: boolean) {
    return prisma.sistemaPago.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy: { fecha_registro: 'desc' },
    });
}

export async function getSistemasPagoActivos() {
    return prisma.sistemaPago.findMany({ where: { activo: true }, orderBy: { banco: 'asc' } });
}

export async function getSistemaPagoById(id: number) {
    const sp = await prisma.sistemaPago.findUnique({ where: { idSistemaPago: id } });
    if (!sp) throw new NotFoundError('Sistema de pago no encontrado');
    return sp;
}

export async function createSistemaPago(dto: CreateSistemaPagoDto) {
    const { nombreCuenta, banco, numeroCuenta, clabe, telefono } = dto;
    if (!nombreCuenta || !banco || !numeroCuenta || !clabe || !telefono)
        throw new ValidationError('Todos los campos son obligatorios');
    if (!CLABE_REGEX.test(clabe))
        throw new ValidationError('La CLABE debe contener exactamente 18 dígitos numéricos');

    return prisma.sistemaPago.create({
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

export async function updateSistemaPago(id: number, dto: UpdateSistemaPagoDto) {
    const sp = await prisma.sistemaPago.findUnique({ where: { idSistemaPago: id } });
    if (!sp) throw new NotFoundError('Sistema de pago no encontrado');

    if (dto.clabe !== undefined && !CLABE_REGEX.test(dto.clabe))
        throw new ValidationError('La CLABE debe contener exactamente 18 dígitos numéricos');

    return prisma.sistemaPago.update({
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

export async function deleteSistemaPago(id: number) {
    const sp = await prisma.sistemaPago.findUnique({ where: { idSistemaPago: id } });
    if (!sp) throw new NotFoundError('Sistema de pago no encontrado');
    try {
        await prisma.sistemaPago.delete({ where: { idSistemaPago: id } });
    } catch (e) {
        safePrismaDelete(e, 'el sistema de pago');
    }
}

export async function toggleActiveSistemaPago(id: number, activo?: boolean) {
    const sp = await prisma.sistemaPago.findUnique({ where: { idSistemaPago: id } });
    if (!sp) throw new NotFoundError('Sistema de pago no encontrado');
    const nuevoEstado = activo !== undefined ? activo : !sp.activo;
    return prisma.sistemaPago.update({
        where: { idSistemaPago: id },
        data: { activo: nuevoEstado, actualizacion: new Date() },
    });
}