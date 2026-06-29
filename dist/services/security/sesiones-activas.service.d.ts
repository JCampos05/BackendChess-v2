import { Request } from 'express';
interface UsuarioReq {
    idUsuario: number;
    telefono: string;
    rol: string;
}
export declare const obtenerActivas: () => Promise<({
    usuario: {
        idUsuario: number;
        telefono: string;
    };
} & {
    token: string;
    ip: string | null;
    navegador: string | null;
    dispositivo: string | null;
    ultimo_acceso: Date;
    fecha_expiracion: Date | null;
    activa: number;
    idSesion: number;
    idUsuario: number;
})[]>;
export declare const obtenerPorUsuario: (idUsuario: number) => Promise<{
    token: string;
    ip: string | null;
    navegador: string | null;
    dispositivo: string | null;
    ultimo_acceso: Date;
    fecha_expiracion: Date | null;
    activa: number;
    idSesion: number;
    idUsuario: number;
}[]>;
export declare const cerrarSesion: (idSesion: number, tokenActual: string, usuarioReq: UsuarioReq, req?: Request) => Promise<void>;
export declare const cerrarTodasDeUsuario: (idUsuario: number, tokenActual: string, usuarioReq: UsuarioReq, confirmar: boolean | undefined, req?: Request) => Promise<number>;
export declare const limpiarExpiradas: (tokenActual: string, usuarioReq: UsuarioReq, req?: Request) => Promise<number>;
export {};
