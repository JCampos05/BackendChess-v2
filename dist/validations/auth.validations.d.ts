import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    telefono: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    telefono: string;
    password: string;
}, {
    telefono: string;
    password: string;
}>;
export declare const cambiarPasswordSchema: z.ZodEffects<z.ZodObject<{
    password_actual: z.ZodString;
    password_nueva: z.ZodString;
    confirmar_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password_actual: string;
    password_nueva: string;
    confirmar_password: string;
}, {
    password_actual: string;
    password_nueva: string;
    confirmar_password: string;
}>, {
    password_actual: string;
    password_nueva: string;
    confirmar_password: string;
}, {
    password_actual: string;
    password_nueva: string;
    confirmar_password: string;
}>;
export declare const crearUsuarioSchema: z.ZodObject<{
    telefono: z.ZodString;
    password: z.ZodString;
    rol: z.ZodDefault<z.ZodEnum<["adminGral", "adminTorneo"]>>;
}, "strip", z.ZodTypeAny, {
    telefono: string;
    password: string;
    rol: "adminGral" | "adminTorneo";
}, {
    telefono: string;
    password: string;
    rol?: "adminGral" | "adminTorneo" | undefined;
}>;
export type LoginDto = z.infer<typeof loginSchema>;
export type CambiarPasswordDto = z.infer<typeof cambiarPasswordSchema>;
export type CrearUsuarioDto = z.infer<typeof crearUsuarioSchema>;
