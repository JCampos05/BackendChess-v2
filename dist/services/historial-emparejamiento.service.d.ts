export interface CreateHistorialDto {
    idJugador1: number;
    idJugador2: number;
    idTorneo: number;
    idTorneoCategoria: number;
    numeroRonda: number;
}
export declare function getAllHistorial(): Promise<({
    torneo: {
        idTorneo: number;
        nombre: string | null;
        fecha: Date;
    };
    jugador1: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        idJugador: number;
    };
    jugador2: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        idJugador: number;
    };
} & {
    idTorneo: number;
    numeroRonda: number;
    idTorneoCategoria: number;
    idHistorial: number;
    idJugador1: number;
    idJugador2: number;
    fecha_emparejamiento: Date | null;
})[]>;
export declare function getHistorialByTorneo(idTorneo: number): Promise<({
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
    jugador1: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        idJugador: number;
    };
    jugador2: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        idJugador: number;
    };
} & {
    idTorneo: number;
    numeroRonda: number;
    idTorneoCategoria: number;
    idHistorial: number;
    idJugador1: number;
    idJugador2: number;
    fecha_emparejamiento: Date | null;
})[]>;
export declare function getHistorialByJugador(idJugador: number, idTorneo: number): Promise<({
    jugador1: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        rating: number;
        idJugador: number;
    };
    jugador2: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        rating: number;
        idJugador: number;
    };
} & {
    idTorneo: number;
    numeroRonda: number;
    idTorneoCategoria: number;
    idHistorial: number;
    idJugador1: number;
    idJugador2: number;
    fecha_emparejamiento: Date | null;
})[]>;
export declare function verificarEnfrentamiento(idJugador1: number, idJugador2: number, idTorneo: number): Promise<{
    yaSeEnfrentaron: boolean;
    data: {
        idTorneo: number;
        numeroRonda: number;
        idTorneoCategoria: number;
        idHistorial: number;
        idJugador1: number;
        idJugador2: number;
        fecha_emparejamiento: Date | null;
    } | null;
}>;
export declare function createHistorial(dto: CreateHistorialDto): Promise<{
    idTorneo: number;
    numeroRonda: number;
    idTorneoCategoria: number;
    idHistorial: number;
    idJugador1: number;
    idJugador2: number;
    fecha_emparejamiento: Date | null;
}>;
export declare function createHistorialRonda(emparejamientos: Partial<CreateHistorialDto>[]): Promise<{
    idTorneo: number;
    numeroRonda: number;
    idTorneoCategoria: number;
    idHistorial: number;
    idJugador1: number;
    idJugador2: number;
    fecha_emparejamiento: Date | null;
}[]>;
export declare function deleteHistorial(id: number): Promise<void>;
