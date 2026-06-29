export interface CreateCategoriaDto {
    nombre: string;
    costo: number;
    nota?: string | null;
    edadMinima?: number | null;
    edadMaxima?: number | null;
}
export interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> {
}
export interface CreateRitmoJuegoDto {
    nombre: string;
    descripcion?: string | null;
    minutos: number;
    incremento?: number;
    activo?: boolean;
}
export interface UpdateRitmoJuegoDto extends Partial<CreateRitmoJuegoDto> {
}
export interface CreateSistemaDto {
    nombre: string;
    descripcion?: string | null;
    activo?: boolean;
}
export interface UpdateSistemaDto extends Partial<CreateSistemaDto> {
}
export interface CreateSistemaPagoDto {
    nombreCuenta: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
    telefono: string;
}
export interface UpdateSistemaPagoDto extends Partial<CreateSistemaPagoDto> {
    activo?: boolean;
}
export declare function getAllCategorias(orden?: string, direccion?: 'asc' | 'desc'): Promise<{
    nombre: string;
    idCategoria: number;
    costo: import("@prisma/client/runtime/library").Decimal;
    nota: string | null;
    edadMinima: number | null;
    edadMaxima: number | null;
    tipo_validacion_edad: import(".prisma/client").$Enums.TipoValidacionEdad;
}[]>;
export declare function getCategoriaById(id: number): Promise<{
    nombre: string;
    idCategoria: number;
    costo: import("@prisma/client/runtime/library").Decimal;
    nota: string | null;
    edadMinima: number | null;
    edadMaxima: number | null;
    tipo_validacion_edad: import(".prisma/client").$Enums.TipoValidacionEdad;
}>;
export declare function createCategoria(dto: CreateCategoriaDto): Promise<{
    nombre: string;
    idCategoria: number;
    costo: import("@prisma/client/runtime/library").Decimal;
    nota: string | null;
    edadMinima: number | null;
    edadMaxima: number | null;
    tipo_validacion_edad: import(".prisma/client").$Enums.TipoValidacionEdad;
}>;
export declare function updateCategoria(id: number, dto: UpdateCategoriaDto): Promise<{
    nombre: string;
    idCategoria: number;
    costo: import("@prisma/client/runtime/library").Decimal;
    nota: string | null;
    edadMinima: number | null;
    edadMaxima: number | null;
    tipo_validacion_edad: import(".prisma/client").$Enums.TipoValidacionEdad;
}>;
export declare function deleteCategoria(id: number): Promise<void>;
export declare function getAllRitmos(activo?: boolean, orden?: string, direccion?: 'asc' | 'desc'): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idRitmoJuego: number;
    minutos: number;
    incremento: number;
}[]>;
export declare function getRitmoById(id: number): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idRitmoJuego: number;
    minutos: number;
    incremento: number;
}>;
export declare function createRitmo(dto: CreateRitmoJuegoDto): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idRitmoJuego: number;
    minutos: number;
    incremento: number;
}>;
export declare function updateRitmo(id: number, dto: UpdateRitmoJuegoDto): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idRitmoJuego: number;
    minutos: number;
    incremento: number;
}>;
export declare function deleteRitmo(id: number): Promise<void>;
export declare function getAllSistemasCompetencia(activo?: boolean, orden?: string, direccion?: 'asc' | 'desc'): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idSisCompetencia: number;
}[]>;
export declare function getSistemaCompetenciaById(id: number): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idSisCompetencia: number;
}>;
export declare function createSistemaCompetencia(dto: CreateSistemaDto): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idSisCompetencia: number;
}>;
export declare function updateSistemaCompetencia(id: number, dto: UpdateSistemaDto): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idSisCompetencia: number;
}>;
export declare function deleteSistemaCompetencia(id: number): Promise<void>;
export declare function getAllSistemasDesempate(activo?: boolean, orden?: string, direccion?: 'asc' | 'desc'): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idDesempate: number;
}[]>;
export declare function getSistemaDesempateById(id: number): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idDesempate: number;
}>;
export declare function createSistemaDesempate(dto: CreateSistemaDto): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idDesempate: number;
}>;
export declare function updateSistemaDesempate(id: number, dto: UpdateSistemaDto): Promise<{
    activo: boolean;
    nombre: string;
    fecha_creacion: Date | null;
    descripcion: string | null;
    idDesempate: number;
}>;
export declare function deleteSistemaDesempate(id: number): Promise<void>;
export declare function getAllSistemasPago(activo?: boolean): Promise<{
    telefono: string;
    activo: boolean;
    fecha_registro: Date | null;
    idSistemaPago: number;
    actualizacion: Date | null;
    nombreCuenta: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
}[]>;
export declare function getSistemasPagoActivos(): Promise<{
    telefono: string;
    activo: boolean;
    fecha_registro: Date | null;
    idSistemaPago: number;
    actualizacion: Date | null;
    nombreCuenta: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
}[]>;
export declare function getSistemaPagoById(id: number): Promise<{
    telefono: string;
    activo: boolean;
    fecha_registro: Date | null;
    idSistemaPago: number;
    actualizacion: Date | null;
    nombreCuenta: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
}>;
export declare function createSistemaPago(dto: CreateSistemaPagoDto): Promise<{
    telefono: string;
    activo: boolean;
    fecha_registro: Date | null;
    idSistemaPago: number;
    actualizacion: Date | null;
    nombreCuenta: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
}>;
export declare function updateSistemaPago(id: number, dto: UpdateSistemaPagoDto): Promise<{
    telefono: string;
    activo: boolean;
    fecha_registro: Date | null;
    idSistemaPago: number;
    actualizacion: Date | null;
    nombreCuenta: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
}>;
export declare function deleteSistemaPago(id: number): Promise<void>;
export declare function toggleActiveSistemaPago(id: number, activo?: boolean): Promise<{
    telefono: string;
    activo: boolean;
    fecha_registro: Date | null;
    idSistemaPago: number;
    actualizacion: Date | null;
    nombreCuenta: string;
    banco: string;
    numeroCuenta: string;
    clabe: string;
}>;
