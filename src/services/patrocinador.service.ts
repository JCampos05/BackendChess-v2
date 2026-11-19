import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../middleware/error.middleware';

export interface CreatePatrocinadorDto {
    nombre: string;
    logo_url?: string | null;
    sitio_web?: string | null;
    descripcion?: string | null;
    contacto?: string | null;
    activo?: boolean;
}

export interface UpdatePatrocinadorDto extends Partial<CreatePatrocinadorDto> {}

// ── Listar ────────────────────────────────────────────────────

export const listar = async (activo?: boolean) => {
    return prisma.patrocinador.findMany({
        where: activo !== undefined ? { activo } : {},
        orderBy: { nombre: 'asc' },
        // Torneos a los que está asignado (para el formulario de administración)
        include: { torneos: { select: { idTorneo: true, nivel: true, orden: true } } },
    });
};

// ── Obtener por ID ────────────────────────────────────────────

export const obtenerPorId = async (idPatrocinador: number) => {
    const p = await prisma.patrocinador.findUnique({ where: { idPatrocinador } });
    if (!p) throw new NotFoundError('Patrocinador no encontrado');
    return p;
};

// ── Crear ────────────────────────────────────────────────────

export const crear = async (datos: CreatePatrocinadorDto) => {
    const existe = await prisma.patrocinador.findFirst({
        where: { nombre: datos.nombre },
        select: { idPatrocinador: true },
    });
    if (existe) throw new ConflictError('Ya existe un patrocinador con ese nombre');

    return prisma.patrocinador.create({
        data: {
            nombre: datos.nombre,
            logo_url: datos.logo_url ?? null,
            sitio_web: datos.sitio_web ?? null,
            descripcion: datos.descripcion ?? null,
            contacto: datos.contacto ?? null,
            activo: datos.activo ?? true,
        },
    });
};

// ── Actualizar ────────────────────────────────────────────────

export const actualizar = async (idPatrocinador: number, datos: UpdatePatrocinadorDto) => {
    await obtenerPorId(idPatrocinador);
    return prisma.patrocinador.update({
        where: { idPatrocinador },
        data: {
            ...(datos.nombre !== undefined && { nombre: datos.nombre }),
            ...(datos.logo_url !== undefined && { logo_url: datos.logo_url }),
            ...(datos.sitio_web !== undefined && { sitio_web: datos.sitio_web }),
            ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
            ...(datos.contacto !== undefined && { contacto: datos.contacto }),
            ...(datos.activo !== undefined && { activo: datos.activo }),
        },
    });
};

// ── Eliminar ──────────────────────────────────────────────────

export const eliminar = async (idPatrocinador: number) => {
    await obtenerPorId(idPatrocinador);
    try {
        await prisma.patrocinador.delete({ where: { idPatrocinador } });
    } catch (e: any) {
        if (e?.code === 'P2003')
            throw new ConflictError('No se puede eliminar el patrocinador porque está asignado a torneos');
        throw e;
    }
};

// ── Toggle activo ─────────────────────────────────────────────

export const toggleActivo = async (idPatrocinador: number) => {
    const p = await obtenerPorId(idPatrocinador);
    return prisma.patrocinador.update({
        where: { idPatrocinador },
        data: { activo: !p.activo },
    });
};


// ── Asignar torneos ───────────────────────────────────────────

export interface AsignacionTorneoDto {
    idTorneo: number;
    nivel?: 'principal' | 'oro' | 'plata' | 'bronce' | 'general';
    orden?: number;
}

/** Deja al patrocinador asignado exactamente a los torneos indicados (agrega, actualiza el nivel y quita el resto). */
export const asignarTorneos = async (idPatrocinador: number, torneos: AsignacionTorneoDto[]) => {
    await obtenerPorId(idPatrocinador);
    const ids = [...new Set(torneos.map(t => t.idTorneo))];
    const existentes = await prisma.torneo.findMany({ where: { idTorneo: { in: ids } }, select: { idTorneo: true } });
    if (existentes.length !== ids.length) throw new NotFoundError('Alguno de los torneos no existe');

    await prisma.$transaction([
        prisma.torneoPatrocinador.deleteMany({ where: { idPatrocinador, idTorneo: { notIn: ids } } }),
        ...torneos.map(t => prisma.torneoPatrocinador.upsert({
            where: { idTorneo_idPatrocinador: { idTorneo: t.idTorneo, idPatrocinador } },
            create: { idTorneo: t.idTorneo, idPatrocinador, nivel: t.nivel ?? 'general', orden: t.orden ?? 0 },
            update: { nivel: t.nivel ?? 'general', ...(t.orden !== undefined && { orden: t.orden }) },
        })),
    ]);

    return prisma.torneoPatrocinador.findMany({
        where: { idPatrocinador },
        select: { idTorneo: true, nivel: true, orden: true },
    });
};
