import { z } from 'zod';

// ── Historial de accesos ──────────────────────────────────────

export const filtrosHistorialSchema = z.object({
    tipo: z.enum(['login_exitoso', 'login_fallido', 'logout', 'otro']).optional(),
    idUsuario: z.coerce.number().int().positive().optional(),
    fechaInicio: z.string().datetime({ offset: true }).optional(),
    fechaFin: z.string().datetime({ offset: true }).optional(),
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(100),
});

export type FiltrosHistorialDto = z.infer<typeof filtrosHistorialSchema>;

// ── Logs del sistema ─────────────────────────────────────────

export const filtrosLogsSchema = z.object({
    nivel: z.enum(['info', 'warning', 'error', 'otro']).optional(),
    entidad: z.string().max(50).optional(),
    accion: z.string().max(100).optional(),
    idUsuario: z.coerce.number().int().positive().optional(),
    fechaInicio: z.string().datetime({ offset: true }).optional(),
    fechaFin: z.string().datetime({ offset: true }).optional(),
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(100),
});

export type FiltrosLogsDto = z.infer<typeof filtrosLogsSchema>;