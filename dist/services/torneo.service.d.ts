import { Prisma } from '@prisma/client';
import { CrearTorneoDto, ActualizarTorneoDto, CambiarEstadoDto, FiltrosTorneoDto, AsignarCategoriaDto, ActualizarCategoriaDto, AsignarPatrocinadorDto, AsignarAdminDto } from '../validations/torneo.validation';
import { PaginatedResult } from '../types';
export declare const listarTorneos: (filtros: FiltrosTorneoDto) => Promise<PaginatedResult<unknown>>;
export declare const obtenerTorneoPorId: (idTorneo: number) => Promise<{
    zona_horaria: {
        nombreZona: string;
        nombreMostrar: string;
    } | null;
    sistema_pago: {
        idSistemaPago: number;
        nombreCuenta: string;
        banco: string;
    } | null;
    torneo_categorias: {
        categoria: {
            nombre: string;
            idCategoria: number;
            costo: Prisma.Decimal;
        };
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: Prisma.JsonValue;
        idTorneoCat: number;
    }[];
    patrocinadores: {
        patrocinador: {
            nombre: string;
            descripcion: string | null;
            idPatrocinador: number;
            logo_url: string | null;
            sitio_web: string | null;
            contacto: string | null;
        };
        nivel: import(".prisma/client").$Enums.NivelPatrocinador;
        orden: number;
    }[];
    admins_asignados: {
        usuario: {
            idUsuario: number;
            telefono: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
        };
        idUsuarioTorneo: number;
        notas: string | null;
    }[];
} & {
    activo: boolean;
    fecha_actualizacion: Date | null;
    idTorneo: number;
    notas: string | null;
    nombre: string | null;
    lugar: string;
    direccion: string;
    url_maps: string | null;
    fecha: Date;
    hora_inicio: string | null;
    hora_fin: string | null;
    estado: import(".prisma/client").$Enums.EstadoTorneo;
    es_actual: boolean;
    rondas: number;
    cupo_maximo: number | null;
    cierre_inscripciones: Date | null;
    idZonaHoraria: number | null;
    idSistemaPago: number | null;
    fecha_creacion: Date | null;
}>;
export declare const crearTorneo: (datos: CrearTorneoDto) => Promise<{
    zona_horaria: {
        nombreZona: string;
        nombreMostrar: string;
    } | null;
    sistema_pago: {
        idSistemaPago: number;
        nombreCuenta: string;
        banco: string;
    } | null;
    torneo_categorias: {
        categoria: {
            nombre: string;
            idCategoria: number;
            costo: Prisma.Decimal;
        };
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: Prisma.JsonValue;
        idTorneoCat: number;
    }[];
    patrocinadores: {
        patrocinador: {
            nombre: string;
            descripcion: string | null;
            idPatrocinador: number;
            logo_url: string | null;
            sitio_web: string | null;
            contacto: string | null;
        };
        nivel: import(".prisma/client").$Enums.NivelPatrocinador;
        orden: number;
    }[];
    admins_asignados: {
        usuario: {
            idUsuario: number;
            telefono: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
        };
        idUsuarioTorneo: number;
        notas: string | null;
    }[];
} & {
    activo: boolean;
    fecha_actualizacion: Date | null;
    idTorneo: number;
    notas: string | null;
    nombre: string | null;
    lugar: string;
    direccion: string;
    url_maps: string | null;
    fecha: Date;
    hora_inicio: string | null;
    hora_fin: string | null;
    estado: import(".prisma/client").$Enums.EstadoTorneo;
    es_actual: boolean;
    rondas: number;
    cupo_maximo: number | null;
    cierre_inscripciones: Date | null;
    idZonaHoraria: number | null;
    idSistemaPago: number | null;
    fecha_creacion: Date | null;
}>;
export declare const actualizarTorneo: (idTorneo: number, datos: ActualizarTorneoDto) => Promise<{
    zona_horaria: {
        nombreZona: string;
        nombreMostrar: string;
    } | null;
    sistema_pago: {
        idSistemaPago: number;
        nombreCuenta: string;
        banco: string;
    } | null;
    torneo_categorias: {
        categoria: {
            nombre: string;
            idCategoria: number;
            costo: Prisma.Decimal;
        };
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: Prisma.JsonValue;
        idTorneoCat: number;
    }[];
    patrocinadores: {
        patrocinador: {
            nombre: string;
            descripcion: string | null;
            idPatrocinador: number;
            logo_url: string | null;
            sitio_web: string | null;
            contacto: string | null;
        };
        nivel: import(".prisma/client").$Enums.NivelPatrocinador;
        orden: number;
    }[];
    admins_asignados: {
        usuario: {
            idUsuario: number;
            telefono: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
        };
        idUsuarioTorneo: number;
        notas: string | null;
    }[];
} & {
    activo: boolean;
    fecha_actualizacion: Date | null;
    idTorneo: number;
    notas: string | null;
    nombre: string | null;
    lugar: string;
    direccion: string;
    url_maps: string | null;
    fecha: Date;
    hora_inicio: string | null;
    hora_fin: string | null;
    estado: import(".prisma/client").$Enums.EstadoTorneo;
    es_actual: boolean;
    rondas: number;
    cupo_maximo: number | null;
    cierre_inscripciones: Date | null;
    idZonaHoraria: number | null;
    idSistemaPago: number | null;
    fecha_creacion: Date | null;
}>;
export declare const eliminarTorneo: (idTorneo: number) => Promise<{
    eliminado: boolean;
}>;
export declare const cambiarEstado: (idTorneo: number, datos: CambiarEstadoDto) => Promise<{
    zona_horaria: {
        nombreZona: string;
        nombreMostrar: string;
    } | null;
    sistema_pago: {
        idSistemaPago: number;
        nombreCuenta: string;
        banco: string;
    } | null;
    torneo_categorias: {
        categoria: {
            nombre: string;
            idCategoria: number;
            costo: Prisma.Decimal;
        };
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: Prisma.JsonValue;
        idTorneoCat: number;
    }[];
} & {
    activo: boolean;
    fecha_actualizacion: Date | null;
    idTorneo: number;
    notas: string | null;
    nombre: string | null;
    lugar: string;
    direccion: string;
    url_maps: string | null;
    fecha: Date;
    hora_inicio: string | null;
    hora_fin: string | null;
    estado: import(".prisma/client").$Enums.EstadoTorneo;
    es_actual: boolean;
    rondas: number;
    cupo_maximo: number | null;
    cierre_inscripciones: Date | null;
    idZonaHoraria: number | null;
    idSistemaPago: number | null;
    fecha_creacion: Date | null;
}>;
export declare const toggleActivo: (idTorneo: number, activo: boolean) => Promise<{
    activo: boolean;
    idTorneo: number;
    es_actual: boolean;
}>;
export declare const toggleEsActual: (idTorneo: number, es_actual: boolean) => Promise<{
    activo: boolean;
    idTorneo: number;
    es_actual: boolean;
}>;
export declare const asignarCategoria: (idTorneo: number, datos: AsignarCategoriaDto) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
        costo: Prisma.Decimal;
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
    premios: Prisma.JsonValue | null;
    desempates: Prisma.JsonValue | null;
    calendario: Prisma.JsonValue | null;
    idTorneoCat: number;
}>;
export declare const actualizarCategoriaTorneo: (idTorneo: number, idCategoria: number, datos: ActualizarCategoriaDto) => Promise<{
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
    premios: Prisma.JsonValue | null;
    desempates: Prisma.JsonValue | null;
    calendario: Prisma.JsonValue | null;
    idTorneoCat: number;
}>;
export declare const desasignarCategoria: (idTorneo: number, idCategoria: number) => Promise<{
    activo: boolean;
    idTorneoCat: number;
}>;
export declare const listarPatrocinadoresTorneo: (idTorneo: number) => Promise<{
    patrocinador: {
        nombre: string;
        descripcion: string | null;
        idPatrocinador: number;
        logo_url: string | null;
        sitio_web: string | null;
        contacto: string | null;
    };
    nivel: import(".prisma/client").$Enums.NivelPatrocinador;
    orden: number;
}[]>;
export declare const asignarPatrocinador: (idTorneo: number, datos: AsignarPatrocinadorDto) => Promise<{
    patrocinador: {
        nombre: string;
        idPatrocinador: number;
    };
    nivel: import(".prisma/client").$Enums.NivelPatrocinador;
    orden: number;
}>;
export declare const removerPatrocinador: (idTorneo: number, idPatrocinador: number) => Promise<{
    eliminado: boolean;
}>;
export declare const asignarAdmin: (idTorneo: number, datos: AsignarAdminDto) => Promise<{
    usuario: {
        idUsuario: number;
        telefono: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    };
} & {
    idUsuario: number;
    activo: boolean;
    idUsuarioTorneo: number;
    idTorneo: number;
    fechaAsignacion: Date;
    notas: string | null;
}>;
export declare const removerAdmin: (idTorneo: number, idUsuario: number) => Promise<{
    activo: boolean;
    idUsuarioTorneo: number;
}>;
