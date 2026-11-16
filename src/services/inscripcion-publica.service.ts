import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../middleware/error.middleware';
import { tokenDeJugador, idDeToken } from '../utils/token-publico';
import { inscripcionesCerradas } from '../utils/fecha.utils';
import { inscribirEnTorneo, inscribirEnLiga, buscarJugadorSimilar, InscribirEnTorneoDto, InscribirEnLigaDto } from './inscripcion-admin.service';

// ── Categorías de un torneo, con cupo/cierre visibles para el público ──
// Ni el endpoint público de torneos ni el de admin exponían cupo_maximo
// a nivel categoría — es lo que permite a la UI mostrar "quedan N lugares"
// o deshabilitar una categoría llena/cerrada antes de intentar inscribirse.

export const listarCategoriasPublicas = async (idTorneo: number) => {
    const torneo = await prisma.torneo.findUnique({
        where: { idTorneo },
        select: { idTorneo: true, cierre_inscripciones: true, cupo_maximo: true },
    });
    if (!torneo) throw new NotFoundError('Torneo no encontrado');

    // Cupo del TORNEO completo (todas las categorías juntas) — antes solo se
    // consideraba el cupo por categoría, así que un torneo con cupo_maximo a
    // nivel torneo (sin límite por categoría) nunca mostraba "lleno" en el
    // formulario público, aunque el backend sí lo rechazara al inscribir.
    const inscritosTorneo = torneo.cupo_maximo
        ? await prisma.inscripcion.count({
            where: { idTorneo, estado: { not: 'cancelado' } },
        })
        : 0;
    const torneoLleno = torneo.cupo_maximo ? inscritosTorneo >= torneo.cupo_maximo : false;

    const categorias = await prisma.torneoCategoria.findMany({
        where: { idTorneo, activo: true },
        select: {
            idCategoria: true,
            rondas: true,
            cierre_inscripciones: true,
            cupo_maximo: true,
            categoria: {
                select: { idCategoria: true, nombre: true, costo: true, edadMinima: true, edadMaxima: true },
            },
        },
        orderBy: { idCategoria: 'asc' },
    });

    return Promise.all(categorias.map(async (tc) => {
        const cierreEfectivo = tc.cierre_inscripciones ?? torneo.cierre_inscripciones;
        const inscritos = tc.cupo_maximo
            ? await prisma.inscripcion.count({
                where: { idTorneo, idCategoria: tc.idCategoria, estado: { not: 'cancelado' } },
            })
            : 0;
        const categoriaLlena = tc.cupo_maximo ? inscritos >= tc.cupo_maximo : false;

        return {
            idCategoria:         tc.categoria.idCategoria,
            nombre:              tc.categoria.nombre,
            costo:               tc.categoria.costo,
            edadMinima:          tc.categoria.edadMinima,
            edadMaxima:          tc.categoria.edadMaxima,
            rondas:              tc.rondas,
            cierreInscripciones: cierreEfectivo,
            cupoMaximo:          tc.cupo_maximo,
            inscritos,
            cupoDisponible:      tc.cupo_maximo ? Math.max(tc.cupo_maximo - inscritos, 0) : null,
            cerrada:             await inscripcionesCerradas(cierreEfectivo),
            llena:               categoriaLlena || torneoLleno,
        };
    }));
};

// ── Búsqueda de jugador, sanitizada para uso público ──────────
// Reusa buscarJugadorSimilar (misma comparación por nombre/apellido que usa el
// registro manual de admin) pero solo devuelve lo necesario para que la persona
// se reconozca: nombre, un token opaco y su última participación. Nunca expone
// teléfono, fecha de nacimiento, ratings, estado, pagos ni ids numéricos.

type UltimaParticipacion = { tipo: 'torneo' | 'liga'; evento: string; detalle: string; fecha: Date | null } | null;

export const buscarJugadorPublico = async (q: string) => {
    const resultados = await buscarJugadorSimilar(q);
    return resultados.map(j => {
        const t = j.inscripciones[0];
        const l = j.jugadores_liga[0];
        let ultima: UltimaParticipacion = null;
        if (l && (!t || (l.fecha_inscripcion?.getTime() ?? 0) > (t.fecha_inscripcion?.getTime() ?? 0))) {
            ultima = { tipo: 'liga', evento: l.liga.nombre ?? '', detalle: l.grupo.nombre, fecha: l.liga.fecha_inicio };
        } else if (t) {
            ultima = { tipo: 'torneo', evento: t.torneo.nombre ?? '', detalle: t.categoria?.nombre ?? '', fecha: t.torneo.fecha };
        }
        return {
            token: tokenDeJugador(j.idJugador),
            nombre: j.nombre,
            apellido1: j.apellido1,
            apellido2: j.apellido2,
            ultima,
        };
    });
};

