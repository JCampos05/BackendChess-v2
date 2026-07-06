import { Prisma } from '@prisma/client';
import { CrearGrupoFlatDto, ActualizarGrupoDto, CrearRondaLigaFlatDto, ActualizarRondaLigaDto, CrearMesaLigaDto, ActualizarMesaLigaDto, RegistrarPartidaLigaDto, InscribirJugadorLigaFlatDto, ActualizarJugadorLigaDto, CrearPartidaLigaDto, ActualizarPartidaLigaDto } from '../validations/liga.validations';
export declare const listarTodasLigas: () => Promise<({
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
})[]>;
export declare const listarLigasActivas: () => Promise<({
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
})[]>;
export declare const obtenerStatsLiga: (idLiga: number) => Promise<{
    idLiga: number;
    totalGrupos: number;
    totalJugadores: number;
    totalRondas: number;
    totalPartidas: number;
}>;
export declare const eliminarLiga: (idLiga: number) => Promise<{
    activo: boolean;
    nombre: string;
    idLiga: number;
}>;
export declare const listarGruposFlat: (idLiga?: number) => Promise<({
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
export declare const obtenerGrupoPorId: (idGrupoLiga: number) => Promise<{
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
}>;
export declare const crearGrupoFlat: (datos: CrearGrupoFlatDto) => Promise<{
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
export declare const actualizarGrupoFlat: (idGrupoLiga: number, datos: ActualizarGrupoDto) => Promise<{
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
export declare const eliminarGrupoFlat: (idGrupoLiga: number) => Promise<{
    activo: boolean;
    nombre: string;
    idGrupoLiga: number;
}>;
export declare const obtenerTablaGrupo: (idGrupoLiga: number) => Promise<({
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
    posicion: number | null;
    idJugadorLiga: number;
    rating_inicial: number;
    numero_jugador: number | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    posicion_grupo: number | null;
})[]>;
export declare const listarRondasFlat: (idLiga?: number, idGrupoLiga?: number) => Promise<({
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
export declare const obtenerRondaPorId: (idRondaLiga: number) => Promise<{
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
export declare const crearRondaFlat: (datos: CrearRondaLigaFlatDto) => Promise<{
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
export declare const actualizarRondaFlat: (idRondaLiga: number, datos: ActualizarRondaLigaDto) => Promise<{
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
export declare const iniciarRondaFlat: (idRondaLiga: number) => Promise<{
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
export declare const finalizarRondaFlat: (idRondaLiga: number) => Promise<{
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
export declare const eliminarRondaFlat: (idRondaLiga: number) => Promise<{
    idRondaLiga: number;
}>;
export declare const listarMesasFlat: (idRondaLiga?: number) => Promise<({
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
    numeroMesa: number;
    idJugadorBlanco: number;
    idJugadorNegro: number;
    idMesaLiga: number;
    ilegalesBlanco: number;
    ilegalesNegro: number;
    usuarioEditando: string | null;
    timestampEdicion: Date | null;
})[]>;
export declare const obtenerMesaPorId: (idMesaLiga: number) => Promise<{
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
    numeroMesa: number;
    idJugadorBlanco: number;
    idJugadorNegro: number;
    idMesaLiga: number;
    ilegalesBlanco: number;
    ilegalesNegro: number;
    usuarioEditando: string | null;
    timestampEdicion: Date | null;
}>;
export declare const crearMesaFlat: (datos: CrearMesaLigaDto) => Promise<{
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
    numeroMesa: number;
    idJugadorBlanco: number;
    idJugadorNegro: number;
    idMesaLiga: number;
    ilegalesBlanco: number;
    ilegalesNegro: number;
    usuarioEditando: string | null;
    timestampEdicion: Date | null;
}>;
export declare const actualizarMesaFlat: (idMesaLiga: number, datos: ActualizarMesaLigaDto) => Promise<{
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
    numeroMesa: number;
    idJugadorBlanco: number;
    idJugadorNegro: number;
    idMesaLiga: number;
    ilegalesBlanco: number;
    ilegalesNegro: number;
    usuarioEditando: string | null;
    timestampEdicion: Date | null;
}>;
export declare const finalizarMesaFlat: (idMesaLiga: number, datos: RegistrarPartidaLigaDto) => Promise<{
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    idMesaLiga: number;
    fecha_finalizacion: Date | null;
    idPartidaLiga: number;
}>;
export declare const eliminarMesaFlat: (idMesaLiga: number) => Promise<{
    idMesaLiga: number;
}>;
export declare const listarJugadoresLigaFlat: (idLiga?: number, idGrupoLiga?: number) => Promise<({
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
    posicion: number | null;
    idJugadorLiga: number;
    rating_inicial: number;
    numero_jugador: number | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    posicion_grupo: number | null;
})[]>;
export declare const obtenerJugadorLigaPorId: (idJugadorLiga: number) => Promise<{
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
    posicion: number | null;
    idJugadorLiga: number;
    rating_inicial: number;
    numero_jugador: number | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    posicion_grupo: number | null;
}>;
export declare const crearJugadorLigaFlat: (datos: InscribirJugadorLigaFlatDto) => Promise<{
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
    posicion: number | null;
    idJugadorLiga: number;
    rating_inicial: number;
    numero_jugador: number | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    posicion_grupo: number | null;
}>;
export declare const actualizarJugadorLigaFlat: (idJugadorLiga: number, datos: ActualizarJugadorLigaDto) => Promise<{
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
    posicion: number | null;
    idJugadorLiga: number;
    rating_inicial: number;
    numero_jugador: number | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    posicion_grupo: number | null;
}>;
export declare const confirmarPagoFlat: (idJugadorLiga: number, monto_pagado?: number) => Promise<{
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
    posicion: number | null;
    idJugadorLiga: number;
    rating_inicial: number;
    numero_jugador: number | null;
    puntos: Prisma.Decimal;
    partidas_jugadas: number;
    victorias: number;
    empates: number;
    derrotas: number;
    posicion_grupo: number | null;
}>;
export declare const eliminarJugadorLigaFlat: (idJugadorLiga: number) => Promise<{
    estado: import(".prisma/client").$Enums.JugadorLigaEstado;
    idJugador: number;
    idLiga: number;
    idJugadorLiga: number;
}>;
export declare const listarPartidasFlat: (idMesaLiga?: number) => Promise<({
    mesa_liga: {
        notas: string | null;
        estado: import(".prisma/client").$Enums.MesaEstado;
        fecha_creacion: Date;
        idRondaLiga: number;
        numeroMesa: number;
        idJugadorBlanco: number;
        idJugadorNegro: number;
        idMesaLiga: number;
        ilegalesBlanco: number;
        ilegalesNegro: number;
        usuarioEditando: string | null;
        timestampEdicion: Date | null;
    };
} & {
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    idMesaLiga: number;
    fecha_finalizacion: Date | null;
    idPartidaLiga: number;
})[]>;
export declare const obtenerPartidaPorId: (idPartidaLiga: number) => Promise<{
    mesa_liga: {
        notas: string | null;
        estado: import(".prisma/client").$Enums.MesaEstado;
        fecha_creacion: Date;
        idRondaLiga: number;
        numeroMesa: number;
        idJugadorBlanco: number;
        idJugadorNegro: number;
        idMesaLiga: number;
        ilegalesBlanco: number;
        ilegalesNegro: number;
        usuarioEditando: string | null;
        timestampEdicion: Date | null;
    };
} & {
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    idMesaLiga: number;
    fecha_finalizacion: Date | null;
    idPartidaLiga: number;
}>;
export declare const crearPartidaFlat: (datos: CrearPartidaLigaDto) => Promise<{
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    idMesaLiga: number;
    fecha_finalizacion: Date | null;
    idPartidaLiga: number;
}>;
export declare const actualizarPartidaFlat: (idPartidaLiga: number, datos: ActualizarPartidaLigaDto) => Promise<{
    idJugadorGanador: number | null;
    resultado: string;
    tipo_finalizacion: import(".prisma/client").$Enums.TipoFinalizacion | null;
    descripcion_finalizacion: string | null;
    duracion_minutos: number | null;
    idMesaLiga: number;
    fecha_finalizacion: Date | null;
    idPartidaLiga: number;
}>;
export declare const eliminarPartidaFlat: (idPartidaLiga: number) => Promise<{
    idPartidaLiga: number;
}>;
