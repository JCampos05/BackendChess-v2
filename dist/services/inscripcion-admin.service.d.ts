import { Prisma } from '@prisma/client';
export interface InscribirEnTorneoDto {
    idJugador?: number;
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    rating_inicial?: number;
    idTorneo: number;
    idCategoria: number;
    notas?: string;
    pago_confirmado?: boolean;
    monto_pagado?: number;
}
export interface InscribirEnLigaDto {
    idJugador?: number;
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    rating_inicial?: number;
    idLiga: number;
    idGrupoLiga: number;
    notas?: string;
    pago_confirmado?: boolean;
    monto_pagado?: number;
    numero_jugador?: number;
    posicion?: number;
}
export declare const inscribirEnTorneo: (datos: InscribirEnTorneoDto) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
        costo: Prisma.Decimal;
    } | null;
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        idJugador: number;
    };
    torneo: {
        idTorneo: number;
        nombre: string | null;
        fecha: Date;
    };
} & {
    fecha_actualizacion: Date | null;
    idTorneo: number;
    notas: string | null;
    estado: import(".prisma/client").$Enums.InscripcionEstado;
    idCategoria: number | null;
    idJugador: number;
    pago_confirmado: boolean;
    fecha_inscripcion: Date | null;
    edad: number | null;
    monto_pagado: Prisma.Decimal;
    idInscripcion: number;
    idAdminConfirmo: number | null;
    fecha_confirmacion: Date | null;
}>;
export declare const inscribirEnLiga: (datos: InscribirEnLigaDto) => Promise<{
    jugador: {
        nombre: string;
        apellido1: string;
        idJugador: number;
    };
    liga: {
        nombre: string;
        idLiga: number;
    };
    grupo: {
        nombre: string;
        idGrupoLiga: number;
    };
} & {
    fecha_actualizacion: Date | null;
    notas: string | null;
    estado: import(".prisma/client").$Enums.JugadorLigaEstado;
    idJugador: number;
    pago_confirmado: boolean;
    fecha_inscripcion: Date;
    monto_pagado: Prisma.Decimal;
    desempates: Prisma.JsonValue | null;
    idGrupoLiga: number;
    idLiga: number;
    idJugadorLiga: number;
    rating_inicial: number;
    numero_jugador: number | null;
    posicion: number | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    posicion_grupo: number | null;
}>;
export declare const getEventosActivos: () => Promise<{
    torneos: {
        tipo: string;
        id: number;
        nombre: string;
        lugar: string;
        fecha: Date;
        categorias: {
            categoria: {
                nombre: string;
                idCategoria: number;
                costo: Prisma.Decimal;
            };
            idTorneoCat: number;
        }[];
    }[];
    ligas: {
        tipo: string;
        id: number;
        nombre: string;
        lugar: string | null;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        grupos: {
            nombre: string;
            rondas: number;
            max_jugadores: number | null;
            idGrupoLiga: number;
        }[];
    }[];
}>;
export declare const getCategoriasByTorneo: (idTorneo: number) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
        costo: Prisma.Decimal;
        edadMinima: number | null;
        edadMaxima: number | null;
    };
    rondas: number;
    ritmo_juego: string | null;
    idTorneoCat: number;
}[]>;
export declare const getGruposByLiga: (idLiga: number) => Promise<{
    nombre: string;
    rondas: number;
    descripcion: string | null;
    max_jugadores: number | null;
    idGrupoLiga: number;
}[]>;
export declare const buscarJugadorSimilar: (q: string) => Promise<{
    telefono: string | null;
    nombre: string;
    estado: import(".prisma/client").$Enums.JugadorEstado;
    inscripciones: {
        categoria: {
            nombre: string;
            idCategoria: number;
        } | null;
        torneo: {
            idTorneo: number;
            nombre: string | null;
            lugar: string;
            fecha: Date;
        };
        estado: import(".prisma/client").$Enums.InscripcionEstado;
        pago_confirmado: boolean;
        fecha_inscripcion: Date | null;
        idInscripcion: number;
    }[];
    apellido1: string;
    apellido2: string | null;
    fecha_nacimiento: Date | null;
    rating: number;
    idJugador: number;
}[]>;
