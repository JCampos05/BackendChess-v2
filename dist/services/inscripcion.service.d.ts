import { Prisma } from '@prisma/client';
import { CrearInscripcionDto, ActualizarInscripcionDto, ConfirmarPagoDto } from '../validations/inscripcion.validations';
export declare const obtenerInscripcionPorId: (idInscripcion: number) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
        costo: Prisma.Decimal;
    } | null;
    jugador: {
        nombre: string;
        estado: import(".prisma/client").$Enums.JugadorEstado;
        apellido1: string;
        apellido2: string | null;
        rating: number;
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
export declare const listarInscripcionesTorneo: (idTorneo: number, soloConfirmados?: boolean) => Promise<({
    categoria: {
        nombre: string;
        idCategoria: number;
    } | null;
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        rating: number;
        idJugador: number;
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
})[]>;
export declare const listarInscripcionesJugador: (idJugador: number) => Promise<({
    categoria: {
        nombre: string;
        idCategoria: number;
    } | null;
    torneo: {
        activo: boolean;
        idTorneo: number;
        nombre: string | null;
        lugar: string;
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
})[]>;
export declare const crearInscripcion: (datos: CrearInscripcionDto) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
    } | null;
    jugador: {
        nombre: string;
        apellido1: string;
        apellido2: string | null;
        idJugador: number;
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
export declare const actualizarInscripcion: (idInscripcion: number, datos: ActualizarInscripcionDto) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
    } | null;
    jugador: {
        nombre: string;
        apellido1: string;
        idJugador: number;
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
export declare const confirmarPago: (idInscripcion: number, datos: ConfirmarPagoDto, idAdminConfirmo: number) => Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
    } | null;
    jugador: {
        nombre: string;
        estado: import(".prisma/client").$Enums.JugadorEstado;
        apellido1: string;
        idJugador: number;
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
export declare const cancelarInscripcion: (idInscripcion: number, motivo?: string) => Promise<{
    idTorneo: number;
    estado: import(".prisma/client").$Enums.InscripcionEstado;
    idJugador: number;
    idInscripcion: number;
}>;
