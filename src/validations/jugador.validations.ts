import { z } from 'zod';

export const crearJugadorSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    apellido1: z.string().min(1, 'El primer apellido es requerido').max(100),
    apellido2: z.string().max(100).optional(),
    telefono: z.string().max(15).regex(/^\d+$/, 'Solo dígitos').optional(),
    fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
    idCategoria: z.number().int().positive().optional(),
    notas: z.string().optional(),
    rating: z.number().int().min(0).max(9999).default(0),
});

export const actualizarJugadorSchema = z.object({
    nombre: z.string().min(1).max(100).optional(),
    apellido1: z.string().min(1).max(100).optional(),
    apellido2: z.string().max(100).optional(),
    telefono: z.string().max(15).regex(/^\d+$/, 'Solo dígitos').optional(),
    fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
    idCategoria: z.number().int().positive().optional(),
    notas: z.string().optional(),
    rating: z.number().int().min(0).max(9999).optional(),
    // Schema v2.1.0: pendiente_pago | activo | inactivo
    estado: z.enum(['pendiente_pago', 'activo', 'inactivo']).optional(),
});

export const filtrosJugadorSchema = z.object({
    nombre: z.string().optional(),
    // Schema v2.1.0: pendiente_pago | activo | inactivo
    estado: z.enum(['pendiente_pago', 'activo', 'inactivo']).optional(),
    idCategoria: z.coerce.number().int().positive().optional(),
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(20),
});

export type CrearJugadorDto = z.infer<typeof crearJugadorSchema>;
export type ActualizarJugadorDto = z.infer<typeof actualizarJugadorSchema>;
export type FiltrosJugadorDto = z.infer<typeof filtrosJugadorSchema>;