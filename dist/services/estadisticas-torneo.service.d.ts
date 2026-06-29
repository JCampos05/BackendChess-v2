import { Prisma } from '@prisma/client';
export declare const getAllEstadisticas: () => Promise<({
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: Date | null;
        rating: number;
        idJugador: number;
    };
    torneo: {
        idTorneo: number;
        nombre: string | null;
        lugar: string;
        fecha: Date;
    };
    torneo_categoria: {
        categoria: {
            nombre: string;
            idCategoria: number;
        };
        rondas: number;
        idTorneoCat: number;
    };
} & {
    fecha_actualizacion: Date | null;
    idTorneo: number;
    idJugador: number;
    desempates: Prisma.JsonValue | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    idEstadistica: number;
    idTorneoCategoria: number;
    rating_torneo: number | null;
    posicion_actual: number | null;
})[]>;
export declare const getEstadisticasByTorneo: (idTorneo: number) => Promise<({
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: Date | null;
        rating: number;
        idJugador: number;
    };
    torneo_categoria: {
        categoria: {
            nombre: string;
            idCategoria: number;
        };
        idTorneoCat: number;
    };
} & {
    fecha_actualizacion: Date | null;
    idTorneo: number;
    idJugador: number;
    desempates: Prisma.JsonValue | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    idEstadistica: number;
    idTorneoCategoria: number;
    rating_torneo: number | null;
    posicion_actual: number | null;
})[]>;
export declare const getEstadisticasByTorneoCategoria: (idTorneo: number, idTorneoCategoria: number) => Promise<({
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: Date | null;
        rating: number;
        idJugador: number;
    };
} & {
    fecha_actualizacion: Date | null;
    idTorneo: number;
    idJugador: number;
    desempates: Prisma.JsonValue | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    idEstadistica: number;
    idTorneoCategoria: number;
    rating_torneo: number | null;
    posicion_actual: number | null;
})[]>;
/**
 * Calcula estadísticas desde la BD hasta una ronda específica.
 * Reemplaza el query SQL crudo original usando relaciones Prisma.
 *
 * Estrategia: obtener todas las partidas de mesas cuya ronda sea
 * <= numeroRonda para el torneo+categoria, luego calcular en memoria.
 * Es equivalente al query original pero sin SQL crudo.
 */
export declare const getEstadisticasHastaRonda: (idTorneo: number, idTorneoCategoria: number, numeroRonda: number) => Promise<{
    posicion_actual: number;
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: Date | null;
        rating: number;
        idJugador: number;
    };
    puntos: number;
    victorias: number;
    empates: number;
    derrotas: number;
    partidas_jugadas: number;
    idJugador: number;
    idTorneo: number;
    idTorneoCategoria: number;
}[]>;
export declare const getEstadisticaByJugador: (idJugador: number, idTorneo: number) => Promise<{
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: Date | null;
        rating: number;
        idJugador: number;
    };
    torneo: {
        idTorneo: number;
        nombre: string | null;
        lugar: string;
        fecha: Date;
    };
    torneo_categoria: {
        categoria: {
            nombre: string;
            idCategoria: number;
        };
        rondas: number;
        idTorneoCat: number;
    };
} & {
    fecha_actualizacion: Date | null;
    idTorneo: number;
    idJugador: number;
    desempates: Prisma.JsonValue | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    idEstadistica: number;
    idTorneoCategoria: number;
    rating_torneo: number | null;
    posicion_actual: number | null;
}>;
export declare const createEstadistica: (datos: {
    idJugador: number;
    idTorneo: number;
    idTorneoCategoria: number;
    puntos?: number;
    partidas_jugadas?: number;
    victorias?: number;
    empates?: number;
    derrotas?: number;
}) => Promise<{
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: Date | null;
        rating: number;
        idJugador: number;
    };
    torneo: {
        idTorneo: number;
        nombre: string | null;
        lugar: string;
        fecha: Date;
    };
    torneo_categoria: {
        categoria: {
            nombre: string;
            idCategoria: number;
        };
        rondas: number;
        idTorneoCat: number;
    };
} & {
    fecha_actualizacion: Date | null;
    idTorneo: number;
    idJugador: number;
    desempates: Prisma.JsonValue | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    idEstadistica: number;
    idTorneoCategoria: number;
    rating_torneo: number | null;
    posicion_actual: number | null;
}>;
export declare const updateEstadistica: (idEstadistica: number, datos: {
    puntos?: number;
    partidas_jugadas?: number;
    victorias?: number;
    empates?: number;
    derrotas?: number;
    posicion_actual?: number;
}) => Promise<{
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: Date | null;
        rating: number;
        idJugador: number;
    };
    torneo: {
        idTorneo: number;
        nombre: string | null;
        lugar: string;
        fecha: Date;
    };
    torneo_categoria: {
        categoria: {
            nombre: string;
            idCategoria: number;
        };
        rondas: number;
        idTorneoCat: number;
    };
} & {
    fecha_actualizacion: Date | null;
    idTorneo: number;
    idJugador: number;
    desempates: Prisma.JsonValue | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    idEstadistica: number;
    idTorneoCategoria: number;
    rating_torneo: number | null;
    posicion_actual: number | null;
}>;
export declare const deleteEstadistica: (idEstadistica: number) => Promise<{
    eliminado: boolean;
}>;
export declare const recalcularPosiciones: (idTorneo: number, idTorneoCategoria: number) => Promise<({
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        fecha_nacimiento: Date | null;
        rating: number;
        idJugador: number;
    };
} & {
    fecha_actualizacion: Date | null;
    idTorneo: number;
    idJugador: number;
    desempates: Prisma.JsonValue | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    idEstadistica: number;
    idTorneoCategoria: number;
    rating_torneo: number | null;
    posicion_actual: number | null;
})[]>;
export declare const cargarRankingFinal: (idTorneo: number, idTorneoCategoria: number, jugadores: Array<{
    idJugador: number;
    posicion: number;
    puntos?: number;
    rating?: number;
    desempates?: Record<string, unknown>;
}>) => Promise<{
    procesados: number;
    errores: number;
    detalles: {
        idJugador: number;
        posicion: number;
    }[];
    erroresDetalle: {
        jugador: unknown;
        error: string;
    }[];
}>;
export declare const getListaInicialPublica: (idTorneo: number, idTorneoCategoria: number) => Promise<{
    idJugador: number;
    nombre: string;
    apellido1: string;
    apellido2: string | null;
    rating: number;
}[]>;
export declare const getRankingFinalPublico: (idTorneo: number, idTorneoCategoria: number) => Promise<{
    ranking: {
        puntos: number;
        desempates: Record<string, unknown>;
        jugador: {
            nombre: string;
            apellido1: string;
            apellido2: string | null;
            fecha_nacimiento: Date | null;
            rating: number;
            idJugador: number;
        };
        idJugador: number;
        partidas_jugadas: number;
        victorias: number;
        empates: number;
        derrotas: number;
        posicion_actual: number | null;
    }[];
    sistemasDesempate: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray;
}>;
