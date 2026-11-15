import crypto from 'crypto';

/**
 * Identificador público y opaco de un jugador para URLs y consultas públicas.
 *
 * El id numérico no debe aparecer en una URL pública (se podría recorrer 1, 2, 3...). El token es
 * el id cifrado con AES-256-GCM y una clave derivada del secreto del servidor: no se puede adivinar
 * el de otro jugador ni obtener el id sin la clave. Es determinista (el mismo jugador siempre
 * tiene el mismo token), así que el enlace se puede compartir y guardar.
 */

const secreto = (): string => {
    const valor = process.env.FOLIO_SECRET || process.env.JWT_SECRET;
    if (!valor) throw new Error('Falta FOLIO_SECRET o JWT_SECRET para generar identificadores públicos');
    return valor;
};

const clave = (): Buffer => crypto.createHash('sha256').update(`jugador-publico:${secreto()}`).digest();

export const tokenDeJugador = (idJugador: number): string => {
    const id = Buffer.alloc(4);
    id.writeUInt32BE(idJugador, 0);
    // IV derivado del id: el token es estable. Con la clave secreta no es predecible desde fuera.
    const iv = crypto.createHmac('sha256', clave()).update(id).digest().subarray(0, 8);
    const cifrador = crypto.createCipheriv('aes-256-gcm', clave(), iv, { authTagLength: 8 });
    const cifrado = Buffer.concat([cifrador.update(id), cifrador.final()]);
    return Buffer.concat([iv, cifrado, cifrador.getAuthTag()]).toString('base64url');
};

/** Devuelve el id del jugador o null si el token no es válido. */
export const idDeToken = (token: string): number | null => {
    try {
        const bytes = Buffer.from(token, 'base64url');
        if (bytes.length !== 8 + 4 + 8) return null;
        const iv = bytes.subarray(0, 8);
        const cifrado = bytes.subarray(8, 12);
        const etiqueta = bytes.subarray(12);
        const descifrador = crypto.createDecipheriv('aes-256-gcm', clave(), iv, { authTagLength: 8 });
        descifrador.setAuthTag(etiqueta);
        const id = Buffer.concat([descifrador.update(cifrado), descifrador.final()]).readUInt32BE(0);
        return id > 0 ? id : null;
    } catch {
        return null;
    }
};
