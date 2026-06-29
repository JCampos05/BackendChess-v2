import { DateTime } from 'luxon';
export declare const obtenerZonaSistema: () => Promise<string>;
export declare const invalidarCacheZona: () => void;
export declare const aUTC: (fecha: Date | string) => Promise<Date>;
export declare const aLocal: (fecha: Date | string) => Promise<DateTime>;
export declare const formatearFecha: (fecha: Date | string, formato?: string) => Promise<string>;
export declare const ahoraLocal: () => Promise<DateTime>;
export declare const ahoraEnZona: (zona: string) => DateTime;
export declare const inscripcionesCerradas: (cierre: Date | string | null) => Promise<boolean>;
export declare const torneoYaPaso: (fechaTorneo: Date | string, diasGracia?: number) => Promise<boolean>;
export declare const calcularEdadParaTorneo: (fechaNacimiento: Date, fechaTorneo: Date, tipo: "anio_torneo" | "fecha_exacta") => number;
export declare const jugadorPuedeInscribirse: (fechaNacimiento: Date, fechaTorneo: Date, edadMinima: number | null, edadMaxima: number | null, tipoValidacion: "anio_torneo" | "fecha_exacta") => {
    puede: boolean;
    edad: number;
    motivo?: string;
};