/** Convierte el token opaco que manda el formulario público en el id interno; token inválido = error 400. */
const idDesdeToken = (token?: string): number | undefined => {
    if (!token) return undefined;
    const id = idDeToken(token);
    if (!id) throw new ValidationError('La selección del jugador no es válida, vuelve a intentarlo');
    return id;
};

// ── Crear inscripción pública ─────────────────────────────────
// Reusa inscribirEnTorneo (cierre por categoría/torneo, cupo, duplicado
// exacto y por nombre, validación de edad) forzando que el pago NUNCA
// llegue confirmado desde un endpoint sin autenticación.

export type InscribirPublicoDto = Omit<InscribirEnTorneoDto, 'pago_confirmado' | 'monto_pagado' | 'rating_inicial'>;

export const inscribirPublico = async (datos: InscribirPublicoDto & { tokenJugador?: string }) => {
    const { tokenJugador, ...resto } = datos;
    const idJugador = idDesdeToken(tokenJugador);
    // Con un registro existente elegido, el formulario público NO modifica sus datos guardados
    // (teléfono, fecha de nacimiento): cualquier corrección la hace un administrador.
    if (idJugador) { delete resto.telefono; delete resto.fecha_nacimiento; }
    return inscribirEnTorneo({
        ...resto,
        idJugador,
        pago_confirmado: false,
        monto_pagado: 0,
    });
};

// ── Ligas públicas ────────────────────────────────────────────

/** Liga activa por slug, con cupo/cierre de la liga y de cada grupo para decidir en la UI antes de inscribirse. */
export const obtenerLigaPublicaPorSlug = async (slug: string) => {
    const liga = await prisma.infoLiga.findUnique({
        where: { slug },
        select: {
            idLiga: true, nombre: true, slug: true, descripcion: true,
            lugar: true, direccion: true, url_maps: true,
            fecha_inicio: true, fecha_fin: true, tipo_sistema: true,
            costo_inscripcion: true, cierre_inscripciones: true, max_jugadores: true,
            notas: true, activo: true,
            sistema_pago: { select: { nombreCuenta: true, banco: true, numeroCuenta: true, clabe: true, telefono: true } },
            ritmo_juego: { select: { nombre: true, minutos: true, incremento: true } },
            grupos: {
                where: { activo: true },
                orderBy: { nombre: 'asc' },
                select: { idGrupoLiga: true, nombre: true, descripcion: true, rondas: true, max_jugadores: true },
            },
        },
    });
    if (!liga || !liga.activo) throw new NotFoundError('Liga no encontrada');

    const inscritosPorGrupo = await prisma.jugadorLiga.groupBy({
        by: ['idGrupoLiga'],
        where: { idLiga: liga.idLiga, estado: { not: 'cancelado' } },
        _count: { _all: true },
    });
    const conteo = new Map(inscritosPorGrupo.map(g => [g.idGrupoLiga, g._count._all]));
    const inscritosLiga = [...conteo.values()].reduce((a, b) => a + b, 0);
    const ligaLlena = liga.max_jugadores ? inscritosLiga >= liga.max_jugadores : false;

    const { activo, ...datosLiga } = liga;
    return {
        ...datosLiga,
        inscritos: inscritosLiga,
        cupoDisponible: liga.max_jugadores ? Math.max(liga.max_jugadores - inscritosLiga, 0) : null,
        cerrada: await inscripcionesCerradas(liga.cierre_inscripciones),
        llena: ligaLlena,
        grupos: liga.grupos.map(g => {
            const inscritos = conteo.get(g.idGrupoLiga) ?? 0;
            return {
                ...g,
                inscritos,
                cupoDisponible: g.max_jugadores ? Math.max(g.max_jugadores - inscritos, 0) : null,
                llena: ligaLlena || (g.max_jugadores ? inscritos >= g.max_jugadores : false),
            };
        }),
    };
};

/** Inscripción pública a liga: reusa inscribirEnLiga (cierre, cupos, duplicado) y fuerza pago sin confirmar. */
export type InscribirPublicoLigaPayload = Omit<InscribirEnLigaDto, 'pago_confirmado' | 'monto_pagado' | 'rating_inicial' | 'numero_jugador' | 'posicion'>;

export const inscribirPublicoLiga = async (datos: InscribirPublicoLigaPayload & { tokenJugador?: string }) => {
    const { tokenJugador, ...resto } = datos;
    const idJugador = idDesdeToken(tokenJugador);
    // Con un registro existente elegido, el formulario público NO modifica sus datos guardados
    // (teléfono, fecha de nacimiento): cualquier corrección la hace un administrador.
    if (idJugador) { delete resto.telefono; delete resto.fecha_nacimiento; }
    return inscribirEnLiga({
        ...resto,
        idJugador,
        pago_confirmado: false,
        monto_pagado: 0,
    });
};
