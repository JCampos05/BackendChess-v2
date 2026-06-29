import { z } from 'zod';
export declare const filtrosHistorialSchema: z.ZodObject<{
    tipo: z.ZodOptional<z.ZodEnum<["login_exitoso", "login_fallido", "logout", "otro"]>>;
    idUsuario: z.ZodOptional<z.ZodNumber>;
    fechaInicio: z.ZodOptional<z.ZodString>;
    fechaFin: z.ZodOptional<z.ZodString>;
    pagina: z.ZodDefault<z.ZodNumber>;
    limite: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pagina: number;
    limite: number;
    idUsuario?: number | undefined;
    tipo?: "login_exitoso" | "login_fallido" | "logout" | "otro" | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
}, {
    idUsuario?: number | undefined;
    tipo?: "login_exitoso" | "login_fallido" | "logout" | "otro" | undefined;
    pagina?: number | undefined;
    limite?: number | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
}>;
export type FiltrosHistorialDto = z.infer<typeof filtrosHistorialSchema>;
export declare const filtrosLogsSchema: z.ZodObject<{
    nivel: z.ZodOptional<z.ZodEnum<["info", "warning", "error", "otro"]>>;
    entidad: z.ZodOptional<z.ZodString>;
    accion: z.ZodOptional<z.ZodString>;
    idUsuario: z.ZodOptional<z.ZodNumber>;
    fechaInicio: z.ZodOptional<z.ZodString>;
    fechaFin: z.ZodOptional<z.ZodString>;
    pagina: z.ZodDefault<z.ZodNumber>;
    limite: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pagina: number;
    limite: number;
    idUsuario?: number | undefined;
    nivel?: "info" | "error" | "otro" | "warning" | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    accion?: string | undefined;
    entidad?: string | undefined;
}, {
    idUsuario?: number | undefined;
    pagina?: number | undefined;
    limite?: number | undefined;
    nivel?: "info" | "error" | "otro" | "warning" | undefined;
    fechaInicio?: string | undefined;
    fechaFin?: string | undefined;
    accion?: string | undefined;
    entidad?: string | undefined;
}>;
export type FiltrosLogsDto = z.infer<typeof filtrosLogsSchema>;
