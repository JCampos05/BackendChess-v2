import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError } from '../middleware/error.middleware';
import { ActualizarConfigDto } from '../validations/config.validations';
import { invalidarCacheZona } from '../utils/fecha.utils';

// ── Obtener configuración ────────────────────────────────────
// Siempre existe un solo registro con idConfig = 1

export const obtenerConfig = async () => {
    const config = await prisma.configGral.findFirst({
        where:   { idConfig: 1 },
        include: { zona_horaria: true },
    });
    if (!config) throw new NotFoundError('Configuración del sistema no encontrada');
    return config;
};

// ── Actualizar configuración ─────────────────────────────────

export const actualizarConfig = async (datos: ActualizarConfigDto) => {
    const config = await prisma.configGral.findFirst({ where: { idConfig: 1 } });
    if (!config) throw new NotFoundError('Configuración del sistema no encontrada');

    const actualizada = await prisma.configGral.update({
        where: { idConfig: 1 },
        data:  {
            ...(datos.idZonaHoraria      !== undefined && { idZonaHoraria:      datos.idZonaHoraria }),
            ...(datos.facebook           !== undefined && { facebook:           datos.facebook }),
            ...(datos.instagram          !== undefined && { instagram:          datos.instagram }),
            ...(datos.twitter            !== undefined && { twitter:            datos.twitter }),
            ...(datos.youtube            !== undefined && { youtube:            datos.youtube }),
            ...(datos.whatsapp           !== undefined && { whatsapp:           datos.whatsapp }),
            ...(datos.nombreComite       !== undefined && { nombreComite:       datos.nombreComite }),
            ...(datos.descripcion        !== undefined && { descripcion:        datos.descripcion }),
            ...(datos.telefono           !== undefined && { telefono:           datos.telefono }),
            ...(datos.email              !== undefined && { email:              datos.email }),
            ...(datos.ciudad             !== undefined && { ciudad:             datos.ciudad }),
            ...(datos.estado             !== undefined && { estado:             datos.estado }),
            ...(datos.pais               !== undefined && { pais:               datos.pais }),
            ...(datos.diasAutoDesactivar !== undefined && { diasAutoDesactivar: datos.diasAutoDesactivar }),
            ...(datos.extras             !== undefined && { extras: datos.extras as Prisma.InputJsonValue }),
        },
        include: { zona_horaria: true },
    });

    // Si cambió la zona horaria, invalidar el cache del parser de fechas
    if (datos.idZonaHoraria !== undefined) {
        invalidarCacheZona();
    }

    return actualizada;
};

// ── Catálogos del sistema ────────────────────────────────────

export const listarZonasHorarias = async () => {
    return prisma.zonaHoraria.findMany({
        orderBy: { offsetUTC: 'asc' },
    });
};

export const listarCategorias = async (soloActivas = true) => {
    return prisma.categoria.findMany({
        orderBy: { nombre: 'asc' },
        select: {
            idCategoria:          true,
            nombre:               true,
            costo:                true,
            nota:                 true,
            edadMinima:           true,
            edadMaxima:           true,
            tipo_validacion_edad: true,
        },
    });
};

export const listarRitmosJuego = async () => {
    return prisma.ritmoJuego.findMany({
        where:   { activo: true },
        orderBy: { minutos: 'asc' },
    });
};

export const listarSistemasCompetencia = async () => {
    return prisma.sistemaCompetencia.findMany({
        where:   { activo: true },
        orderBy: { nombre: 'asc' },
    });
};

export const listarSistemasDesempate = async () => {
    return prisma.sistemaDesempate.findMany({
        where:   { activo: true },
        orderBy: { nombre: 'asc' },
    });
};

export const listarSistemasPago = async () => {
    return prisma.sistemaPago.findMany({
        where:   { activo: true },
        orderBy: { banco: 'asc' },
        select: {
            idSistemaPago: true,
            nombreCuenta:  true,
            banco:         true,
            clabe:         true,
            telefono:      true,
        },
    });
};

export const listarPatrocinadores = async () => {
    return prisma.patrocinador.findMany({
        where:   { activo: true },
        orderBy: { nombre: 'asc' },
        select: {
            idPatrocinador: true,
            nombre:         true,
            logo_url:       true,
            sitio_web:      true,
            descripcion:    true,
            contacto:       true,
        },
    });
};