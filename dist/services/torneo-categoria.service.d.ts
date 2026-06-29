import { Prisma } from '@prisma/client';
export interface UpsertTorneoCategoriaDto {
    idTorneo: number;
    idCategoria: number;
    rondas?: number;
    ritmo_juego?: string | null;
    sistema_competencia?: string | null;
    calendario?: object | null;
    premios?: object | null;
    desempates?: object | null;
    activo?: boolean;
    cierre_inscripciones?: Date | string | null;
    cupo_maximo?: number | null;
}
export declare function upsertTorneoCategoria(dto: UpsertTorneoCategoriaDto): Promise<{
    data: {
        categoria: {
            nombre: string;
            idCategoria: number;
            costo: Prisma.Decimal;
            edadMinima: number | null;
            edadMaxima: number | null;
        };
    } & {
        activo: boolean;
        idTorneo: number;
        rondas: number;
        cupo_maximo: number | null;
        cierre_inscripciones: Date | null;
        idCategoria: number;
        ritmo_juego: string | null;
        sistema_competencia: string | null;
        premios: Prisma.JsonValue | null;
        desempates: Prisma.JsonValue | null;
        calendario: Prisma.JsonValue | null;
        idTorneoCat: number;
    };
    created: boolean;
}>;
export declare function getCategoriasByTorneo(idTorneo: number): Promise<({
    categoria: {
        nombre: string;
        idCategoria: number;
        costo: Prisma.Decimal;
        edadMinima: number | null;
        edadMaxima: number | null;
    };
} & {
    activo: boolean;
    idTorneo: number;
    rondas: number;
    cupo_maximo: number | null;
    cierre_inscripciones: Date | null;
    idCategoria: number;
    ritmo_juego: string | null;
    sistema_competencia: string | null;
    premios: Prisma.JsonValue | null;
    desempates: Prisma.JsonValue | null;
    calendario: Prisma.JsonValue | null;
    idTorneoCat: number;
})[]>;
export declare function getTorneoCategoria(idTorneo: number, idCategoria: number): Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
        costo: Prisma.Decimal;
        edadMinima: number | null;
        edadMaxima: number | null;
    };
    torneo: {
        idTorneo: number;
        nombre: string | null;
        lugar: string;
        direccion: string;
        fecha: Date;
    };
} & {
    activo: boolean;
    idTorneo: number;
    rondas: number;
    cupo_maximo: number | null;
    cierre_inscripciones: Date | null;
    idCategoria: number;
    ritmo_juego: string | null;
    sistema_competencia: string | null;
    premios: Prisma.JsonValue | null;
    desempates: Prisma.JsonValue | null;
    calendario: Prisma.JsonValue | null;
    idTorneoCat: number;
}>;
export declare function deleteTorneoCategoria(idTorneo: number, idCategoria: number): Promise<void>;
export declare function toggleActiveTorneoCategoria(idTorneo: number, idCategoria: number, activo?: boolean): Promise<{
    categoria: {
        nombre: string;
        idCategoria: number;
        costo: Prisma.Decimal;
        edadMinima: number | null;
        edadMaxima: number | null;
    };
} & {
    activo: boolean;
    idTorneo: number;
    rondas: number;
    cupo_maximo: number | null;
    cierre_inscripciones: Date | null;
    idCategoria: number;
    ritmo_juego: string | null;
    sistema_competencia: string | null;
    premios: Prisma.JsonValue | null;
    desempates: Prisma.JsonValue | null;
    calendario: Prisma.JsonValue | null;
    idTorneoCat: number;
}>;
