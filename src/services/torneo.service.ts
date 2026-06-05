import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../middleware/error.middleware';
import {
    CrearTorneoDto,
    ActualizarTorneoDto,
    CambiarEstadoDto,
    FiltrosTorneoDto,
    AsignarCategoriaDto,
    ActualizarCategoriaDto,
    AsignarPatrocinadorDto,
    AsignarAdminDto,
} from '../validations/torneo.validation';
import { PaginatedResult } from '../types';

// ── Includes reutilizables ───────────────────────────────────

const INCLUDE_BASE = {
    zona_horaria:      { select: { nombreZona: true, nombreMostrar: true } },
    sistema_pago:      { select: { idSistemaPago: true, nombreCuenta: true, banco: true } },
    torneo_categorias: {
        where:  { activo: true },
        select: {
            idTorneoCat:          true,
            rondas:               true,
            ritmo_juego:          true,
            sistema_competencia:  true,
            premios:              true,
            cupo_maximo:          true,
            cierre_inscripciones: true,
            categoria: { select: { idCategoria: true, nombre: true, costo: true } },
        },
    },
} satisfies Prisma.TorneoInclude;

const INCLUDE_DETALLE = {
    ...INCLUDE_BASE,
    // 'patrocinadores' en el modelo Torneo se llama 'patrocinadores'
    // (campo definido en schema como: patrocinadores TorneoPatrocinador[])
    patrocinadores: {
        orderBy: { orden: 'asc' as const },
        select: {
            nivel:  true,
            orden:  true,
            patrocinador: {
                select: {
                    idPatrocinador: true,
                    nombre:         true,
                    logo_url:       true,
                    sitio_web:      true,
                    descripcion:    true,
                    contacto:       true,
                },
            },
        },
    },
    admins_asignados: {
        where:  { activo: true },
        select: {
            idUsuarioTorneo: true,
            notas:           true,
            usuario: { select: { idUsuario: true, telefono: true, rol: true } },
        },
    },
} satisfies Prisma.TorneoInclude;

// ── CRUD ─────────────────────────────────────────────────────

