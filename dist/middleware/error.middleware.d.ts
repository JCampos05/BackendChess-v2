import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    code?: string | undefined;
    constructor(message: string, statusCode?: number, code?: string | undefined);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
/** 403 — Autenticado pero sin permiso o regla de negocio violada */
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
/** 409 — Duplicado o estado inválido */
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class ValidationError extends AppError {
    constructor(message?: string);
}
/** 403 — Origen bloqueado por política CORS */
export declare class CorsError extends AppError {
    constructor(origin?: string);
}
export declare const errorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
