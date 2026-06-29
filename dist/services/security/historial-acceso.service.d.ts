import { FiltrosHistorialDto } from '../../validations/security/seguridad.validations';
import { PaginatedResult } from '../../types';
export declare const listarHistorial: (filtros: FiltrosHistorialDto) => Promise<PaginatedResult<unknown>>;
export declare const obtenerEstadisticas: (fechaInicio?: string, fechaFin?: string) => Promise<{
    porTipo: {
        tipo: import(".prisma/client").$Enums.HistorialAccesoTipo;
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
}>;
