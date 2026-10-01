import { createHmac, timingSafeEqual } from 'node:crypto';
import prisma from '../config/database';
import { NotFoundError } from '../middleware/error.middleware';

// Verificación de comprobantes de inscripción por folio.
//
// Los folios son consecutivos y por lo tanto adivinables (…-0041, …-0042). Para que nadie pueda
// recorrerlos y leer datos de jugadores, el QR del comprobante lleva además un código de verificación
// (HMAC del folio con un secreto del servidor): solo quien tiene el comprobante impreso/descargado
// puede ver el detalle. Un folio escrito a mano, sin código, solo confirma que existe.

const secreto = (): string => {
    const valor = process.env.FOLIO_SECRET || process.env.JWT_SECRET;
    if (!valor) throw new Error('Falta FOLIO_SECRET o JWT_SECRET para firmar los folios');
    return `folio:${valor}`;
};

/** Código de verificación del folio (64 bits en hexadecimal). No se guarda: se recalcula. */
export const firmarFolio = (folio: string): string =>
    createHmac('sha256', secreto()).update(folio).digest('hex').slice(0, 16);

const firmaValida = (folio: string, codigo?: string): boolean => {
    if (!codigo) return false;
    const esperado = Buffer.from(firmarFolio(folio));
    const recibido = Buffer.from(codigo);
    return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
};

/** Agrega el código de verificación a la inscripción recién creada (si tiene folio). */
export const conCodigoVerificacion = <T extends { folio?: string | null }>(inscripcion: T): T & { codigo_verificacion: string | null } => ({
    ...inscripcion,
    codigo_verificacion: inscripcion.folio ? firmarFolio(inscripcion.folio) : null,
});

const nombreCompleto = (j: { nombre: string; apellido1: string; apellido2: string | null }): string =>
    [j.nombre, j.apellido1, j.apellido2].filter(Boolean).join(' ');

interface DetalleFolio {
    tipo: 'torneo' | 'liga';
    folio: string;
    evento: string;
    lugar: string | null;
    fechaEvento: Date | null;
    seccion: string;
    jugador: string;
    fechaInscripcion: Date | null;
    pagoConfirmado: boolean;
    vigente: boolean;
}

/** Busca el folio en torneos o ligas según su prefijo (CMAA-T-… / CMAA-L-…). */
const buscarDetalle = async (folio: string): Promise<DetalleFolio | null> => {
    if (folio.startsWith('CMAA-T-')) {
        const i = await prisma.inscripcion.findUnique({
            where: { folio },
            select: {
                folio: true, estado: true, pago_confirmado: true, fecha_inscripcion: true,
                jugador:   { select: { nombre: true, apellido1: true, apellido2: true } },
                torneo:    { select: { nombre: true, lugar: true, fecha: true } },
                categoria: { select: { nombre: true } },
            },
        });
        if (!i?.folio) return null;
        return {
            tipo: 'torneo',
            folio: i.folio,
            evento: i.torneo.nombre ?? 'Torneo',
            lugar: i.torneo.lugar,
            fechaEvento: i.torneo.fecha,
            seccion: i.categoria?.nombre ?? '',
            jugador: nombreCompleto(i.jugador),
            fechaInscripcion: i.fecha_inscripcion,
            pagoConfirmado: i.pago_confirmado,
            vigente: i.estado !== 'cancelado',
        };
    }

    if (folio.startsWith('CMAA-L-')) {
        const i = await prisma.jugadorLiga.findUnique({
            where: { folio },
            select: {
                folio: true, estado: true, pago_confirmado: true, fecha_inscripcion: true,
                jugador: { select: { nombre: true, apellido1: true, apellido2: true } },
                liga:    { select: { nombre: true, lugar: true, fecha_inicio: true } },
                grupo:   { select: { nombre: true } },
            },
        });
        if (!i?.folio) return null;
        return {
            tipo: 'liga',
            folio: i.folio,
            evento: i.liga.nombre,
            lugar: i.liga.lugar,
            fechaEvento: i.liga.fecha_inicio,
            seccion: i.grupo.nombre,
            jugador: nombreCompleto(i.jugador),
            fechaInscripcion: i.fecha_inscripcion,
            pagoConfirmado: i.pago_confirmado,
            vigente: i.estado !== 'cancelado',
        };
    }

    return null;
};

/**
 * Verificación pública. Sin código: solo existencia y evento. Con código válido (el del QR):
 * detalle completo de la inscripción.
 */
export const verificarFolioPublico = async (folioCrudo: string, codigo?: string) => {
    const folio = folioCrudo.trim().toUpperCase();
    const detalle = await buscarDetalle(folio);
    if (!detalle) return { valido: false as const };

    const verificado = firmaValida(detalle.folio, codigo);
    return {
        valido: true as const,
        verificado,
        tipo: detalle.tipo,
        folio: detalle.folio,
        evento: detalle.evento,
        vigente: detalle.vigente,
        ...(verificado && {
            lugar: detalle.lugar,
            fechaEvento: detalle.fechaEvento,
            seccion: detalle.seccion,
            jugador: detalle.jugador,
            fechaInscripcion: detalle.fechaInscripcion,
            pagoConfirmado: detalle.pagoConfirmado,
        }),
    };
};

/** Datos para volver a emitir el comprobante desde el panel admin (incluye el código del QR). */
export const datosComprobante = async (folioCrudo: string) => {
    const folio = folioCrudo.trim().toUpperCase();
    const detalle = await buscarDetalle(folio);
    if (!detalle) throw new NotFoundError('Folio no encontrado');
    return { ...detalle, codigo_verificacion: firmarFolio(detalle.folio) };
};
