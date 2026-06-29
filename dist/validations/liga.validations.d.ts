import { z } from 'zod';
export declare const crearLigaSchema: z.ZodObject<{
    nombre: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    fecha_inicio: z.ZodString;
    fecha_fin: z.ZodOptional<z.ZodString>;
    lugar: z.ZodOptional<z.ZodString>;
    direccion: z.ZodOptional<z.ZodString>;
    url_maps: z.ZodOptional<z.ZodString>;
    tipo_sistema: z.ZodDefault<z.ZodEnum<["round_robin", "suizo", "grupos"]>>;
    num_grupos: z.ZodDefault<z.ZodNumber>;
    clasifican_por_grupo: z.ZodDefault<z.ZodNumber>;
    idRitmoJuego: z.ZodOptional<z.ZodNumber>;
    costo_inscripcion: z.ZodDefault<z.ZodNumber>;
    cierre_inscripciones: z.ZodOptional<z.ZodString>;
    max_jugadores: z.ZodOptional<z.ZodNumber>;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    fecha_inicio: string;
    tipo_sistema: "round_robin" | "suizo" | "grupos";
    num_grupos: number;
    clasifican_por_grupo: number;
    costo_inscripcion: number;
    notas?: string | undefined;
    lugar?: string | undefined;
    direccion?: string | undefined;
    url_maps?: string | undefined;
    cierre_inscripciones?: string | undefined;
    descripcion?: string | undefined;
    idRitmoJuego?: number | undefined;
    fecha_fin?: string | undefined;
    max_jugadores?: number | undefined;
}, {
    nombre: string;
    fecha_inicio: string;
    notas?: string | undefined;
    lugar?: string | undefined;
    direccion?: string | undefined;
    url_maps?: string | undefined;
    cierre_inscripciones?: string | undefined;
    descripcion?: string | undefined;
    idRitmoJuego?: number | undefined;
    fecha_fin?: string | undefined;
    tipo_sistema?: "round_robin" | "suizo" | "grupos" | undefined;
    num_grupos?: number | undefined;
    clasifican_por_grupo?: number | undefined;
    costo_inscripcion?: number | undefined;
    max_jugadores?: number | undefined;
}>;
export declare const actualizarLigaSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fecha_inicio: z.ZodOptional<z.ZodString>;
    fecha_fin: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lugar: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    direccion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    url_maps: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tipo_sistema: z.ZodOptional<z.ZodDefault<z.ZodEnum<["round_robin", "suizo", "grupos"]>>>;
    num_grupos: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    clasifican_por_grupo: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    idRitmoJuego: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    costo_inscripcion: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    cierre_inscripciones: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    max_jugadores: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    notas: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    notas?: string | undefined;
    nombre?: string | undefined;
    lugar?: string | undefined;
    direccion?: string | undefined;
    url_maps?: string | undefined;
    cierre_inscripciones?: string | undefined;
    descripcion?: string | undefined;
    idRitmoJuego?: number | undefined;
    fecha_inicio?: string | undefined;
    fecha_fin?: string | undefined;
    tipo_sistema?: "round_robin" | "suizo" | "grupos" | undefined;
    num_grupos?: number | undefined;
    clasifican_por_grupo?: number | undefined;
    costo_inscripcion?: number | undefined;
    max_jugadores?: number | undefined;
}, {
    notas?: string | undefined;
    nombre?: string | undefined;
    lugar?: string | undefined;
    direccion?: string | undefined;
    url_maps?: string | undefined;
    cierre_inscripciones?: string | undefined;
    descripcion?: string | undefined;
    idRitmoJuego?: number | undefined;
    fecha_inicio?: string | undefined;
    fecha_fin?: string | undefined;
    tipo_sistema?: "round_robin" | "suizo" | "grupos" | undefined;
    num_grupos?: number | undefined;
    clasifican_por_grupo?: number | undefined;
    costo_inscripcion?: number | undefined;
    max_jugadores?: number | undefined;
}>;
export declare const filtrosLigaSchema: z.ZodObject<{
    pagina: z.ZodDefault<z.ZodNumber>;
    limite: z.ZodDefault<z.ZodNumber>;
    activo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    pagina: number;
    limite: number;
    activo?: boolean | undefined;
}, {
    activo?: boolean | undefined;
    pagina?: number | undefined;
    limite?: number | undefined;
}>;
export declare const crearGrupoSchema: z.ZodObject<{
    nombre: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
    max_jugadores: z.ZodOptional<z.ZodNumber>;
    rondas: z.ZodDefault<z.ZodNumber>;
    premios: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    desempates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    rondas: number;
    descripcion?: string | undefined;
    premios?: Record<string, unknown> | undefined;
    desempates?: string[] | undefined;
    max_jugadores?: number | undefined;
}, {
    nombre: string;
    rondas?: number | undefined;
    descripcion?: string | undefined;
    premios?: Record<string, unknown> | undefined;
    desempates?: string[] | undefined;
    max_jugadores?: number | undefined;
}>;
export declare const actualizarGrupoSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    descripcion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    max_jugadores: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    rondas: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    premios: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    desempates: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    rondas?: number | undefined;
    descripcion?: string | undefined;
    premios?: Record<string, unknown> | undefined;
    desempates?: string[] | undefined;
    max_jugadores?: number | undefined;
}, {
    nombre?: string | undefined;
    rondas?: number | undefined;
    descripcion?: string | undefined;
    premios?: Record<string, unknown> | undefined;
    desempates?: string[] | undefined;
    max_jugadores?: number | undefined;
}>;
export declare const inscribirJugadorLigaSchema: z.ZodObject<{
    idJugador: z.ZodNumber;
    idGrupoLiga: z.ZodNumber;
    monto_pagado: z.ZodDefault<z.ZodNumber>;
    pago_confirmado: z.ZodDefault<z.ZodBoolean>;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    idJugador: number;
    pago_confirmado: boolean;
    monto_pagado: number;
    idGrupoLiga: number;
    notas?: string | undefined;
}, {
    idJugador: number;
    idGrupoLiga: number;
    notas?: string | undefined;
    pago_confirmado?: boolean | undefined;
    monto_pagado?: number | undefined;
}>;
export declare const confirmarPagoLigaSchema: z.ZodObject<{
    monto_pagado: z.ZodNumber;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    monto_pagado: number;
    notas?: string | undefined;
}, {
    monto_pagado: number;
    notas?: string | undefined;
}>;
export declare const crearRondaLigaSchema: z.ZodObject<{
    idGrupoLiga: z.ZodNumber;
    numeroRonda: z.ZodNumber;
    fecha_programada: z.ZodOptional<z.ZodString>;
    hora_inicio: z.ZodOptional<z.ZodString>;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    idGrupoLiga: number;
    numeroRonda: number;
    notas?: string | undefined;
    fecha_programada?: string | undefined;
    hora_inicio?: string | undefined;
}, {
    idGrupoLiga: number;
    numeroRonda: number;
    notas?: string | undefined;
    fecha_programada?: string | undefined;
    hora_inicio?: string | undefined;
}>;
export declare const cambiarEstadoRondaLigaSchema: z.ZodObject<{
    estado: z.ZodEnum<["planificada", "en_curso", "finalizada", "cancelada"]>;
    notas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    estado: "en_curso" | "planificada" | "finalizada" | "cancelada";
    notas?: string | undefined;
}, {
    estado: "en_curso" | "planificada" | "finalizada" | "cancelada";
    notas?: string | undefined;
}>;
export declare const generarMesasLigaSchema: z.ZodObject<{
    idGrupoLiga: z.ZodNumber;
    numeroRonda: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    idGrupoLiga: number;
    numeroRonda: number;
}, {
    idGrupoLiga: number;
    numeroRonda: number;
}>;
export declare const registrarPartidaLigaSchema: z.ZodObject<{
    idJugadorGanador: z.ZodOptional<z.ZodNumber>;
    resultado: z.ZodEnum<["1-0", "0-1", "0.5-0.5", "0-0"]>;
    tipo_finalizacion: z.ZodOptional<z.ZodEnum<["jaquemate", "tiempo", "rendicion", "ilegales", "incomparecencia", "empate_comun", "empate_material", "empate_50_movidas", "empate_triple_repeticion", "otro"]>>;
    descripcion_finalizacion: z.ZodOptional<z.ZodString>;
    duracion_minutos: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    resultado: "1-0" | "0-1" | "0.5-0.5" | "0-0";
    idJugadorGanador?: number | undefined;
    tipo_finalizacion?: "otro" | "jaquemate" | "tiempo" | "rendicion" | "ilegales" | "incomparecencia" | "empate_comun" | "empate_material" | "empate_50_movidas" | "empate_triple_repeticion" | undefined;
    descripcion_finalizacion?: string | undefined;
    duracion_minutos?: number | undefined;
}, {
    resultado: "1-0" | "0-1" | "0.5-0.5" | "0-0";
    idJugadorGanador?: number | undefined;
    tipo_finalizacion?: "otro" | "jaquemate" | "tiempo" | "rendicion" | "ilegales" | "incomparecencia" | "empate_comun" | "empate_material" | "empate_50_movidas" | "empate_triple_repeticion" | undefined;
    descripcion_finalizacion?: string | undefined;
    duracion_minutos?: number | undefined;
}>;
export type CrearLigaDto = z.infer<typeof crearLigaSchema>;
export type ActualizarLigaDto = z.infer<typeof actualizarLigaSchema>;
export type FiltrosLigaDto = z.infer<typeof filtrosLigaSchema>;
export type CrearGrupoDto = z.infer<typeof crearGrupoSchema>;
export type ActualizarGrupoDto = z.infer<typeof actualizarGrupoSchema>;
export type InscribirJugadorLigaDto = z.infer<typeof inscribirJugadorLigaSchema>;
export type ConfirmarPagoLigaDto = z.infer<typeof confirmarPagoLigaSchema>;
export type CrearRondaLigaDto = z.infer<typeof crearRondaLigaSchema>;
export type CambiarEstadoRondaLigaDto = z.infer<typeof cambiarEstadoRondaLigaSchema>;
export type GenerarMesasLigaDto = z.infer<typeof generarMesasLigaSchema>;
export type RegistrarPartidaLigaDto = z.infer<typeof registrarPartidaLigaSchema>;
