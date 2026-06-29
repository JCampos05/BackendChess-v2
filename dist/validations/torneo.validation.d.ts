import { z } from 'zod';
export declare const crearTorneoSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    lugar: z.ZodString;
    direccion: z.ZodString;
    url_maps: z.ZodOptional<z.ZodString>;
    fecha: z.ZodString;
    hora: z.ZodString;
    rondas: z.ZodDefault<z.ZodNumber>;
    cupo_maximo: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    notas: z.ZodOptional<z.ZodString>;
    cierre_inscripciones: z.ZodOptional<z.ZodString>;
    idZonaHoraria: z.ZodOptional<z.ZodNumber>;
    idSistemaPago: z.ZodOptional<z.ZodNumber>;
    es_actual: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    lugar: string;
    direccion: string;
    fecha: string;
    hora: string;
    es_actual: boolean;
    rondas: number;
    notas?: string | undefined;
    nombre?: string | undefined;
    url_maps?: string | undefined;
    cupo_maximo?: number | null | undefined;
    cierre_inscripciones?: string | undefined;
    idZonaHoraria?: number | undefined;
    idSistemaPago?: number | undefined;
}, {
    lugar: string;
    direccion: string;
    fecha: string;
    hora: string;
    notas?: string | undefined;
    nombre?: string | undefined;
    url_maps?: string | undefined;
    es_actual?: boolean | undefined;
    rondas?: number | undefined;
    cupo_maximo?: number | null | undefined;
    cierre_inscripciones?: string | undefined;
    idZonaHoraria?: number | undefined;
    idSistemaPago?: number | undefined;
}>;
export declare const actualizarTorneoSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lugar: z.ZodOptional<z.ZodString>;
    direccion: z.ZodOptional<z.ZodString>;
    url_maps: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fecha: z.ZodOptional<z.ZodString>;
    hora: z.ZodOptional<z.ZodString>;
    rondas: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    cupo_maximo: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    notas: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cierre_inscripciones: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    idZonaHoraria: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    idSistemaPago: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    es_actual: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    notas?: string | undefined;
    nombre?: string | undefined;
    lugar?: string | undefined;
    direccion?: string | undefined;
    url_maps?: string | undefined;
    fecha?: string | undefined;
    hora?: string | undefined;
    es_actual?: boolean | undefined;
    rondas?: number | undefined;
    cupo_maximo?: number | null | undefined;
    cierre_inscripciones?: string | undefined;
    idZonaHoraria?: number | undefined;
    idSistemaPago?: number | undefined;
}, {
    notas?: string | undefined;
    nombre?: string | undefined;
    lugar?: string | undefined;
    direccion?: string | undefined;
    url_maps?: string | undefined;
    fecha?: string | undefined;
    hora?: string | undefined;
    es_actual?: boolean | undefined;
    rondas?: number | undefined;
    cupo_maximo?: number | null | undefined;
    cierre_inscripciones?: string | undefined;
    idZonaHoraria?: number | undefined;
    idSistemaPago?: number | undefined;
}>;
export declare const cambiarEstadoSchema: z.ZodObject<{
    estado: z.ZodEnum<["borrador", "publicado", "en_curso", "finalizado", "cancelado"]>;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    estado: "borrador" | "publicado" | "en_curso" | "finalizado" | "cancelado";
    notas?: string | undefined;
}, {
    estado: "borrador" | "publicado" | "en_curso" | "finalizado" | "cancelado";
    notas?: string | undefined;
}>;
export declare const filtrosTorneoSchema: z.ZodObject<{
    pagina: z.ZodDefault<z.ZodNumber>;
    limite: z.ZodDefault<z.ZodNumber>;
    activo: z.ZodOptional<z.ZodBoolean>;
    estado: z.ZodOptional<z.ZodEnum<["borrador", "publicado", "en_curso", "finalizado", "cancelado"]>>;
    es_actual: z.ZodOptional<z.ZodBoolean>;
    soloConCategorias: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    pagina: number;
    limite: number;
    activo?: boolean | undefined;
    estado?: "borrador" | "publicado" | "en_curso" | "finalizado" | "cancelado" | undefined;
    es_actual?: boolean | undefined;
    soloConCategorias?: boolean | undefined;
}, {
    activo?: boolean | undefined;
    estado?: "borrador" | "publicado" | "en_curso" | "finalizado" | "cancelado" | undefined;
    es_actual?: boolean | undefined;
    pagina?: number | undefined;
    limite?: number | undefined;
    soloConCategorias?: boolean | undefined;
}>;
export declare const asignarCategoriaSchema: z.ZodObject<{
    idCategoria: z.ZodNumber;
    rondas: z.ZodOptional<z.ZodNumber>;
    ritmo_juego: z.ZodOptional<z.ZodString>;
    sistema_competencia: z.ZodOptional<z.ZodString>;
    premios: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    desempates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    calendario: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    idCategoria: number;
    rondas?: number | undefined;
    ritmo_juego?: string | undefined;
    sistema_competencia?: string | undefined;
    premios?: Record<string, unknown> | undefined;
    desempates?: string[] | undefined;
    calendario?: Record<string, unknown> | undefined;
}, {
    idCategoria: number;
    rondas?: number | undefined;
    ritmo_juego?: string | undefined;
    sistema_competencia?: string | undefined;
    premios?: Record<string, unknown> | undefined;
    desempates?: string[] | undefined;
    calendario?: Record<string, unknown> | undefined;
}>;
export declare const actualizarCategoriaSchema: z.ZodObject<{
    rondas: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    ritmo_juego: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sistema_competencia: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    premios: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    desempates: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    calendario: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    rondas?: number | undefined;
    ritmo_juego?: string | undefined;
    sistema_competencia?: string | undefined;
    premios?: Record<string, unknown> | undefined;
    desempates?: string[] | undefined;
    calendario?: Record<string, unknown> | undefined;
}, {
    rondas?: number | undefined;
    ritmo_juego?: string | undefined;
    sistema_competencia?: string | undefined;
    premios?: Record<string, unknown> | undefined;
    desempates?: string[] | undefined;
    calendario?: Record<string, unknown> | undefined;
}>;
export declare const asignarPatrocinadorSchema: z.ZodObject<{
    idPatrocinador: z.ZodNumber;
    nivel: z.ZodDefault<z.ZodEnum<["principal", "oro", "plata", "bronce", "general"]>>;
    orden: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    idPatrocinador: number;
    nivel: "principal" | "oro" | "plata" | "bronce" | "general";
    orden: number;
}, {
    idPatrocinador: number;
    nivel?: "principal" | "oro" | "plata" | "bronce" | "general" | undefined;
    orden?: number | undefined;
}>;
export declare const asignarAdminSchema: z.ZodObject<{
    idUsuario: z.ZodNumber;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    idUsuario: number;
    notas?: string | undefined;
}, {
    idUsuario: number;
    notas?: string | undefined;
}>;
export type CrearTorneoDto = z.infer<typeof crearTorneoSchema>;
export type ActualizarTorneoDto = z.infer<typeof actualizarTorneoSchema>;
export type CambiarEstadoDto = z.infer<typeof cambiarEstadoSchema>;
export type FiltrosTorneoDto = z.infer<typeof filtrosTorneoSchema>;
export type AsignarCategoriaDto = z.infer<typeof asignarCategoriaSchema>;
export type ActualizarCategoriaDto = z.infer<typeof actualizarCategoriaSchema>;
export type AsignarPatrocinadorDto = z.infer<typeof asignarPatrocinadorSchema>;
export type AsignarAdminDto = z.infer<typeof asignarAdminSchema>;
