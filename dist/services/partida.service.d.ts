import { TipoFinalizacion } from '@prisma/client';
export interface CreatePartidaDto {
    idMesa: number;
    idJugadorGanador?: number | null;
    resultado: string;
    tipo_finalizacion?: TipoFinalizacion | null;
    descripcion_finalizacion?: string | null;
    duracion_minutos?: number | null;
}
export interface UpdatePartidaDto {
    idJugadorGanador?: number | null;
    resultado?: string;
    tipo_finalizacion?: TipoFinalizacion | null;
    descripcion_finalizacion?: string | null;
    duracion_minutos?: number | null;
}
export declare function getAllPartidas(): Promise<({
    mesa: {
        ronda: {
            numeroRonda: number;
            idRonda: number;
        };
        jugador_blanco: {
            nombre: string;
            apellido1: string;
            rating: number;
            idJugador: number;
        };
        jugador_negro: {
            nombre: string;
            apellido1: string;
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
    };
    jugador_ganador: {
        nombre: string;
        apellido1: string;
        idJugador: number;
    } | null;
} & {
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    fecha_finalizacion: Date | null;
    idMesa: number;
    idPartida: number;
})[]>;
export declare function getPartidaById(id: number): Promise<{
    mesa: {
        ronda: {
            idTorneo: number;
            numeroRonda: number;
            idRonda: number;
            idTorneoCategoria: number;
        };
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
    };
    jugador_ganador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        idJugador: number;
    } | null;
} & {
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    fecha_finalizacion: Date | null;
    idMesa: number;
    idPartida: number;
}>;
export declare function getPartidasByJugadorTorneo(idJugador: number, idTorneo: number): Promise<({
    mesa: {
        ronda: {
            fecha_inicio: Date | null;
            fecha_fin: Date | null;
            numeroRonda: number;
            idRonda: number;
        };
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
    };
    jugador_ganador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        idJugador: number;
    } | null;
} & {
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    fecha_finalizacion: Date | null;
    idMesa: number;
    idPartida: number;
})[]>;
/** Registra partida + actualiza estadísticas en una sola transacción. */
export declare function createPartida(dto: CreatePartidaDto): Promise<{
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    fecha_finalizacion: Date | null;
    idMesa: number;
    idPartida: number;
}>;
/** Actualiza resultado + recalcula estadísticas (revert → apply). */
export declare function updatePartida(id: number, dto: UpdatePartidaDto): Promise<{
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    fecha_finalizacion: Date | null;
    idMesa: number;
    idPartida: number;
}>;
export declare function deletePartida(id: number): Promise<void>;
