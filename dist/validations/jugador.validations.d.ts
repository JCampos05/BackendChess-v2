import { z } from 'zod';
export declare const crearJugadorSchema: z.ZodObject<{
    nombre: z.ZodString;
    apellido1: z.ZodString;
    apellido2: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    fecha_nacimiento: z.ZodOptional<z.ZodString>;
    idCategoria: z.ZodOptional<z.ZodNumber>;
    notas: z.ZodOptional<z.ZodString>;
    rating: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido1: string;
    rating: number;
    telefono?: string | undefined;
    notas?: string | undefined;
    apellido2?: string | undefined;
    fecha_nacimiento?: string | undefined;
    idCategoria?: number | undefined;
}, {
    nombre: string;
    apellido1: string;
    telefono?: string | undefined;
    notas?: string | undefined;
    apellido2?: string | undefined;
    fecha_nacimiento?: string | undefined;
    idCategoria?: number | undefined;
    rating?: number | undefined;
}>;
export declare const actualizarJugadorSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    apellido1: z.ZodOptional<z.ZodString>;
    apellido2: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    fecha_nacimiento: z.ZodOptional<z.ZodString>;
    idCategoria: z.ZodOptional<z.ZodNumber>;
    notas: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    estado: z.ZodOptional<z.ZodEnum<["pendiente_pago", "activo", "inactivo"]>>;
}, "strip", z.ZodTypeAny, {
    telefono?: string | undefined;
    notas?: string | undefined;
    nombre?: string | undefined;
    estado?: "activo" | "pendiente_pago" | "inactivo" | undefined;
    apellido1?: string | undefined;
    apellido2?: string | undefined;
    fecha_nacimiento?: string | undefined;
    idCategoria?: number | undefined;
    rating?: number | undefined;
}, {
    telefono?: string | undefined;
    notas?: string | undefined;
    nombre?: string | undefined;
    estado?: "activo" | "pendiente_pago" | "inactivo" | undefined;
    apellido1?: string | undefined;
    apellido2?: string | undefined;
    fecha_nacimiento?: string | undefined;
    idCategoria?: number | undefined;
    rating?: number | undefined;
}>;
export declare const filtrosJugadorSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    estado: z.ZodOptional<z.ZodEnum<["pendiente_pago", "activo", "inactivo"]>>;
    idCategoria: z.ZodOptional<z.ZodNumber>;
    pagina: z.ZodDefault<z.ZodNumber>;
    limite: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pagina: number;
    limite: number;
    nombre?: string | undefined;
    estado?: "activo" | "pendiente_pago" | "inactivo" | undefined;
    idCategoria?: number | undefined;
}, {
    nombre?: string | undefined;
    estado?: "activo" | "pendiente_pago" | "inactivo" | undefined;
    idCategoria?: number | undefined;
    pagina?: number | undefined;
    limite?: number | undefined;
}>;
export type CrearJugadorDto = z.infer<typeof crearJugadorSchema>;
export type ActualizarJugadorDto = z.infer<typeof actualizarJugadorSchema>;
export type FiltrosJugadorDto = z.infer<typeof filtrosJugadorSchema>;
