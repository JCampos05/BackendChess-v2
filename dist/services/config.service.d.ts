import { Prisma } from '@prisma/client';
import { ActualizarConfigDto } from '../validations/config.validations';
export declare const obtenerConfig: () => Promise<{
    zona_horaria: {
        idZonaHoraria: number;
        fechaCreado: Date;
        fechaActualizado: Date;
        nombreZona: string;
        offsetUTC: Prisma.Decimal;
        nombreMostrar: string;
    };
} & {
    telefono: string | null;
    estado: string | null;
    idZonaHoraria: number;
    idConfig: number;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    whatsapp: string | null;
    nombreComite: string;
    descripcion: string | null;
    email: string | null;
    ciudad: string | null;
    pais: string;
    diasAutoDesactivar: number;
    extras: Prisma.JsonValue | null;
    fechaCreado: Date;
    fechaActualizado: Date;
}>;
export declare const actualizarConfig: (datos: ActualizarConfigDto) => Promise<{
    zona_horaria: {
        idZonaHoraria: number;
        fechaCreado: Date;
        fechaActualizado: Date;
        nombreZona: string;
        offsetUTC: Prisma.Decimal;
        nombreMostrar: string;
    };
} & {
    telefono: string | null;
    estado: string | null;
    idZonaHoraria: number;
    idConfig: number;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    whatsapp: string | null;
    nombreComite: string;
    descripcion: string | null;
    email: string | null;
    ciudad: string | null;
    pais: string;
    diasAutoDesactivar: number;
    extras: Prisma.JsonValue | null;
    fechaCreado: Date;
    fechaActualizado: Date;
}>;
export declare const listarZonasHorarias: () => Promise<{
    idZonaHoraria: number;
    fechaCreado: Date;
    fechaActualizado: Date;
    nombreZona: string;
    offsetUTC: Prisma.Decimal;
    nombreMostrar: string;
}[]>;
export declare const listarCategorias: (soloActivas?: boolean) => Promise<{
    nombre: string;
    idCategoria: number;
    costo: Prisma.Decimal;
    nota: string | null;
    edadMinima: number | null;
    edadMaxima: number | null;
    tipo_validacion_edad: import(".prisma/client").$Enums.TipoValidacionEdad;
}[]>;
export declare const listarRitmosJuego: () => Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idRitmoJuego: number;
    minutos: number;
    incremento: number;
}[]>;
export declare const listarSistemasCompetencia: () => Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idSisCompetencia: number;
}[]>;
export declare const listarSistemasDesempate: () => Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idDesempate: number;
}[]>;
export declare const listarSistemasPago: () => Promise<{
    telefono: string;
    idSistemaPago: number;
    nombreCuenta: string;
    banco: string;
    clabe: string;
}[]>;
export declare const listarPatrocinadores: () => Promise<{
    nombre: string;
    descripcion: string | null;
    idPatrocinador: number;
    logo_url: string | null;
    sitio_web: string | null;
    contacto: string | null;
}[]>;
