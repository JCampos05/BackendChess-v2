export declare const capitalizarNombre: (texto: string) => string;
export declare const normalizarNombreJugador: (datos: {
    nombre: string;
    apellido1: string;
    apellido2?: string | null;
}) => {
    nombre: string;
    apellido1: string;
    apellido2?: string;
};
export declare const nombreCompleto: (nombre: string, apellido1: string, apellido2?: string | null) => string;
export declare const mismoJugador: (a: {
    nombre: string;
    apellido1: string;
    apellido2?: string | null;
    fecha_nacimiento?: Date | null;
}, b: {
    nombre: string;
    apellido1: string;
    apellido2?: string | null;
    fecha_nacimiento?: Date | null;
}) => boolean;
