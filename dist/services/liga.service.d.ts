import { Prisma } from '@prisma/client';
import { PaginatedResult } from '../types';
import { CrearLigaDto, ActualizarLigaDto, FiltrosLigaDto, CrearGrupoDto, ActualizarGrupoDto, InscribirJugadorLigaDto, ConfirmarPagoLigaDto, CrearRondaLigaDto, CambiarEstadoRondaLigaDto, RegistrarPartidaLigaDto } from '../validations/liga.validations';
export declare const listarLigas: (filtros: FiltrosLigaDto) => Promise<PaginatedResult<unknown>>;
export declare const obtenerLigaPorId: (idLiga: number) => Promise<{
    ritmo_juego: {
        nombre: string;
        idRitmoJuego: number;
        minutos: number;
        incremento: number;
    } | null;
    grupos: ({
        jugadores_liga: {
            jugador: {
                nombre: string;
                apellido1: string;
                rating: number;
                idJugador: number;
            };
            estado: import(".prisma/client").$Enums.JugadorLigaEstado;
            idJugadorLiga: number;
            puntos: Prisma.Decimal;
            posicion_grupo: number | null;
        }[];
    } & {
        activo: boolean;
        fecha_actualizacion: Date | null;
        nombre: string;
        rondas: number;
        fecha_creacion: Date;
        descripcion: string | null;
        premios: Prisma.JsonValue | null;
        desempates: Prisma.JsonValue | null;
        max_jugadores: number | null;
        idGrupoLiga: number;
        idLiga: number;
    })[];
} & {
    activo: boolean;
    fecha_actualizacion: Date | null;
    notas: string | null;
    nombre: string;
    lugar: string | null;
    direccion: string | null;
    url_maps: string | null;
    cierre_inscripciones: Date | null;
    fecha_creacion: Date;
    descripcion: string | null;
    idRitmoJuego: number | null;
    fecha_inicio: Date;
    fecha_fin: Date | null;
    tipo_sistema: import(".prisma/client").$Enums.LigaTipoSistema;
    num_grupos: number;
    clasifican_por_grupo: number;
    costo_inscripcion: Prisma.Decimal;
    max_jugadores: number | null;
    idLiga: number;
}>;
export declare const crearLiga: (datos: CrearLigaDto) => Promise<{
    ritmo_juego: {
        nombre: string;
        idRitmoJuego: number;
        minutos: number;
        incremento: number;
    } | null;
    grupos: {
        activo: boolean;
        nombre: string;
        rondas: number;
        max_jugadores: number | null;
        idGrupoLiga: number;
    }[];
} & {
    activo: boolean;
    fecha_actualizacion: Date | null;
    notas: string | null;
    nombre: string;
    lugar: string | null;
    direccion: string | null;
    url_maps: string | null;
    cierre_inscripciones: Date | null;
    fecha_creacion: Date;
    descripcion: string | null;
    idRitmoJuego: number | null;
    fecha_inicio: Date;
    fecha_fin: Date | null;
    tipo_sistema: import(".prisma/client").$Enums.LigaTipoSistema;
    num_grupos: number;
    clasifican_por_grupo: number;
    costo_inscripcion: Prisma.Decimal;
    max_jugadores: number | null;
    idLiga: number;
}>;
export declare const actualizarLiga: (idLiga: number, datos: ActualizarLigaDto) => Promise<{
    ritmo_juego: {
        nombre: string;
        idRitmoJuego: number;
        minutos: number;
        incremento: number;
    } | null;
    grupos: {
        activo: boolean;
        nombre: string;
        rondas: number;
        max_jugadores: number | null;
        idGrupoLiga: number;
    }[];
} & {
    activo: boolean;
    fecha_actualizacion: Date | null;
    notas: string | null;
    nombre: string;
    lugar: string | null;
    direccion: string | null;
    url_maps: string | null;
    cierre_inscripciones: Date | null;
    fecha_creacion: Date;
    descripcion: string | null;
    idRitmoJuego: number | null;
    fecha_inicio: Date;
    fecha_fin: Date | null;
    tipo_sistema: import(".prisma/client").$Enums.LigaTipoSistema;
    num_grupos: number;
    clasifican_por_grupo: number;
    costo_inscripcion: Prisma.Decimal;
    max_jugadores: number | null;
    idLiga: number;
}>;
export declare const toggleActivoLiga: (idLiga: number, activo: boolean) => Promise<{
    activo: boolean;
    nombre: string;
    idLiga: number;
}>;
export declare const listarGrupos: (idLiga: number) => Promise<({
    _count: {
        jugadores_liga: number;
    };
} & {
    activo: boolean;
    fecha_actualizacion: Date | null;
    nombre: string;
    rondas: number;
    fecha_creacion: Date;
    descripcion: string | null;
    premios: Prisma.JsonValue | null;
    desempates: Prisma.JsonValue | null;
    max_jugadores: number | null;
    idGrupoLiga: number;
    idLiga: number;
})[]>;
export declare const crearGrupo: (idLiga: number, datos: CrearGrupoDto) => Promise<{
    activo: boolean;
    fecha_actualizacion: Date | null;
    nombre: string;
    rondas: number;
    fecha_creacion: Date;
    descripcion: string | null;
    premios: Prisma.JsonValue | null;
    desempates: Prisma.JsonValue | null;
    max_jugadores: number | null;
    idGrupoLiga: number;
    idLiga: number;
}>;
export declare const actualizarGrupo: (idLiga: number, idGrupoLiga: number, datos: ActualizarGrupoDto) => Promise<{
    activo: boolean;
    fecha_actualizacion: Date | null;
    nombre: string;
    rondas: number;
    fecha_creacion: Date;
    descripcion: string | null;
    premios: Prisma.JsonValue | null;
    desempates: Prisma.JsonValue | null;
    max_jugadores: number | null;
    idGrupoLiga: number;
    idLiga: number;
}>;
export declare const listarJugadoresLiga: (idLiga: number, idGrupoLiga?: number) => Promise<({
    jugador: {
        telefono: string | null;
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        rating: number;
        idJugador: number;
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
})[]>;
export declare const inscribirJugadorLiga: (idLiga: number, datos: InscribirJugadorLigaDto) => Promise<{
    jugador: {
        nombre: string;
        apellido1: string;
        rating: number;
        idJugador: number;
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
export declare const confirmarPagoLiga: (idJugadorLiga: number, datos: ConfirmarPagoLigaDto) => Promise<{
    jugador: {
        nombre: string;
        apellido1: string;
        idJugador: number;
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
export declare const cancelarInscripcionLiga: (idJugadorLiga: number) => Promise<{
    estado: import(".prisma/client").$Enums.JugadorLigaEstado;
    idJugador: number;
    idLiga: number;
    idJugadorLiga: number;
}>;
export declare const listarRondasLiga: (idLiga: number, idGrupoLiga?: number) => Promise<({
    _count: {
        mesas_liga: number;
    };
    grupo: {
        nombre: string;
        idGrupoLiga: number;
    };
} & {
    fecha_actualizacion: Date | null;
    notas: string | null;
    hora_inicio: Date | null;
    estado: import(".prisma/client").$Enums.RondaLigaEstado;
    fecha_creacion: Date;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    idGrupoLiga: number;
    numeroRonda: number;
    fecha_programada: Date | null;
    idLiga: number;
    idRondaLiga: number;
})[]>;
export declare const crearRondaLiga: (idLiga: number, datos: CrearRondaLigaDto) => Promise<{
    grupo: {
        nombre: string;
        idGrupoLiga: number;
    };
} & {
    fecha_actualizacion: Date | null;
    notas: string | null;
    hora_inicio: Date | null;
    estado: import(".prisma/client").$Enums.RondaLigaEstado;
    fecha_creacion: Date;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    idGrupoLiga: number;
    numeroRonda: number;
    fecha_programada: Date | null;
    idLiga: number;
    idRondaLiga: number;
}>;
export declare const cambiarEstadoRondaLiga: (idRondaLiga: number, datos: CambiarEstadoRondaLigaDto) => Promise<{
    grupo: {
        nombre: string;
        idGrupoLiga: number;
    };
} & {
    fecha_actualizacion: Date | null;
    notas: string | null;
    hora_inicio: Date | null;
    estado: import(".prisma/client").$Enums.RondaLigaEstado;
    fecha_creacion: Date;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    idGrupoLiga: number;
    numeroRonda: number;
    fecha_programada: Date | null;
    idLiga: number;
    idRondaLiga: number;
}>;
export declare const listarMesasLiga: (idRondaLiga: number) => Promise<({
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
    partida_liga: {
        idJugadorGanador: number | null;
        resultado: string;
        tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
        descripcion_finalizacion: string | null;
        duracion_minutos: number | null;
        idMesaLiga: number;
        fecha_finalizacion: Date | null;
        idPartidaLiga: number;
    } | null;
} & {
    notas: string | null;
    estado: import(".prisma/client").$Enums.MesaEstado;
    fecha_creacion: Date;
    idRondaLiga: number;
    idMesaLiga: number;
    numeroMesa: number;
    idJugadorBlanco: number;
    idJugadorNegro: number;
    ilegalesBlanco: number;
    ilegalesNegro: number;
    usuarioEditando: string | null;
    timestampEdicion: Date | null;
})[]>;
export declare const generarMesasLiga: (idLiga: number, idRondaLiga: number) => Promise<({
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
    fecha_creacion: Date;
    idRondaLiga: number;
    idMesaLiga: number;
    numeroMesa: number;
    idJugadorBlanco: number;
    idJugadorNegro: number;
    ilegalesBlanco: number;
    ilegalesNegro: number;
    usuarioEditando: string | null;
    timestampEdicion: Date | null;
})[]>;
export declare const registrarPartidaLiga: (idMesaLiga: number, datos: RegistrarPartidaLigaDto) => Promise<{
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    idMesaLiga: number;
    fecha_finalizacion: Date | null;
    idPartidaLiga: number;
}>;
export declare const obtenerTablaPosiciones: (idLiga: number, idGrupoLiga?: number) => Promise<({
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        rating: number;
        idJugador: number;
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
})[]>;
