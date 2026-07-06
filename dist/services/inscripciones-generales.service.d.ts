type Periodo = 'dia' | 'semana' | 'mes' | 'anio';
export declare const obtenerResumenGeneral: (periodo: Periodo) => Promise<{
    totalInscripciones: number;
    porEstado: {
        estado: string;
        total: number;
    }[];
    torneosActivos: number;
    promedioDiario: number;
}>;
export declare const obtenerEvolucionTemporal: (periodo: Periodo, fechaInicio?: string, fechaFin?: string) => Promise<{
    periodo: string;
    total: number;
}[]>;
export declare const obtenerResumenTorneos: () => Promise<{
    torneosPasados: number;
    torneoActual: {
        idTorneo: number;
        nombre: string | null;
        lugar: string;
        fecha: Date;
        totalInscripciones: number;
    } | null;
    torneosProximos: {
        idTorneo: number;
        nombre: string | null;
        lugar: string;
        fecha: Date;
        totalInscripciones: number;
    }[];
}>;
export declare const obtenerInscripcionesPorTorneo: (limite: number) => Promise<{
    torneo: string;
    total: number;
}[]>;
export declare const obtenerDistribucionCategoria: (idTorneo: number) => Promise<{
    categoria: string;
    total: number;
    costo: number;
}[]>;
export declare const obtenerTorneosParaSelector: () => Promise<{
    idTorneo: number;
    nombre: string;
    fecha: Date;
}[]>;
export {};
