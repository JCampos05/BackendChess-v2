import { MesaEstado } from '@prisma/client';
export interface CreateMesaDto {
    numeroMesa: number;
    idRonda: number;
    idJugadorBlanco: number;
    idJugadorNegro: number;
    estado?: MesaEstado;
    notas?: string | null;
}
export interface UpdateMesaDto {
    numeroMesa?: number;
    ilegalesBlanco?: number;
    ilegalesNegro?: number;
    estado?: MesaEstado;
    notas?: string | null;
    timestampEdicion?: string | Date;
}
export declare function getAllMesas(): Promise<({
    ronda: {
        estado: import(".prisma/client").$Enums.RondaEstado;
        numeroRonda: number;
        idRonda: number;
    };
    partida: {
        idJugadorGanador: number | null;
        resultado: string;
        tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
        descripcion_finalizacion: string | null;
        duracion_minutos: number | null;
        fecha_finalizacion: Date | null;
        idMesa: number;
        idPartida: number;
    } | null;
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
})[]>;
export declare function getMesasByRonda(idRonda: number): Promise<({
    partida: {
        idJugadorGanador: number | null;
        resultado: string;
        tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
        descripcion_finalizacion: string | null;
        duracion_minutos: number | null;
        fecha_finalizacion: Date | null;
        idMesa: number;
        idPartida: number;
    } | null;
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
})[]>;
/** Lectura pública — sin autenticación. */
export declare function getMesasByRondaPublico(idRonda: number): Promise<({
    partida: {
        idJugadorGanador: number | null;
        resultado: string;
        tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
        descripcion_finalizacion: string | null;
        duracion_minutos: number | null;
        fecha_finalizacion: Date | null;
        idMesa: number;
        idPartida: number;
    } | null;
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
})[]>;
export declare function getMesaById(id: number): Promise<{
    ronda: {
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
    };
    partida: {
        idJugadorGanador: number | null;
        resultado: string;
        tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
        descripcion_finalizacion: string | null;
        duracion_minutos: number | null;
        fecha_finalizacion: Date | null;
        idMesa: number;
        idPartida: number;
    } | null;
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
}>;
export declare function createMesa(dto: CreateMesaDto): Promise<{
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
}>;
export declare function deleteMesa(id: number): Promise<void>;
/** Verifica disponibilidad y libera bloqueos expirados automáticamente. */
export declare function verificarDisponibilidadMesa(id: number): Promise<{
    disponible: boolean;
    yaFinalizada: boolean;
    message: string;
    usuarioEditando?: undefined;
    tiempoRestante?: undefined;
} | {
    disponible: boolean;
    yaFinalizada: boolean;
    usuarioEditando: string;
    tiempoRestante: number;
    message: string;
}>;
/** Bloquea la mesa para el usuario actual. */
export declare function bloquearMesa(id: number, usuarioTelefono: string, modoEdicion?: boolean): Promise<{
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
}>;
/** Libera el bloqueo (solo el usuario que bloqueó). */
export declare function liberarMesa(id: number, usuarioTelefono: string): Promise<void>;
/** Actualiza la mesa con validación de bloqueo y concurrencia optimista. */
export declare function updateMesa(id: number, dto: UpdateMesaDto, usuarioTelefono: string): Promise<{
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
}>;
