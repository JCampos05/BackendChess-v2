import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// ── Clases de error ──────────────────────────────────────────
// Todas las clases aquí — servicios importan desde este archivo

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

/** 403 — Autenticado pero sin permiso o regla de negocio violada */
export class ForbiddenError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403, 'FORBIDDEN');
    }
}

/** 409 — Duplicado o estado inválido */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Datos inválidos') {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

// ── Handler global de errores ────────────────────────────────
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Error de validación Zod — devuelve array detallado de campos
    if (err instanceof ZodError) {
        const errores = err.errors.map((e) =>
            e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message
        );
        res.status(400).json({
            ok: false,
            mensaje: 'Datos inválidos',
            errores,
            code: 'VALIDATION_ERROR',
        });
        return;
    }

    // Error de aplicación controlado (AppError y todas sus subclases)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            ok: false,
            mensaje: err.message,
            code: err.code,
        });
        return;
    }

    // Error de Prisma — constraint único violado
    if ((err as { code?: string }).code === 'P2002') {
        res.status(409).json({
            ok: false,
            mensaje: 'Ya existe un registro con esos datos',
            code: 'DUPLICATE_ENTRY',
        });
        return;
    }

    // Error de Prisma — registro no encontrado (ej: update/delete sin match)
    if ((err as { code?: string }).code === 'P2025') {
        res.status(404).json({
            ok: false,
            mensaje: 'Registro no encontrado',
            code: 'NOT_FOUND',
        });
        return;
    }

    // Error inesperado
    console.error('Error no controlado:', err);
    res.status(500).json({
        ok: false,
        mensaje:
            process.env.NODE_ENV === 'development'
                ? err.message
                : 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
    });
};