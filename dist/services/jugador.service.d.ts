import { Prisma } from '@prisma/client';
import { CrearJugadorDto, ActualizarJugadorDto, FiltrosJugadorDto } from '../validations/jugador.validations';
import { PaginatedResult } from '../types';
export declare const listarJugadores: (filtros: FiltrosJugadorDto) => Promise<PaginatedResult<unknown>>;
export declare const buscarJugadoresPorNombre: (termino: string) => Promise<{
    categoria: {
        nombre: string;
    } | null;
    nombre: string;
    estado: import(".prisma/client").$Enums.JugadorEstado;
    apellido1: string;
    apellido2: string | null;
    rating: number;
    idJugador: number;
}[]>;
export declare const obtenerJugadorPorId: (idJugador: number) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
        costo: Prisma.Decimal;
    } | null;
    inscripciones: ({
        categoria: {
            nombre: string;
            idCategoria: number;
        } | null;
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
    })[];
} & {
    telefono: string | null;
    fecha_registro: Date | null;
    notas: string | null;
    nombre: string;
    estado: import(".prisma/client").$Enums.JugadorEstado;
    apellido1: string;
    apellido2: string | null;
    fecha_nacimiento: Date | null;
    idCategoria: number | null;
    rating: number;
    idJugador: number;
    pago_confirmado: boolean;
    actualizacion: Date | null;
}>;
export declare const crearJugador: (datos: CrearJugadorDto) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
    } | null;
} & {
    telefono: string | null;
    fecha_registro: Date | null;
    notas: string | null;
    nombre: string;
    estado: import(".prisma/client").$Enums.JugadorEstado;
    apellido1: string;
    apellido2: string | null;
    fecha_nacimiento: Date | null;
    idCategoria: number | null;
    rating: number;
    idJugador: number;
    pago_confirmado: boolean;
    actualizacion: Date | null;
}>;
export declare const actualizarJugador: (idJugador: number, datos: ActualizarJugadorDto) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
    } | null;
} & {
    telefono: string | null;
    fecha_registro: Date | null;
    notas: string | null;
    nombre: string;
    estado: import(".prisma/client").$Enums.JugadorEstado;
    apellido1: string;
    apellido2: string | null;
    fecha_nacimiento: Date | null;
    idCategoria: number | null;
    rating: number;
    idJugador: number;
    pago_confirmado: boolean;
    actualizacion: Date | null;
}>;
export declare const cambiarEstadoJugador: (idJugador: number, estado: "pendiente_pago" | "activo" | "inactivo") => Promise<{
    nombre: string;
    estado: import(".prisma/client").$Enums.JugadorEstado;
    apellido1: string;
    idJugador: number;
}>;
export declare const confirmarPagoJugador: (idJugador: number) => Promise<{
    nombre: string;
    estado: import(".prisma/client").$Enums.JugadorEstado;
    apellido1: string;
    idJugador: number;
    pago_confirmado: boolean;
}>;
export declare const verificarElegibilidad: (idJugador: number, idTorneo: number, idCategoria?: number) => Promise<{
    elegible: boolean;
    motivo: string;
    edad?: undefined;
} | {
    elegible: boolean;
    motivo: string | undefined;
    edad: number;
} | {
    elegible: boolean;
    edad: number;
    motivo?: undefined;
} | {
    elegible: boolean;
    motivo?: undefined;
    edad?: undefined;
}>;
