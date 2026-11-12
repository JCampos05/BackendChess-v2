import { Request, Response } from 'express';
import rateLimit, { Options } from 'express-rate-limit';
import { obtenerLimite } from '../services/rate-limit-config.service';

// Se cuentan por IP del cliente (server.ts configura `trust proxy` por el proxy de Render). Los contadores viven en
// memoria. El límite general y el de inscripción pública se ajustan desde el panel (Configuración > General) y se
// leen en cada petición, así el cambio aplica al instante. Los demás son de seguridad: variables de entorno o fijos.

const MINUTO = 60 * 1000;

/** Lee un entero positivo de una variable de entorno; si falta o es inválido, usa el valor por defecto. */
const entero = (nombre: string, porDefecto: number): number => {
    const valor = Number(process.env[nombre]);
    return Number.isInteger(valor) && valor > 0 ? valor : porDefecto;
};

/** Respuesta 429 con el mismo formato que el resto de errores de la API (`mensaje`). */
const crearRespuesta = (mensaje: string): Options['handler'] =>
    (req: Request, res: Response) => {
        const resetTime = (req as any).rateLimit?.resetTime as Date | undefined;
        const reintentarEnSegundos = resetTime
            ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
            : undefined;
        res.status(429).json({ ok: false, mensaje, code: 'RATE_LIMITED', reintentarEnSegundos });
    };

const base: Partial<Options> = {
    standardHeaders: true, // RateLimit-* y Retry-After
    legacyHeaders: false,
};

// ── General: todo el servidor ────────────────────────────────
// Generoso a propósito: varias personas pueden compartir una misma red (oficina del comité, sede de un torneo)
// y la aplicación hace varias peticiones por pantalla. Frena scripts y ataques de volumen, no el uso normal.
export const limitadorGeneral = rateLimit({
    ...base,
    windowMs: MINUTO,
    // Valor vigente: panel (base de datos) > variable de entorno > 300
    limit: () => obtenerLimite('generalPorMinuto'),
    // /health lo consulta Render constantemente; las peticiones OPTIONS son precomprobaciones de CORS
    skip: (req) => req.method === 'OPTIONS' || req.path === '/health',
    handler: crearRespuesta('Demasiadas peticiones. Espera un momento e intenta de nuevo.'),
});

// ── Inicio de sesión: contra adivinar contraseñas ────────────
// Solo cuentan los intentos fallidos (los inicios de sesión correctos no gastan el límite).
export const limitadorLoginPorIp = rateLimit({
    ...base,
    windowMs: 15 * MINUTO,
    limit: entero('RATE_LIMIT_LOGIN_FALLIDOS_POR_IP', 10),
    skipSuccessfulRequests: true,
    handler: crearRespuesta('Demasiados intentos fallidos de inicio de sesión. Intenta de nuevo en unos minutos.'),
});

// Además de la IP, se limita por teléfono: evita que alguien reparta los intentos entre muchas IPs para
// adivinar la contraseña de una misma cuenta.
export const limitadorLoginPorTelefono = rateLimit({
    ...base,
    windowMs: 15 * MINUTO,
    limit: entero('RATE_LIMIT_LOGIN_FALLIDOS_POR_TELEFONO', 15),
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const telefono = String(req.body?.telefono ?? '').replace(/\D/g, '');
        return telefono ? `tel:${telefono}` : `ip:${req.ip}`;
    },
    // La clave de teléfono no es una IP: se desactiva la validación que espera una IP en la clave
    validate: { keyGeneratorIpFallback: false },
    handler: crearRespuesta('Demasiados intentos fallidos para esta cuenta. Intenta de nuevo en unos minutos.'),
});

// ── Inscripciones públicas (crean datos sin iniciar sesión) ──
// Una persona real se inscribe pocas veces; esto frena a quien intente llenar cupos o saturar la base de datos.
export const limitadorInscripcionPublica = rateLimit({
    ...base,
    windowMs: 15 * MINUTO,
    // Valor vigente: panel (base de datos) > variable de entorno > 20
    limit: () => obtenerLimite('inscripcionPor15Min'),
    handler: crearRespuesta('Demasiadas solicitudes de inscripción desde tu conexión. Intenta de nuevo en unos minutos.'),
});

// ── Búsqueda pública de jugadores (evita recorrer el padrón) ─
export const limitadorBusquedaPublica = rateLimit({
    ...base,
    windowMs: MINUTO,
    limit: entero('RATE_LIMIT_BUSQUEDA_POR_MINUTO', 40),
    handler: crearRespuesta('Demasiadas búsquedas. Espera un momento e intenta de nuevo.'),
});

// ── Verificación pública de folios (evita recorrer folios) ───
export const limitadorVerificacionFolio = rateLimit({
    ...base,
    windowMs: MINUTO,
    limit: entero('RATE_LIMIT_VERIFICACION_POR_MINUTO', 30),
    handler: crearRespuesta('Demasiadas consultas. Intenta de nuevo en un minuto.'),
});
