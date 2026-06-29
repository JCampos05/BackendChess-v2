import { Request } from 'express';
export declare const loggerService: {
    info: (accion: string, entidad: string, idEntidad: number | null, detalles: string, idUsuario?: number | null, req?: Request) => Promise<void>;
    warning: (accion: string, entidad: string, idEntidad: number | null, detalles: string, idUsuario?: number | null, req?: Request) => Promise<void>;
    error: (accion: string, entidad: string, idEntidad: number | null, detalles: string, idUsuario?: number | null, req?: Request) => Promise<void>;
    otro: (accion: string, entidad: string, idEntidad: number | null, detalles: string, idUsuario?: number | null, req?: Request) => Promise<void>;
};
