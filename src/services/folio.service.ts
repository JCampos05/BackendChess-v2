import { Prisma } from '@prisma/client';
import { slugify } from '../utils/slug';

// Folio de comprobante de inscripción: CMAA-T-PATR26-0042 (torneo) / CMAA-L-PRIM26-0007 (liga).
// El número es el orden de inscripción dentro del evento y sale de un contador
// atómico (incremento dentro de la transacción de la inscripción): dos inscripciones
// simultáneas nunca reciben el mismo número y un número cancelado no se reutiliza.

const PALABRAS_GENERICAS = new Set(['torneo', 'liga', 'de', 'del', 'la', 'el', 'los', 'las', 'y']);
const PREFIJO_FOLIO = 'CMAA';

export interface FolioAsignado {
    numero_inscripcion: number;
    folio: string;
}

/**
 * Abrevia el slug de un evento: quita palabras genéricas, toma las 4 primeras letras
 * de la primera palabra restante y le suma los 2 últimos dígitos del año si el slug
 * trae uno. `torneo-patrio-2026` → `PATR26`. Sin slug usa el nombre; sin nada, `EVT`.
 */
export const abreviarSlug = (slug: string | null | undefined, nombre?: string | null): string => {
    const base = slug?.trim() || (nombre ? slugify(nombre) : '');
    const tokens = base.split('-').filter(Boolean);

    const anio = tokens.find(t => /^(19|20)\d{2}$/.test(t));
    const palabra = tokens.find(t => !PALABRAS_GENERICAS.has(t) && !/^\d+$/.test(t));

    const letras = (palabra ?? 'evt').replace(/[^a-z0-9]/g, '').slice(0, 4).toUpperCase();
    return `${letras}${anio ? anio.slice(2) : ''}`;
};

export const construirFolio = (tipo: 'T' | 'L', abreviatura: string, numero: number): string =>
    `${PREFIJO_FOLIO}-${tipo}-${abreviatura}-${String(numero).padStart(4, '0')}`;

/** Reserva el siguiente número de inscripción del torneo y arma su folio. Debe llamarse dentro de la transacción que crea la inscripción. */
export const asignarFolioTorneo = async (
    tx: Prisma.TransactionClient,
    idTorneo: number
): Promise<FolioAsignado> => {
    const torneo = await tx.torneo.update({
        where: { idTorneo },
        data: { consecutivo_inscripciones: { increment: 1 } },
        select: { consecutivo_inscripciones: true, slug: true, nombre: true },
    });
    const numero = torneo.consecutivo_inscripciones;
    return {
        numero_inscripcion: numero,
        folio: construirFolio('T', abreviarSlug(torneo.slug, torneo.nombre), numero),
    };
};

/** Igual que asignarFolioTorneo, para ligas. */
export const asignarFolioLiga = async (
    tx: Prisma.TransactionClient,
    idLiga: number
): Promise<FolioAsignado> => {
    const liga = await tx.infoLiga.update({
        where: { idLiga },
        data: { consecutivo_inscripciones: { increment: 1 } },
        select: { consecutivo_inscripciones: true, slug: true, nombre: true },
    });
    const numero = liga.consecutivo_inscripciones;
    return {
        numero_inscripcion: numero,
        folio: construirFolio('L', abreviarSlug(liga.slug, liga.nombre), numero),
    };
};
