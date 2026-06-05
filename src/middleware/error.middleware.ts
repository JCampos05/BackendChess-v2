import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// ── Clases de error ──────────────────────────────────────────

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

/** 403 — Origen bloqueado por política CORS */
export class CorsError extends AppError {
    constructor(origin?: string) {
        super(
            origin ? `Origen no permitido: ${origin}` : 'Origen no permitido por política CORS',
            403,
            'CORS_BLOCKED'
        );
    }
}

// ── Códigos de error Prisma manejados ────────────────────────
// P2002 unique | P2003 FK | P2011 null | P2025 not found
// P2000/P2005/P2006/P2007 datos inválidos

const PRISMA_ERROR_MAP: Record<string, { status: number; mensaje: string; code: string }> = {
    P2002: { status: 409, mensaje: 'Ya existe un registro con esos datos',              code: 'DUPLICATE_ENTRY'  },
    P2003: { status: 409, mensaje: 'No se puede completar: referencia inválida',        code: 'FK_CONSTRAINT'    },
    P2011: { status: 400, mensaje: 'Un campo obligatorio no puede estar vacío',         code: 'NULL_CONSTRAINT'  },
    P2025: { status: 404, mensaje: 'Registro no encontrado',                            code: 'NOT_FOUND'        },
    P2000: { status: 400, mensaje: 'El valor excede la longitud máxima del campo',      code: 'VALUE_TOO_LONG'   },
    P2005: { status: 400, mensaje: 'El valor proporcionado no es válido para el campo', code: 'INVALID_VALUE'    },
    P2006: { status: 400, mensaje: 'El valor proporcionado no es válido para el campo', code: 'INVALID_VALUE'    },
    P2007: { status: 400, mensaje: 'Error de validación de datos',                      code: 'DATA_VALIDATION'  },
};

// ── Handler global de errores ────────────────────────────────
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Validación Zod — detalle por campo
    if (err instanceof ZodError) {
        const errores = err.errors.map((e) =>
            e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message
        );
        res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores, code: 'VALIDATION_ERROR' });
        return;
    }

    // Errores de aplicación controlados (AppError y subclases, incluye CorsError)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ ok: false, mensaje: err.message, code: err.code });
        return;
    }

    // Errores de Prisma
    const prismaCode = (err as { code?: string }).code;
    if (prismaCode && prismaCode in PRISMA_ERROR_MAP) {
        const mapped = PRISMA_ERROR_MAP[prismaCode];
        res.status(mapped.status).json({ ok: false, mensaje: mapped.mensaje, code: mapped.code });
        return;
    }

    // Error inesperado
    console.error('Error no controlado:', err);
    res.status(500).json({
        ok: false,
        mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
    });
};