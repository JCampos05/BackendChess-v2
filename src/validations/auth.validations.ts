import { z } from 'zod';

export const loginSchema = z.object({
    telefono: z
        .string()
        .min(10, 'El teléfono debe tener al menos 10 dígitos')
        .max(15)
        .regex(/^\d+$/, 'El teléfono solo puede contener dígitos'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const cambiarPasswordSchema = z.object({
    password_actual: z.string().min(6),
    password_nueva: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100),
    confirmar_password: z.string().min(6),
}).refine((data) => data.password_nueva === data.confirmar_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar_password'],
});

export const crearUsuarioSchema = z.object({
    telefono: z
        .string()
        .min(10)
        .max(15)
        .regex(/^\d+$/, 'Solo dígitos'),
    password: z
        .string()
        .min(6)
        .max(100),
    rol: z.enum(['adminGral', 'adminTorneo']).default('adminTorneo'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type CambiarPasswordDto = z.infer<typeof cambiarPasswordSchema>;
export type CrearUsuarioDto = z.infer<typeof crearUsuarioSchema>;