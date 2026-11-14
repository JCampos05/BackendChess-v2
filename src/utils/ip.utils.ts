import { Request } from 'express';

/**
 * IP del cliente para el historial de accesos y la bitácora.
 *
 * Usa `req.ip`, que Express calcula con `trust proxy` (ver app.ts): toma la IP que añadió el proxy de confianza
 * (Render) y NO lo que escriba el cliente. Leer la cabecera `X-Forwarded-For` a mano y quedarse con su primera
 * entrada sería falsificable: cualquiera puede enviar `X-Forwarded-For: 1.2.3.4` y quedar registrado con esa IP.
 */
export const obtenerIpCliente = (req?: Request): string | null => {
    if (!req) return null;
    const ip = req.ip ?? req.socket?.remoteAddress ?? '';
    if (!ip) return null;
    // IPv4 mapeada en IPv6 (::ffff:1.2.3.4) → 1.2.3.4
    return ip.replace(/^::ffff:/i, '').substring(0, 45);
};