export const listarTorneos = async (
    filtros: FiltrosTorneoDto
): Promise<PaginatedResult<unknown>> => {
    const { pagina, limite, activo, estado, es_actual, soloConCategorias } = filtros;
    const skip = (pagina - 1) * limite;

    const where: Prisma.TorneoWhereInput = {
        ...(activo    !== undefined && { activo }),
        ...(estado                  && { estado }),
        ...(es_actual !== undefined && { es_actual }),
        ...(soloConCategorias       && { torneo_categorias: { some: { activo: true } } }),
    };

    const [total, items] = await Promise.all([
        prisma.torneo.count({ where }),
        prisma.torneo.findMany({
            where,
            skip,
            take:    limite,
            orderBy: [{ es_actual: 'desc' }, { fecha: 'desc' }],
            include: INCLUDE_BASE,
        }),
    ]);

    return { items, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

export const obtenerTorneoPorId = async (idTorneo: number) => {
    const torneo = await prisma.torneo.findUnique({
        where:   { idTorneo },
        include: INCLUDE_DETALLE,
    });
    if (!torneo) throw new NotFoundError('Torneo no encontrado');
    return torneo;
};

// crearTorneo recibe solo datos — el controller ya no pasa idUsuario
export const crearTorneo = async (datos: CrearTorneoDto) => {
    return prisma.torneo.create({
        data: {
            nombre:               datos.nombre,
            lugar:                datos.lugar,
            direccion:            datos.direccion,
            url_maps:             datos.url_maps,
            fecha:                new Date(`${datos.fecha}T00:00:00`),
            hora:                 new Date(`1970-01-01T${datos.hora}:00`),
            rondas:               datos.rondas,
            cupo_maximo:          datos.cupo_maximo ?? null,
            notas:                datos.notas,
            cierre_inscripciones: datos.cierre_inscripciones
                ? new Date(datos.cierre_inscripciones)
                : undefined,
            idZonaHoraria:        datos.idZonaHoraria,
            idSistemaPago:        datos.idSistemaPago,
            es_actual:            datos.es_actual ?? true,
            estado:               'borrador',
            activo:               true,
            fecha_creacion:       new Date(),
            fecha_actualizacion:  new Date(),
        },
        include: INCLUDE_DETALLE,
    });
};

export const actualizarTorneo = async (
    idTorneo: number,
    datos: ActualizarTorneoDto
) => {
    await _verificarExiste(idTorneo);

    return prisma.torneo.update({
        where: { idTorneo },
        data:  {
            ...(datos.nombre    !== undefined && { nombre:    datos.nombre }),
            ...(datos.lugar     !== undefined && { lugar:     datos.lugar }),
            ...(datos.direccion !== undefined && { direccion: datos.direccion }),
            ...(datos.url_maps  !== undefined && { url_maps:  datos.url_maps }),
            ...(datos.fecha     !== undefined && { fecha: new Date(`${datos.fecha}T00:00:00`) }),
            ...(datos.hora      !== undefined && { hora:  new Date(`1970-01-01T${datos.hora}:00`) }),
            ...(datos.rondas       !== undefined && { rondas:       datos.rondas }),
            ...(datos.cupo_maximo  !== undefined && { cupo_maximo:  datos.cupo_maximo }),
            ...(datos.notas        !== undefined && { notas:        datos.notas }),
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

export const eliminarTorneo = async (idTorneo: number) => {
    const torneo = await _verificarExiste(idTorneo);
    if (torneo.estado !== 'borrador')
        throw new ForbiddenError('Solo se pueden eliminar torneos en estado borrador');
    await prisma.torneo.delete({ where: { idTorneo } });
    return { eliminado: true };
};

// ── Estado ───────────────────────────────────────────────────

const TRANSICIONES: Record<string, string[]> = {
    borrador:   ['publicado', 'cancelado'],
    publicado:  ['en_curso',  'cancelado'],
    en_curso:   ['finalizado','cancelado'],
    finalizado: [],
    cancelado:  [],
};

export const cambiarEstado = async (idTorneo: number, datos: CambiarEstadoDto) => {
    const torneo     = await _verificarExiste(idTorneo);
    const permitidos = TRANSICIONES[torneo.estado] ?? [];

    if (!permitidos.includes(datos.estado)) {
        throw new ForbiddenError(
            `No se puede pasar de '${torneo.estado}' a '${datos.estado}'. ` +
            `Transiciones válidas: [${permitidos.join(', ') || 'ninguna'}]`
        );
    }

    return prisma.torneo.update({
        where: { idTorneo },
        data:  {
            estado:              datos.estado,
            ...(datos.notas && { notas: datos.notas }),
            fecha_actualizacion: new Date(),
        },
        include: INCLUDE_BASE,
    });
};

export const toggleActivo = async (idTorneo: number, activo: boolean) => {
    await _verificarExiste(idTorneo);
    return prisma.torneo.update({
        where:  { idTorneo },
        data:   { activo, fecha_actualizacion: new Date() },
        select: { idTorneo: true, activo: true, es_actual: true },
    });
};

export const toggleEsActual = async (idTorneo: number, es_actual: boolean) => {
    const torneo = await _verificarExiste(idTorneo);
    if (es_actual && !torneo.activo)
        throw new ForbiddenError('Un torneo debe estar activo para ser marcado como actual');

    return prisma.torneo.update({
        where:  { idTorneo },
        data:   { es_actual, fecha_actualizacion: new Date() },
        select: { idTorneo: true, activo: true, es_actual: true },
    });
};

// ── Categorías ───────────────────────────────────────────────

export const asignarCategoria = async (
    idTorneo: number,
    datos: AsignarCategoriaDto
) => {
    const [torneo, categoria] = await Promise.all([
        prisma.torneo.findUnique({
            where:  { idTorneo },
            select: { idTorneo: true },
        }),
        prisma.categoria.findUnique({
            where:  { idCategoria: datos.idCategoria },
            select: { idCategoria: true, nombre: true },
        }),
    ]);
    if (!torneo)    throw new NotFoundError('Torneo no encontrado');
    if (!categoria) throw new NotFoundError('Categoría no encontrada');

    // El modelo se llama 'torneoCategoria' en el cliente Prisma
    return prisma.torneoCategoria.upsert({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria: datos.idCategoria } },
        create: {
            idTorneo,
            idCategoria:         datos.idCategoria,
            rondas:              datos.rondas ?? 5,
            ritmo_juego:         datos.ritmo_juego,
            sistema_competencia: datos.sistema_competencia,
            premios:             (datos.premios    ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            desempates:          (datos.desempates ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            calendario:          (datos.calendario ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            activo:              true,
        },
        update: {
            rondas:              datos.rondas,
            ritmo_juego:         datos.ritmo_juego,
            sistema_competencia: datos.sistema_competencia,
            premios:             (datos.premios    ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            desempates:          (datos.desempates ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            calendario:          (datos.calendario ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            activo:              true,
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true, costo: true } },
        },
    });
};

export const actualizarCategoriaTorneo = async (
    idTorneo: number,
    idCategoria: number,
    datos: ActualizarCategoriaDto
) => {
    const tc = await prisma.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (!tc) throw new NotFoundError('La categoría no está asignada a este torneo');

    return prisma.torneoCategoria.update({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
        data:  {
            ...(datos.rondas              !== undefined && { rondas:              datos.rondas }),
            ...(datos.ritmo_juego         !== undefined && { ritmo_juego:         datos.ritmo_juego }),
            ...(datos.sistema_competencia !== undefined && { sistema_competencia: datos.sistema_competencia }),
            ...(datos.premios    !== undefined && { premios:    datos.premios    as Prisma.InputJsonValue }),
            ...(datos.desempates !== undefined && { desempates: datos.desempates as Prisma.InputJsonValue }),
            ...(datos.calendario !== undefined && { calendario: datos.calendario as Prisma.InputJsonValue }),
        },
        include: {
            categoria: { select: { idCategoria: true, nombre: true } },
        },
    });
};

export const desasignarCategoria = async (idTorneo: number, idCategoria: number) => {
    const tc = await prisma.torneoCategoria.findUnique({
        where: { idTorneo_idCategoria: { idTorneo, idCategoria } },
    });
    if (!tc) throw new NotFoundError('La categoría no está asignada a este torneo');

    return prisma.torneoCategoria.update({
        where:  { idTorneo_idCategoria: { idTorneo, idCategoria } },
        data:   { activo: false },
        select: { idTorneoCat: true, activo: true },
    });
};

// ── Patrocinadores ───────────────────────────────────────────

export const listarPatrocinadoresTorneo = async (idTorneo: number) => {
    await _verificarExiste(idTorneo);
    // Modelo: torneoPatrocinador
    return prisma.torneoPatrocinador.findMany({
        where:   { idTorneo },
        orderBy: { orden: 'asc' },
        select: {
            nivel:  true,
            orden:  true,
            patrocinador: {
                select: {
                    idPatrocinador: true,
                    nombre:         true,
                    logo_url:       true,
                    sitio_web:      true,
                    descripcion:    true,
                    contacto:       true,
                },
            },
        },
    });
};

export const asignarPatrocinador = async (
    idTorneo: number,
    datos: AsignarPatrocinadorDto
) => {
    const [torneo, patrocinador] = await Promise.all([
        prisma.torneo.findUnique({
            where:  { idTorneo },
            select: { idTorneo: true },
        }),
        // Modelo: patrocinador
        prisma.patrocinador.findUnique({
            where:  { idPatrocinador: datos.idPatrocinador },
            select: { idPatrocinador: true, nombre: true },
        }),
    ]);
    if (!torneo)       throw new NotFoundError('Torneo no encontrado');
    if (!patrocinador) throw new NotFoundError('Patrocinador no encontrado');

    return prisma.torneoPatrocinador.upsert({
        where: {
            idTorneo_idPatrocinador: { idTorneo, idPatrocinador: datos.idPatrocinador },
        },
        create: {
            idTorneo,
            idPatrocinador: datos.idPatrocinador,
            nivel:          datos.nivel,
            orden:          datos.orden,
        },
        update: {
            nivel:  datos.nivel,
            orden:  datos.orden,
        },
        select: {
            nivel:  true,
            orden:  true,
            patrocinador: { select: { idPatrocinador: true, nombre: true } },
        },
    });
};

export const removerPatrocinador = async (idTorneo: number, idPatrocinador: number) => {
    const tp = await prisma.torneoPatrocinador.findUnique({
        where: { idTorneo_idPatrocinador: { idTorneo, idPatrocinador } },
    });
    if (!tp) throw new NotFoundError('El patrocinador no está asignado a este torneo');

    await prisma.torneoPatrocinador.delete({
        where: { idTorneo_idPatrocinador: { idTorneo, idPatrocinador } },
    });
    return { eliminado: true };
};

// ── Admins ───────────────────────────────────────────────────

export const asignarAdmin = async (idTorneo: number, datos: AsignarAdminDto) => {
    const [torneo, usuario] = await Promise.all([
        prisma.torneo.findUnique({
            where:  { idTorneo },
            select: { idTorneo: true },
        }),
        prisma.usuario.findUnique({
            where:  { idUsuario: datos.idUsuario },
            select: { idUsuario: true, rol: true, activo: true },
        }),
    ]);
    if (!torneo)   throw new NotFoundError('Torneo no encontrado');
    if (!usuario)  throw new NotFoundError('Usuario no encontrado');
    if (!usuario.activo) throw new ForbiddenError('El usuario está inactivo');
    if (usuario.rol !== 'adminTorneo')
        throw new ForbiddenError('Solo se pueden asignar usuarios con rol adminTorneo');

    // Modelo: usuarioTorneo
    return prisma.usuarioTorneo.upsert({
        where: { idUsuario_idTorneo: { idUsuario: datos.idUsuario, idTorneo } },
        create: { idUsuario: datos.idUsuario, idTorneo, notas: datos.notas, activo: true },
        update: { notas: datos.notas, activo: true },
        include: {
            usuario: { select: { idUsuario: true, telefono: true, rol: true } },
        },
    });
};

export const removerAdmin = async (idTorneo: number, idUsuario: number) => {
    const ut = await prisma.usuarioTorneo.findUnique({
        where: { idUsuario_idTorneo: { idUsuario, idTorneo } },
    });
    if (!ut) throw new NotFoundError('El usuario no está asignado a este torneo');

    return prisma.usuarioTorneo.update({
        where:  { idUsuario_idTorneo: { idUsuario, idTorneo } },
        data:   { activo: false },
        select: { idUsuarioTorneo: true, activo: true },
    });
};

// ── Helper privado ───────────────────────────────────────────

const _verificarExiste = async (idTorneo: number) => {
    const t = await prisma.torneo.findUnique({
        where:  { idTorneo },
        select: { idTorneo: true, estado: true, activo: true, es_actual: true },
    });
    if (!t) throw new NotFoundError('Torneo no encontrado');
    return t;
};