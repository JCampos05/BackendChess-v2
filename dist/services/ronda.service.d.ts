import { RondaEstado } from '@prisma/client';
export interface CreateRondaDto {
    idTorneo: number;
    idTorneoCategoria: number;
    numeroRonda: number;
    fecha_inicio?: Date | string | null;
    estado?: RondaEstado;
    notas?: string | null;
}
export interface UpdateRondaDto {
    numeroRonda?: number;
    fecha_inicio?: Date | string | null;
    fecha_fin?: Date | string | null;
    estado?: RondaEstado;
    notas?: string | null;
}
export declare function getAllRondas(): Promise<({
    torneo: {
        idTorneo: number;
        nombre: string | null;
        fecha: Date;
    };
    torneo_categoria: {
        categoria: {
            nombre: string;
            idCategoria: number;
        };
    } & {
        activo: boolean;
        idTorneo: number;
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        idCategoria: number;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: import("@prisma/client/runtime/library").JsonValue | null;
        desempates: import("@prisma/client/runtime/library").JsonValue | null;
        calendario: import("@prisma/client/runtime/library").JsonValue | null;
        idTorneoCat: number;
    };
} & {
    idTorneo: number;
    notas: string | null;
    estado: import(".prisma/client").$Enums.RondaEstado;
    fecha_creacion: Date | null;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    numeroRonda: number;
    idRonda: number;
    idTorneoCategoria: number;
})[]>;
export declare function getRondasByTorneo(idTorneo: number): Promise<({
    torneo_categoria: {
        categoria: {
            nombre: string;
            idCategoria: number;
        };
    } & {
        activo: boolean;
        idTorneo: number;
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        idCategoria: number;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: import("@prisma/client/runtime/library").JsonValue | null;
        desempates: import("@prisma/client/runtime/library").JsonValue | null;
        calendario: import("@prisma/client/runtime/library").JsonValue | null;
        idTorneoCat: number;
    };
    mesas: ({
        jugador_blanco: {
            nombre: string;
            apellido1: string;
            idJugador: number;
        };
        jugador_negro: {
            nombre: string;
            apellido1: string;
            idJugador: number;
        };
    } & {
        notas: string | null;
        estado: import(".prisma/client").$Enums.MesaEstado;
        fecha_creacion: Date | null;
        numeroMesa: number;
        idJugadorBlanco: number;
        idJugadorNegro: number;
        ilegalesBlanco: number;
        ilegalesNegro: number;
        usuarioEditando: string | null;
        timestampEdicion: Date | null;
        idRonda: number;
        idMesa: number;
    })[];
} & {
    idTorneo: number;
    notas: string | null;
    estado: import(".prisma/client").$Enums.RondaEstado;
    fecha_creacion: Date | null;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    numeroRonda: number;
    idRonda: number;
    idTorneoCategoria: number;
})[]>;
export declare function getRondasByTorneoCat(idTorneo: number, idTorneoCategoria: number): Promise<({
    torneo_categoria: {
        categoria: {
            nombre: string;
            idCategoria: number;
        };
    } & {
        activo: boolean;
        idTorneo: number;
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        idCategoria: number;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: import("@prisma/client/runtime/library").JsonValue | null;
        desempates: import("@prisma/client/runtime/library").JsonValue | null;
        calendario: import("@prisma/client/runtime/library").JsonValue | null;
        idTorneoCat: number;
    };
} & {
    idTorneo: number;
    notas: string | null;
    estado: import(".prisma/client").$Enums.RondaEstado;
    fecha_creacion: Date | null;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    numeroRonda: number;
    idRonda: number;
    idTorneoCategoria: number;
})[]>;
export declare function getRondaById(id: number): Promise<{
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
    } & {
        activo: boolean;
        idTorneo: number;
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        idCategoria: number;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: import("@prisma/client/runtime/library").JsonValue | null;
        desempates: import("@prisma/client/runtime/library").JsonValue | null;
        calendario: import("@prisma/client/runtime/library").JsonValue | null;
        idTorneoCat: number;
    };
    mesas: ({
        jugador_blanco: {
            nombre: string;
            apellido1: string;
            apellido2: string | null;
            rating: number;
            idJugador: number;
        };
        jugador_negro: {
            nombre: string;
            apellido1: string;
            apellido2: string | null;
            rating: number;
            idJugador: number;
        };
    } & {
        notas: string | null;
        estado: import(".prisma/client").$Enums.MesaEstado;
        fecha_creacion: Date | null;
        numeroMesa: number;
        idJugadorBlanco: number;
        idJugadorNegro: number;
        ilegalesBlanco: number;
        ilegalesNegro: number;
        usuarioEditando: string | null;
        timestampEdicion: Date | null;
        idRonda: number;
        idMesa: number;
    })[];
} & {
    idTorneo: number;
    notas: string | null;
    estado: import(".prisma/client").$Enums.RondaEstado;
    fecha_creacion: Date | null;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    numeroRonda: number;
    idRonda: number;
    idTorneoCategoria: number;
}>;
/** Lectura pública: solo campos seguros, sin autenticación. */
export declare function getRondasByTorneoPublico(idTorneo: number): Promise<{
    idTorneo: number;
    estado: import(".prisma/client").$Enums.RondaEstado;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    numeroRonda: number;
    idRonda: number;
    idTorneoCategoria: number;
}[]>;
export declare function createRonda(dto: CreateRondaDto): Promise<{
    idTorneo: number;
    notas: string | null;
    estado: import(".prisma/client").$Enums.RondaEstado;
    fecha_creacion: Date | null;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    numeroRonda: number;
    idRonda: number;
    idTorneoCategoria: number;
}>;
export declare function updateRonda(id: number, dto: UpdateRondaDto): Promise<{
    idTorneo: number;
    notas: string | null;
    estado: import(".prisma/client").$Enums.RondaEstado;
    fecha_creacion: Date | null;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    numeroRonda: number;
    idRonda: number;
    idTorneoCategoria: number;
}>;
export declare function deleteRonda(id: number): Promise<void>;
