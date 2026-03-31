import { Request } from 'express';

export interface JwtPayload {
    idUsuario: number;
    telefono: string;
    rol: 'adminGral' | 'adminTorneo';
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    usuario?: {
        idUsuario: number;
        telefono: string;
        rol: 'adminGral' | 'adminTorneo';
    };
    token?: string;
    idUsuario?: number;
    sesion?: {
        idSesion: number;
        idUsuario: number;
        token: string;
        activa: number;
        fecha_expiracion: Date | null;
    };
}

export interface ApiResponse<T = unknown> {
    ok: boolean;
    mensaje?: string;
    data?: T;
    errores?: string[];
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
}