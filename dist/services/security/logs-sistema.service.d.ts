import { FiltrosLogsDto } from '../../validations/security/seguridad.validations';
import { PaginatedResult } from '../../types';
export declare const listarLogs: (filtros: FiltrosLogsDto) => Promise<PaginatedResult<unknown>>;
export declare const obtenerEstadisticas: (fechaInicio?: string, fechaFin?: string) => Promise<{
    porNivel: {
        nivel: import(".prisma/client").$Enums.LogNivel;
        total: number;
    }[];
    porEntidad: {
        entidad: string;
        total: number;
    }[];
    porUsuario: {
        idUsuario: number | null;
        telefono: string | null;
        total: number;
    }[];
    porDia: {
        dia: string;
        total: number;
    }[];
    accionesFrecuentes: {
        accion: string;
        total: number;
    }[];
}>;
export declare const obtenerPorEntidad: (entidad: string, idEntidad: number) => Promise<({
    usuario: {
        idUsuario: number;
        telefono: string;
    } | null;
} & {
    ip: string | null;
    idUsuario: number | null;
    fecha: Date;
    nivel: import(".prisma/client").$Enums.LogNivel;
    accion: string;
    entidad: string;
    idEntidad: number | null;
    detalles: string | null;
    idLog: number;
})[]>;
