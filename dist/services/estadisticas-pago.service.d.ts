export declare const getEstadisticasGenerales: (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
}) => Promise<{
    total_inscripciones: number;
    pagos_completos: number;
    pagos_parciales: number;
    sin_pago: number;
    total_recaudado: number;
    total_esperado: number;
    promedio_pago: number;
    porcentaje_recaudacion: number;
}>;
export declare const getEstadisticasPorCategoria: (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
}) => Promise<{
    idCategoria: number;
    categoria: string;
    costo_categoria: number;
    total_inscripciones: number;
    pagos_completos: number;
    pagos_parciales: number;
    sin_pago: number;
    total_recaudado: number;
    total_esperado: number;
    porcentaje_recaudacion: number;
}[]>;
export declare const getEstadisticasPorTorneo: (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
}) => Promise<{
    idTorneo: number;
    torneo: string | null;
    fecha: Date;
    lugar: string;
    total_inscripciones: number;
    pagos_completos: number;
    pagos_parciales: number;
    total_recaudado: number;
    total_esperado: number;
    porcentaje_recaudacion: number;
}[]>;
export declare const getEvolucionTemporal: (params: {
    idTorneo?: number;
    fechaInicio?: string;
    fechaFin?: string;
    agrupacion?: "dia" | "semana" | "mes" | "anio";
}) => Promise<{
    periodo: string;
    total_inscripciones: number;
    pagos_completos: number;
    pagos_parciales: number;
    total_recaudado: number;
    total_esperado: number;
}[]>;
export declare const getComparativaAnual: (params: {
    idTorneo?: number;
}) => Promise<{
    anio: number;
    total_inscripciones: number;
    total_recaudado: number;
    promedio_pago: number;
}[]>;
